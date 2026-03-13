/* Claude API Proxy — Accepts user-provided API key or uses server key */

const SERVER_KEY = process.env.ANTHROPIC_API_KEY || '';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"POST only"}' };

  try {
    const body = JSON.parse(event.body || '{}');
    const { messages, model, system, max_tokens, apiKey, tools, temperature } = body;

    // Use client-provided key first, fallback to server key
    const key = apiKey || SERVER_KEY;
    if (!key) {
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          error: true,
          message: 'No API key configured. Please enter your Anthropic API key in Settings.',
          needsKey: true
        })
      };
    }

    if (!messages || !messages.length) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: true, message: 'messages required' }) };
    }

    // Build Anthropic request
    const anthropicBody = {
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: max_tokens || 4096,
      messages,
    };
    if (system) anthropicBody.system = system;
    if (tools && tools.length) anthropicBody.tools = tools;
    if (typeof temperature === 'number') anthropicBody.temperature = temperature;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          error: true,
          message: data.error?.message || `API error ${res.status}`,
          type: data.error?.type || 'api_error',
          needsKey: res.status === 401,
        })
      };
    }

    // Extract text content
    let text = '';
    const contentBlocks = [];
    for (const block of (data.content || [])) {
      if (block.type === 'text') {
        text += block.text;
        contentBlocks.push({ type: 'text', text: block.text });
      } else if (block.type === 'tool_use') {
        contentBlocks.push({ type: 'tool_use', id: block.id, name: block.name, input: block.input });
      }
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        text,
        content: contentBlocks,
        model: data.model,
        usage: data.usage,
        stop_reason: data.stop_reason,
        id: data.id,
      })
    };
  } catch (e) {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ error: true, message: e.message || 'Unknown error' })
    };
  }
};
