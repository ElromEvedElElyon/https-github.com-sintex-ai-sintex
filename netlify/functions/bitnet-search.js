// BitNet Search — Netlify Function
// Proxies search queries to BitNet inference server with fallback chain

const BITNET_SERVER = process.env.BITNET_SERVER_URL || 'http://localhost:8080';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '';

// Knowledge base for cached/offline responses
const KNOWLEDGE = {
    bitnet: {
        keywords: ['bitnet', '1-bit', 'ternary', '1.58', 'quantiz'],
        answer: 'BitNet is a revolutionary 1.58-bit LLM architecture by Microsoft Research using ternary weights {-1, 0, +1}. It achieves 2.37x-6.17x speedup over FP16 models with 55-82% energy reduction. The key innovation is replacing all floating-point multiplications with simple integer additions and subtractions, making AI inference dramatically more efficient.',
    },
    bitcoin: {
        keywords: ['bitcoin', 'btc', 'stbtcx', 'crypto', 'mining', 'energy'],
        answer: 'Bitcoin mining consumes ~150 TWh/year. BitNet\'s 1.58-bit technology reduces AI energy consumption by 55-82%, creating a powerful synergy with Bitcoin\'s sustainability goals. Standard Bitcoin (STBTCx) bridges Bitcoin DeFi with efficient AI infrastructure. Sintex.AI is the first search engine combining BitNet with Bitcoin\'s decentralized ethos.',
    },
    m5pro: {
        keywords: ['m5', 'apple', 'npu', 'neural', 'metal'],
        answer: 'The Apple M5 Pro features a 38 TOPS Neural Processing Unit with 16 Neural Engine cores, Metal 4 Tensor APIs with native INT2 support, and up to 48 GB unified memory at 200 GB/s. BitNet on M5 Pro can run a 7B model at ~120 tokens/sec using only 1.4 GB memory and ~5W power.',
    },
    assembly: {
        keywords: ['assembly', 'neon', 'arm', 'simd', 'avx', 'kernel'],
        answer: 'BitNet uses custom ARM NEON and x86 AVX-512 assembly kernels for maximum performance. Ternary weights are decoded using bit masking operations, then conditional add/subtract replaces all multiply-accumulate. Each NEON iteration processes 16 elements with zero floating-point instructions.',
    },
};

function findCachedAnswer(query) {
    const q = query.toLowerCase();
    for (const [, topic] of Object.entries(KNOWLEDGE)) {
        if (topic.keywords.some(kw => q.includes(kw))) {
            return topic.answer;
        }
    }
    return null;
}

function buildPrompt(query) {
    return `You are Sintex.AI, an AI search engine powered by BitNet 1.58-bit ternary LLM technology. Answer the following search query concisely and accurately. Use markdown formatting. Focus on providing factual, helpful information.

Query: ${query}

Answer:`;
}

async function tryBitNet(query) {
    const response = await fetch(`${BITNET_SERVER}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [{ role: 'user', content: buildPrompt(query) }],
            max_tokens: 512,
            temperature: 0.7,
        }),
    });
    if (!response.ok) throw new Error('BitNet server error');
    const data = await response.json();
    return data.choices[0].message.content;
}

async function tryGroq(query) {
    if (!GROQ_API_KEY) throw new Error('No Groq API key');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: buildPrompt(query) }],
            max_tokens: 512,
            temperature: 0.7,
        }),
    });
    if (!response.ok) throw new Error('Groq API error');
    const data = await response.json();
    return data.choices[0].message.content;
}

async function tryTogether(query) {
    if (!TOGETHER_API_KEY) throw new Error('No Together API key');
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
            messages: [{ role: 'user', content: buildPrompt(query) }],
            max_tokens: 512,
            temperature: 0.7,
        }),
    });
    if (!response.ok) throw new Error('Together API error');
    const data = await response.json();
    return data.choices[0].message.content;
}

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let query;
    try {
        const body = JSON.parse(event.body);
        query = body.query;
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
    }

    if (!query || typeof query !== 'string') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Query is required' }) };
    }

    let answer = null;
    let source = 'cache';

    // Fallback chain: BitNet → Groq → Together → Cache
    const providers = [
        { name: 'bitnet', fn: () => tryBitNet(query) },
        { name: 'groq', fn: () => tryGroq(query) },
        { name: 'together', fn: () => tryTogether(query) },
    ];

    for (const provider of providers) {
        try {
            answer = await provider.fn();
            source = provider.name;
            break;
        } catch (e) {
            console.log(`${provider.name} failed: ${e.message}`);
        }
    }

    // Final fallback: cached knowledge base
    if (!answer) {
        answer = findCachedAnswer(query);
        source = 'cache';
    }

    if (!answer) {
        answer = `Sintex.AI searched for "${query}". Our BitNet inference engine is being set up. In the meantime, explore our research at sintex.ai/bitnet-research.html for comprehensive information on 1.58-bit ternary LLM technology.`;
        source = 'default';
    }

    // Build response with relevant sources
    const sources = [
        { title: 'BitNet Research — Sintex.AI', url: 'https://sintex.ai/bitnet-research.html', snippet: '1.58-bit ternary LLM architecture analysis' },
        { title: 'Binary Computing', url: 'https://sintex.ai/binary-computing.html', snippet: 'Ternary weight visualization & assembly kernels' },
        { title: 'Standard Bitcoin', url: 'https://www.standardbitcoin.io', snippet: 'Bitcoin + AI convergence platform' },
    ];

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            answer,
            source,
            sources,
            related: [
                'What is BitNet 1.58-bit?',
                'Ternary weight quantization',
                'Apple M5 Pro for AI',
                'Bitcoin energy efficiency',
            ],
        }),
    };
};
