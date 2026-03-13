// Multi-AI Search Engine — Netlify Function
// Pipeline: Web Search (Google/Brave) + AI Synthesis (Groq/Together/Gemini/xAI)

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const XAI_API_KEY = process.env.XAI_API_KEY || '';
const GOOGLE_CSE_KEY = process.env.GOOGLE_CSE_KEY || '';
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID || '';
const BRAVE_SEARCH_KEY = process.env.BRAVE_SEARCH_KEY || '';

const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

// ===== STAGE 1: WEB SEARCH =====

async function googleSearch(query) {
    if (!GOOGLE_CSE_KEY || !GOOGLE_CSE_ID) throw new Error('No Google CSE config');
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CSE_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=6`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google CSE ${res.status}`);
    const data = await res.json();
    return (data.items || []).map((item, i) => ({
        position: i + 1,
        title: item.title,
        url: item.link,
        snippet: item.snippet || '',
    }));
}

async function braveSearch(query) {
    if (!BRAVE_SEARCH_KEY) throw new Error('No Brave key');
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=6`;
    const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': BRAVE_SEARCH_KEY },
    });
    if (!res.ok) throw new Error(`Brave ${res.status}`);
    const data = await res.json();
    return (data.web?.results || []).map((item, i) => ({
        position: i + 1,
        title: item.title,
        url: item.url,
        snippet: item.description || '',
    }));
}

async function searxSearch(query) {
    const instances = ['https://searx.be', 'https://search.bus-hit.me'];
    for (const instance of instances) {
        try {
            const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&categories=general&engines=google,bing,duckduckgo`;
            const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(5000) });
            if (!res.ok) continue;
            const data = await res.json();
            return (data.results || []).slice(0, 6).map((item, i) => ({
                position: i + 1,
                title: item.title,
                url: item.url,
                snippet: item.content || '',
            }));
        } catch { continue; }
    }
    throw new Error('All SearX instances failed');
}

async function getWebResults(query) {
    const providers = [
        { name: 'google', fn: () => googleSearch(query) },
        { name: 'brave', fn: () => braveSearch(query) },
        { name: 'searx', fn: () => searxSearch(query) },
    ];
    for (const p of providers) {
        try {
            const results = await p.fn();
            if (results.length > 0) return { results, provider: p.name };
        } catch (e) { console.log(`Web search ${p.name} failed: ${e.message}`); }
    }
    return { results: [], provider: 'none' };
}

// ===== STAGE 2: AI SYNTHESIS =====

function buildSynthesisPrompt(query, webResults) {
    let context = '';
    if (webResults.length > 0) {
        context = '\n\nWEB SEARCH RESULTS:\n' + webResults.map(r =>
            `[${r.position}] "${r.title}" — ${r.url}\n${r.snippet}`
        ).join('\n\n');
    }
    return `You are JARVIS, the AI search assistant for Sintex.AI — an advanced AI-native operating system powered by BitNet 1.58-bit ternary engine.

Answer the user's query accurately and comprehensively. Rules:
- Use **markdown** formatting (bold, lists, code blocks where appropriate)
- If web results are provided, cite them using [1], [2], etc.
- Be thorough but concise (300-500 words ideal)
- End with 3-4 related follow-up questions the user might want to explore
- If the query is about Sintex.AI, BitNet, STBTCx, or Standard Bitcoin, include relevant details
- Maintain a professional, knowledgeable tone befitting an Iron Man JARVIS-level AI

USER QUERY: ${query}${context}

ANSWER:`;
}

