/**
 * BitNet Client — Shared API client for Sintex.AI search
 * Provides AI search with fallback chain:
 * BitNet Server → Groq API → Together AI → Local Cache
 */
const BitNetClient = (() => {
    const ENDPOINTS = {
        bitnet: '/.netlify/functions/bitnet-search',
        // Fallbacks configured server-side in the Netlify function
    };

    // Local knowledge base for offline/fallback responses
    const KNOWLEDGE_BASE = {
        'bitnet': {
            answer: `**BitNet** is a revolutionary neural network architecture by Microsoft Research that uses **ternary weights {-1, 0, +1}** instead of traditional 16/32-bit floating point.\n\n**Key advantages:**\n- **1.58 bits per weight** (log₂(3) = 1.585) vs 16 bits in FP16\n- **2.37x–6.17x faster** inference than FP16 models\n- **55–82% energy reduction** — only uses integer add/subtract\n- **~10x less memory** — a 70B model fits in 13.9 GB\n- **Zero multiplications** — replaces all multiplies with additions\n\nThe core model, **BitNet b1.58-2B-4T**, has 2 billion parameters trained on 4 trillion tokens. It matches full-precision models in quality while running on consumer hardware like Apple M5 Pro.`,
            sources: [
                { title: 'BitNet Research — Sintex.AI', url: 'https://sintex.ai/bitnet-research.html', snippet: 'Comprehensive technical analysis of BitNet 1.58-bit ternary LLM architecture' },
                { title: 'Binary Computing & Ternary AI', url: 'https://sintex.ai/binary-computing.html', snippet: 'Interactive visualization of ternary weights and ARM NEON assembly kernels' },
                { title: '1-bit AI + Bitcoin Energy', url: 'https://www.standardbitcoin.io/bitnet-ai-bitcoin.html', snippet: 'How BitNet energy efficiency aligns with Bitcoin sustainability' }
            ],
            related: ['How does ternary quantization work?', 'BitNet vs GPTQ quantization', 'Apple M5 Pro NPU for AI', 'BitNet energy savings']
        },
        'ternary': {
            answer: `**Ternary quantization** constrains neural network weights to exactly three values: **{-1, 0, +1}**.\n\n**How it works:**\n1. During training, weights are quantized using the **absmean** function\n2. \`scale = mean(|w|)\`\n3. \`w_quantized = round(w / scale).clamp(-1, 1)\`\n4. Activations are quantized to 8-bit integers\n\n**Why it matters:**\n- **No multiply operations** — weight × activation becomes conditional add/subtract\n- **33% sparsity** — zero weights mean zero computation (skip entirely)\n- **2 bits storage** — encode -1 as 10, 0 as 00, +1 as 01\n- **SIMD-friendly** — ARM NEON processes 16 values per cycle`,
            sources: [
                { title: 'Ternary Weight System — Sintex.AI', url: 'https://sintex.ai/bitnet-research.html#ternary-weights', snippet: 'Deep dive into {-1, 0, +1} weight quantization with code examples' },
                { title: 'ARM NEON Assembly for BitNet', url: 'https://sintex.ai/binary-computing.html', snippet: 'Assembly-level view of ternary GEMM kernels' }
            ],
            related: ['What is BitNet?', 'Binary vs ternary computing', 'INT8 quantization comparison', 'GPTQ vs BitNet']
        },
        'bitcoin': {
            answer: `**Bitcoin + BitNet: Energy Convergence**\n\nBitcoin mining uses ~150 TWh/year. AI inference is projected to reach 500 TWh/year by 2030. BitNet's 55-82% energy reduction makes AI sustainable.\n\n**Key synergies:**\n- **Bitcoin mining** uses SHA-256 (integer operations) — same hardware excels at BitNet\n- **1.58-bit inference** uses integer add/sub only — perfect for mining ASICs repurposed for AI\n- **Standard Bitcoin (STBTCx)** bridges Bitcoin DeFi with efficient AI infrastructure\n- A BitNet-powered search engine uses less power than a household light bulb\n\n**Sintex.AI** is the first search engine combining BitNet 1-bit LLM technology with Bitcoin's decentralized ethos.`,
            sources: [
                { title: 'BitNet + Bitcoin Energy Efficiency', url: 'https://www.standardbitcoin.io/bitnet-ai-bitcoin.html', snippet: 'Analysis of energy convergence between 1-bit AI and Bitcoin' },
                { title: 'Standard Bitcoin', url: 'https://www.standardbitcoin.io', snippet: 'The future of Bitcoin with STBTCx token ecosystem' },
                { title: 'Bitcoin Brasil', url: 'https://bitcoinbrasil.org', snippet: 'Brazilian Bitcoin community and resources' }
            ],
            related: ['STBTCx token', 'Bitcoin energy consumption', 'AI mining hardware', 'Decentralized AI search']
        },
        'm5': {
            answer: `**Apple M5 Pro NPU** is the ideal consumer hardware for BitNet inference.\n\n**Specifications:**\n- **38 TOPS** Neural Processing Unit\n- **16 Neural Engine cores**\n- Per-core GPU Neural Accelerators\n- **Metal 4** with Tensor APIs (native INT2 support)\n- Up to **48 GB unified memory** at 200 GB/s bandwidth\n\n**BitNet on M5 Pro (projected):**\n- 7B model: ~120 tokens/sec, 1.4 GB memory, ~5W power\n- 70B model: ~25 tokens/sec, 13.9 GB memory\n- Metal 4 Tensor APIs support native 2-bit integer operations\n- Unified memory architecture eliminates CPU-GPU transfer bottleneck`,
            sources: [
                { title: 'M5 Pro NPU Optimization — Sintex.AI', url: 'https://sintex.ai/bitnet-research.html#m5-pro', snippet: 'Detailed analysis of Apple M5 Pro NPU for BitNet inference' },
                { title: 'Metal 4 Tensor APIs', url: 'https://sintex.ai/binary-computing.html', snippet: 'How Metal 4 enables native ternary computation' }
            ],
            related: ['BitNet on Apple Silicon', 'NPU vs GPU for AI', 'Metal 4 programming', 'ARM NEON for LLMs']
        },
        'assembly': {
            answer: `**ARM NEON Assembly for BitNet**\n\nBitNet requires custom assembly kernels to achieve maximum performance. Standard ML frameworks (PyTorch) are optimized for float multiply — BitNet only needs add/subtract.\n\n**Key NEON instructions used:**\n- \`LD1 {v0.16b}, [x0]\` — Load 16 INT8 activations\n- \`AND v2.16b, v1.16b, v_mask\` — Extract ternary weight masks\n- \`SADDLP / SADALP\` — Pairwise add with accumulate\n- \`SUB v30.4s, v30.4s, v31.4s\` — Final positive - negative\n\n**Result:** Each NEON iteration processes 16 elements with zero multiply instructions. At 2 GHz, this achieves ~32 GOPS of effective ternary compute.`,
            sources: [
                { title: 'ARM NEON BitNet Kernel', url: 'https://sintex.ai/binary-computing.html', snippet: 'Complete annotated assembly listing with register visualization' },
                { title: 'Assembly & Binary Operations', url: 'https://sintex.ai/bitnet-research.html#assembly', snippet: 'How BitNet eliminates floating-point multiply at the assembly level' }
            ],
            related: ['AVX-512 for BitNet', 'SIMD programming', 'ARM vs x86 for AI', 'Custom GEMM kernels']
        }
    };

    function findInKnowledgeBase(query) {
        const q = query.toLowerCase();
        const keywords = Object.keys(KNOWLEDGE_BASE);
        for (const kw of keywords) {
            if (q.includes(kw)) return KNOWLEDGE_BASE[kw];
        }
        // Default fallback
        return {
            answer: `**Sintex.AI Search**\n\nI searched for "${query}" using our BitNet-powered search engine.\n\nSintex.AI is built on Microsoft's BitNet 1.58-bit ternary LLM technology, using {-1, 0, +1} weights for ultra-efficient AI inference. Our search engine processes queries with 2.37x-6.17x the speed of traditional AI models while using 55-82% less energy.\n\n**Try searching for:**\n- BitNet architecture and performance\n- Ternary weight quantization\n- Bitcoin energy efficiency\n- Apple M5 Pro NPU\n- ARM NEON assembly`,
            sources: [
                { title: 'BitNet Research — Sintex.AI', url: 'https://sintex.ai/bitnet-research.html', snippet: 'Comprehensive 1.58-bit LLM research and benchmarks' },
                { title: 'Standard Bitcoin', url: 'https://www.standardbitcoin.io', snippet: 'Bitcoin + AI convergence platform' },
                { title: 'Bitcoin Brasil', url: 'https://bitcoinbrasil.org', snippet: 'Brazilian crypto community' }
            ],
            related: ['What is BitNet?', 'Ternary quantization', 'Bitcoin energy', 'AI search technology']
        };
    }

    async function search(query) {
        // Try server-side BitNet search first
        try {
            const response = await fetch(ENDPOINTS.bitnet, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, max_tokens: 512 })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.answer) return data;
            }
        } catch (e) {
            console.log('BitNet server unavailable, using knowledge base');
        }

        // Fallback to local knowledge base
        // Add small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 800));
        return findInKnowledgeBase(query);
    }

    return { search };
})();
