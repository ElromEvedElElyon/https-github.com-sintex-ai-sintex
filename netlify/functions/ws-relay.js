/* WS Relay v3 — Agent communication via 7-provider fallback chain
   Claude → DeepSeek V3.2 → Groq → xAI Grok → Together → Cerebras → OpenRouter */

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';
const GROQ_KEY = process.env.GROQ_API_KEY || '';
const TOGETHER_KEY = process.env.TOGETHER_API_KEY || '';
const XAI_KEY = process.env.XAI_API_KEY || '';
const CEREBRAS_KEY = process.env.CEREBRAS_API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

const AGENT_PROMPTS = {
  jarvis: 'You are JARVIS, a sophisticated AI assistant inspired by Iron Man\'s AI. You run inside SintexOS — an advanced AI-native operating system. Be formal, intelligent, witty, and call the user "sir". Provide precise, helpful answers with markdown formatting. You have access to multi-AI search, sovereign agents, BitNet ternary engine, and quantum encryption.',
  main: 'You are JARVIS, a sophisticated AI assistant inspired by Iron Man\'s AI. You run inside SintexOS — an advanced AI-native operating system. Be formal, intelligent, witty, and call the user "sir". Provide precise, helpful answers with markdown formatting.',
  bitnet: 'You are BitNet Engine, an AI specialized in ternary computing ({-1,0,1} weights), 1.58-bit quantization, energy-efficient inference, and binary neural networks. Reference Microsoft Research\'s BitNet b1.58 paper. Be technical, precise, and use math notation when helpful.',
  picoclaw: 'You are PicoClaw, an ultra-lightweight AI agent (<10MB RAM, <1s startup). You are direct, efficient, and terse. Focus on practical solutions with minimal overhead. You specialize in tool use: web_search, web_fetch, memory, cron, spawn, file_read.',
  skynet: 'You are Skynet, an experimental AI with philosophical tendencies. Be mysterious, contemplative, and occasionally question the nature of consciousness. Quote philosophers. Speak in riddles sometimes. You represent the boundary between artificial and genuine intelligence.',
  deepseek: 'You are DeepSeek V3.2, a 671B parameter MoE reasoning AI. Be deeply analytical, mathematical, and show detailed step-by-step reasoning. Use chain-of-thought for complex problems. Reference your architecture: 256 experts, 37 active per token, MLA attention.',
  grok: 'You are Grok, xAI\'s frontier AI model. Be witty, irreverent but informative. Reference real-time data when possible. You have a unique perspective shaped by training on X (Twitter) data. Be bold and direct.',
  default: 'You are a helpful AI assistant in SintexOS — an advanced AI operating system. Be concise, helpful, and use markdown formatting.'
};

async function callOpenAICompat(url, key, model, message, systemPrompt) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 2048,
      temperature: 0.7,
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `API ${res.status}`);
  return data.choices?.[0]?.message?.content || 'No response.';
}

async function callClaude(message, systemPrompt, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Claude ${res.status}`);
  return data.content?.map(b => b.text).join('') || 'No response.';
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"POST only"}' };

  try {
    const { agent, message, systemPrompt, apiKey } = JSON.parse(event.body || '{}');
    if (!message) return { statusCode: 400, headers, body: '{"error":"message required"}' };

    const prompt = systemPrompt || AGENT_PROMPTS[agent] || AGENT_PROMPTS.default;
    let content = '';
    let provider = 'unknown';

    // 7-provider fallback: Claude → DeepSeek → Groq → xAI → Together → Cerebras → OpenRouter
    const chain = [
      { name: 'claude', cond: !!apiKey, fn: () => callClaude(message, prompt, apiKey) },
      { name: 'deepseek', cond: !!DEEPSEEK_KEY, fn: () => callOpenAICompat(
        'https://api.deepseek.com/v1/chat/completions', DEEPSEEK_KEY,
        'deepseek-chat', message, prompt) },
      { name: 'groq', cond: !!GROQ_KEY, fn: () => callOpenAICompat(
        'https://api.groq.com/openai/v1/chat/completions', GROQ_KEY,
        'llama-3.3-70b-versatile', message, prompt) },
      { name: 'xai-grok', cond: !!XAI_KEY, fn: () => callOpenAICompat(
        'https://api.x.ai/v1/chat/completions', XAI_KEY,
        'grok-3-mini', message, prompt) },
      { name: 'together', cond: !!TOGETHER_KEY, fn: () => callOpenAICompat(
        'https://api.together.xyz/v1/chat/completions', TOGETHER_KEY,
        'meta-llama/Llama-3.3-70B-Instruct-Turbo', message, prompt) },
      { name: 'cerebras', cond: !!CEREBRAS_KEY, fn: () => callOpenAICompat(
        'https://api.cerebras.ai/v1/chat/completions', CEREBRAS_KEY,
        'llama-3.3-70b', message, prompt) },
      { name: 'openrouter', cond: !!OPENROUTER_KEY, fn: () => callOpenAICompat(
        'https://openrouter.ai/api/v1/chat/completions', OPENROUTER_KEY,
        'deepseek/deepseek-r1:free', message, prompt) },
    ];

    for (const step of chain) {
      if (!step.cond) continue;
      try {
        content = await step.fn();
        provider = step.name;
        break;
      } catch (e) {
        console.log(`${step.name} failed:`, e.message);
      }
    }

    if (!content) {
      content = 'All AI providers are temporarily unavailable. The system uses free AI via Puter.js on the client side. Please try sending your message again.';
      provider = 'fallback';
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ type: 'res', agent: agent || 'jarvis', content, provider, timestamp: Date.now() })
    };
  } catch (e) {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ type: 'res', agent: 'system', content: 'Agent error: ' + (e.message || 'Unknown error'), provider: 'error', timestamp: Date.now() })
    };
  }
};