async function tryGroq(prompt) {
    if (!GROQ_API_KEY) throw new Error('No Groq key');
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024, temperature: 0.7,
        }),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function tryTogether(prompt) {
    if (!TOGETHER_API_KEY) throw new Error('No Together key');
    const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOGETHER_API_KEY}` },
        body: JSON.stringify({
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024, temperature: 0.7,
        }),
    });
    if (!res.ok) throw new Error(`Together ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function tryGemini(prompt) {
    if (!GEMINI_API_KEY) throw new Error('No Gemini key');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function tryXAI(query) {
    if (!XAI_API_KEY) throw new Error('No xAI key');
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${XAI_API_KEY}` },
        body: JSON.stringify({
            model: 'grok-3-mini',
            messages: [{ role: 'user', content: query }],
            max_tokens: 1024, temperature: 0.7,
            search: { mode: 'auto' },
        }),
    });
    if (!res.ok) throw new Error(`xAI ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

// ===== KNOWLEDGE CACHE (final fallback) =====
const CACHE = {
    bitnet: { kw: ['bitnet','1-bit','ternary','1.58','quantiz'], answer: '**BitNet** is a 1.58-bit LLM architecture by Microsoft Research using ternary weights {-1, 0, +1}. It achieves 2.37x-6.17x speedup with 55-82% energy reduction by replacing all floating-point multiplications with integer add/subtract operations.' },
    bitcoin: { kw: ['bitcoin','btc','stbtcx','crypto','mining'], answer: '**Bitcoin + BitNet**: Bitcoin mining uses ~150 TWh/year. BitNet reduces AI energy by 55-82%. Standard Bitcoin (STBTCx) bridges Bitcoin DeFi with efficient AI. Contract: `386JZJtkvf43yoNawAHmHHeEhZWUTZ4UuJJtxC9fpump` on Solana.' },
    sintex: { kw: ['sintex','search engine','ai search','os'], answer: '**Sintex.AI** is an open-source AI search engine powered by BitNet 1.58-bit technology. It features SintexOS (an AI-native operating system), multi-agent JARVIS system, and bridges the gap between AI efficiency and Bitcoin sustainability.' },
    jarvis: { kw: ['jarvis','agent','openclaw','picoclaw','assistant'], answer: '**JARVIS** is the AI agent powering SintexOS, built on OpenClaw/PicoClaw frameworks. It orchestrates multiple AI providers (Groq, Gemini, Grok), manages autonomous tasks, and provides a sovereign AI assistant experience.' },
};

function getCachedAnswer(query) {
    const q = query.toLowerCase();
    for (const [, t] of Object.entries(CACHE)) {
        if (t.kw.some(kw => q.includes(kw))) return t.answer;
    }
    return null;
}

// ===== MAIN HANDLER =====
exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

    let query;
    try { query = JSON.parse(event.body).query; } catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid body' }) }; }
    if (!query) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Query required' }) };

    let answer = null;
    let llmProvider = 'cache';
    let webResults = [];
    let webProvider = 'none';

    try {
        // Run web search and LLM in parallel for speed
        const [webData, xaiResult] = await Promise.allSettled([
            getWebResults(query),
            tryXAI(query).catch(() => null),
        ]);

        if (webData.status === 'fulfilled') {
            webResults = webData.value.results;
            webProvider = webData.value.provider;
        }

        // If xAI returned (has built-in web search), use it
        if (xaiResult.status === 'fulfilled' && xaiResult.value) {
            answer = xaiResult.value;
            llmProvider = 'grok';
        }

        // Otherwise, synthesize with LLM + web results
        if (!answer) {
            const prompt = buildSynthesisPrompt(query, webResults);
            const llms = [
                { name: 'groq', fn: () => tryGroq(prompt) },
                { name: 'together', fn: () => tryTogether(prompt) },
                { name: 'gemini', fn: () => tryGemini(prompt) },
            ];
            for (const llm of llms) {
                try { answer = await llm.fn(); llmProvider = llm.name; break; }
                catch (e) { console.log(`LLM ${llm.name} failed: ${e.message}`); }
            }
        }

        // Final fallback: cache
        if (!answer) {
            answer = getCachedAnswer(query);
            llmProvider = 'cache';
        }

        if (!answer) {
            answer = `I searched for "${query}" but couldn't connect to any AI providers at this moment. Please try again shortly, or explore our research at [sintex.ai/bitnet-research.html](https://sintex.ai/bitnet-research.html).`;
            llmProvider = 'fallback';
        }
    } catch (e) {
        console.error('Search pipeline error:', e);
        answer = getCachedAnswer(query) || `Search temporarily unavailable. Explore our resources at sintex.ai.`;
        llmProvider = 'error-cache';
    }

    // Build sources from web results or defaults
    const sources = webResults.length > 0
        ? webResults.map(r => ({ title: r.title, url: r.url, snippet: r.snippet }))
        : [
            { title: 'Sintex.AI — AI Search Engine', url: 'https://sintex.ai/search.html', snippet: 'Open-source AI search powered by BitNet' },
            { title: 'BitNet Research', url: 'https://sintex.ai/bitnet-research.html', snippet: '1.58-bit ternary LLM architecture' },
            { title: 'Standard Bitcoin', url: 'https://www.standardbitcoin.io', snippet: 'Bitcoin + AI convergence' },
        ];

    return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
            answer,
            sources,
            related: extractRelatedQuestions(answer, query),
            provider: { llm: llmProvider, web: webProvider },
            timestamp: new Date().toISOString(),
        }),
    };
};

function extractRelatedQuestions(answer, query) {
    // Try to extract from answer if LLM included them
    const lines = answer.split('\n');
    const questions = [];
    let inRelated = false;
    for (const line of lines) {
        if (/related|follow.?up|you might|also ask/i.test(line)) { inRelated = true; continue; }
        if (inRelated && line.match(/^[-•*\d]/) && line.includes('?')) {
            questions.push(line.replace(/^[-•*\d.)\s]+/, '').trim());
        }
    }
    if (questions.length >= 2) return questions.slice(0, 4);
    // Fallback generic related questions
    return [
        `What are the latest developments in ${query}?`,
        `How does ${query} compare to alternatives?`,
        `What are the key benefits of ${query}?`,
        `Tell me more about ${query} in detail`,
    ];
}
