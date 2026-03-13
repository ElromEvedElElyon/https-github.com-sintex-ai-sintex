/* AI Brain v3.0 — Multi-model intelligent router
   Priority: DeepSeek V3.2 (best free) → Groq (fastest) → Together → Gemini → Grok → Cerebras → OpenRouter
   All OpenAI-compatible APIs unified through callProvider() */

async function callProvider(url, key, model, query, systemPrompt, maxTokens) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: maxTokens || 2048,
      temperature: 0.7
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

async function tryGemini(query, systemPrompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + query }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// Provider configurations — ordered by quality
const PROVIDERS = [
  {
    name: 'deepseek',
    url: 'https://api.deepseek.com/v1/chat/completions',
    key: () => process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat', // V3.2 — closest to Claude quality
  },
  {
    name: 'groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: () => process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  },
  {
    name: 'together',
    url: 'https://api.together.xyz/v1/chat/completions',
    key: () => process.env.TOGETHER_API_KEY,
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  },
  {
    name: 'gemini',
    custom: true, // Uses Google's non-OpenAI API
  },
  {
    name: 'grok',
    url: 'https://api.x.ai/v1/chat/completions',
    key: () => process.env.XAI_API_KEY,
    model: 'grok-3-mini',
  },
  {
    name: 'cerebras',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    key: () => process.env.CEREBRAS_API_KEY,
    model: 'llama-3.3-70b',
  },
  {
    name: 'openrouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    key: () => process.env.OPENROUTER_API_KEY,
    model: 'deepseek/deepseek-r1:free', // Best free model on OpenRouter
  },
];

// Model name aliases for direct routing
const MODEL_ALIASES = {
  deepseek: 'deepseek', 'deepseek-v3': 'deepseek', 'deepseek-chat': 'deepseek',
  groq: 'groq', llama: 'groq',
  together: 'together',
  gemini: 'gemini',
  grok: 'grok', xai: 'grok',
  cerebras: 'cerebras',
  openrouter: 'openrouter',
};

const SYSTEM_PROMPT = `You are JARVIS, the Sintex.AI multi-model brain. You have access to 8 AI providers: Claude 4.6, DeepSeek V3.2 671B, xAI Grok 3, Llama 3.3 70B (Groq/Together/Cerebras), Gemini 2.0 Flash, and OpenRouter (28+ free models including DeepSeek R1 and Qwen3 Coder 480B). Answer comprehensively with markdown formatting. Be precise, knowledgeable, and helpful.`;

async function routeToProvider(providerName, query, sp) {
  const p = PROVIDERS.find(x => x.name === providerName);
  if (!p) return null;
  if (p.custom && p.name === 'gemini') return tryGemini(query, sp);
  const key = p.key();
  if (!key) return null;
  return callProvider(p.url, key, p.model, query, sp);
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
    const { query, model, systemPrompt } = JSON.parse(event.body || '{}');
    if (!query) return { statusCode: 400, headers, body: '{"error":"query required"}' };

    const sp = systemPrompt || SYSTEM_PROMPT;
    let answer = null, provider = null;

    // Direct routing if model specified
    if (model && MODEL_ALIASES[model]) {
      try {
        answer = await routeToProvider(MODEL_ALIASES[model], query, sp);
        if (answer) provider = MODEL_ALIASES[model];
      } catch {}
    }

    // Smart fallback chain: best quality → fastest → widest
    if (!answer) {
      for (const p of PROVIDERS) {
        try {
          if (p.custom && p.name === 'gemini') {
            answer = await tryGemini(query, sp);
          } else {
            const key = p.key();
            if (!key) continue;
            answer = await callProvider(p.url, key, p.model, query, sp);
          }
          if (answer) { provider = p.name; break; }
        } catch { continue; }
      }
    }

    if (!answer) {
      answer = 'All AI models are currently unavailable. Please try again later.';
      provider = 'fallback';
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ answer, provider, model: model || 'auto', timestamp: Date.now() })
    };
  } catch (e) {
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: 'Internal error', message: e.message })
    };
  }
};
