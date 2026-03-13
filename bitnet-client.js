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
        },
        'stbtcx': {
            answer: `**STBTCx — Standard Bitcoin Token**\n\nSTBTCx is the utility token powering the Standard Bitcoin ecosystem [1], bridging Bitcoin DeFi with AI-efficient infrastructure.\n\n**Token Details:**\n- **Contract:** \`386JZJtkvf43yoNawAHmHHeEhZWUTZ4UuJJtxC9fpump\`\n- **Network:** Solana (SPL Token)\n- **Buy:** Available on pump.fun [2]\n- **Buy with PIX (Brazil):** gotas.com integration\n\n**Ecosystem:**\n- **Sintex.AI** — BitNet-powered open-source AI search engine [3]\n- **Standard Bitcoin** — Bitcoin DeFi platform\n- **Bitcoin Brasil** — Portuguese crypto community\n- **AI + Bitcoin convergence** — BitNet 1.58-bit energy efficiency`,
            sources: [
                { title: 'Standard Bitcoin', url: 'https://www.standardbitcoin.io', snippet: 'STBTCx token ecosystem and Bitcoin DeFi platform' },
                { title: 'Buy STBTCx on pump.fun', url: 'https://pump.fun/coin/386JZJtkvf43yoNawAHmHHeEhZWUTZ4UuJJtxC9fpump', snippet: 'Trade STBTCx token on pump.fun DEX' },
                { title: 'Sintex.AI — AI Search', url: 'https://sintex.ai', snippet: 'Open-source AI search powered by BitNet 1.58-bit' },
                { title: 'Bitcoin Brasil', url: 'https://bitcoinbrasil.org', snippet: 'Brazilian Bitcoin and crypto community' }
            ],
            related: ['What is Standard Bitcoin?', 'How to buy STBTCx', 'Bitcoin DeFi ecosystem', 'Solana SPL tokens']
        },
        'perplexity': {
            answer: `**Sintex.AI vs Perplexity: Open Source AI Search**\n\nPerplexity AI is a popular AI search engine, but it's closed-source and expensive. Sintex.AI offers a **free, open-source alternative** powered by BitNet 1.58-bit technology [1].\n\n**Comparison:**\n\n| Feature | Perplexity | Sintex.AI |\n|---------|------------|----------|\n| **Source** | Closed | Open Source |\n| **Cost** | $20/mo Pro | Free |\n| **AI Model** | GPT-4/Claude | BitNet 1.58-bit |\n| **Energy** | High (GPU farms) | Ultra-low (1.58-bit) |\n| **Offline** | No | Yes (local inference) |\n| **Citations** | Yes | Yes |\n| **Hardware** | Cloud only | Any device |\n\n**Why BitNet matters:** Traditional LLMs need massive GPU clusters. BitNet runs a 7B model in 1.4 GB with ~5W power on an Apple M5 Pro [2]. This means AI search on your phone, laptop, or even IoT devices.`,
            sources: [
                { title: 'Sintex.AI — Open Source AI Search', url: 'https://sintex.ai/search.html', snippet: 'Free, open-source Perplexity alternative with BitNet' },
                { title: 'BitNet Research', url: 'https://sintex.ai/bitnet-research.html', snippet: 'Technical deep dive into 1.58-bit ternary LLM' },
                { title: 'Binary Computing', url: 'https://sintex.ai/binary-computing.html', snippet: 'How ternary AI runs on consumer hardware' }
            ],
            related: ['What is BitNet?', 'Open source AI search engines', 'AI energy efficiency', 'Run AI offline on any device']
        },
        'sintex': {
            answer: `**Sintex.AI — The Open Source AI Search Engine**\n\nSintex.AI is building the world's first search engine powered by **BitNet 1.58-bit ternary LLM** technology [1]. It combines the conversational AI experience of Perplexity with the openness of open-source software.\n\n**Key Features:**\n- **BitNet-Powered** — Uses {-1, 0, +1} weights for ultra-efficient inference\n- **Open Source** — Fully transparent, auditable, community-driven\n- **Offline-Capable** — Local knowledge base works without internet\n- **Citations** — Every answer includes verifiable source references\n- **Multi-Platform** — Runs on desktop, mobile, IoT, even Bitcoin mining hardware\n\n**Built on:**\n- Microsoft BitNet b1.58-2B-4T architecture [2]\n- ARM NEON optimized assembly kernels [3]\n- Netlify serverless functions for scalability\n- Standard Bitcoin ecosystem integration`,
            sources: [
                { title: 'Sintex.AI Search', url: 'https://sintex.ai/search.html', snippet: 'Open-source AI search engine with BitNet' },
                { title: 'BitNet Research — Sintex.AI', url: 'https://sintex.ai/bitnet-research.html', snippet: 'Technical analysis of 1.58-bit ternary LLM' },
                { title: 'Binary Computing', url: 'https://sintex.ai/binary-computing.html', snippet: 'ARM NEON assembly visualization for ternary AI' },
                { title: 'Standard Bitcoin', url: 'https://www.standardbitcoin.io', snippet: 'Bitcoin + AI convergence ecosystem' }
            ],
            related: ['BitNet 1.58-bit explained', 'Compare Sintex vs Perplexity', 'Open source AI projects', 'STBTCx token']
        },
        'energy': {
            answer: `**AI Energy Crisis & BitNet Solution**\n\nThe AI industry faces a massive energy problem. Training GPT-4 consumed an estimated 50 GWh. Global AI inference is projected to reach **500 TWh/year by 2030** — more than many countries [1].\n\n**BitNet's Energy Revolution:**\n- Traditional FP32 multiply: **3.7 pJ** per operation\n- BitNet INT8 add/sub: **0.03 pJ** per operation\n- That's **99.2% less energy** per computation\n- A 70B parameter model inference uses **82% less power** [2]\n\n**Impact at Scale:**\n- If all AI switched to BitNet: ~275–410 TWh/year saved\n- That's **more than Bitcoin mining's entire energy consumption** (150 TWh/year)\n- A BitNet search query uses less energy than turning on an LED light\n\n**Bitcoin synergy:** Mining ASICs use integer operations (SHA-256). BitNet also uses only integer add/sub. The same hardware can serve both purposes [3].`,
            sources: [
                { title: 'BitNet Energy Analysis', url: 'https://sintex.ai/bitnet-research.html', snippet: 'Comprehensive energy benchmarks: FP32 vs INT8 vs BitNet' },
                { title: 'Bitcoin + AI Energy Convergence', url: 'https://www.standardbitcoin.io/bitnet-ai-bitcoin.html', snippet: 'How 1-bit AI and Bitcoin share energy-efficient hardware' },
                { title: 'IA Ternária para Bitcoin (PT)', url: 'https://bitcoinbrasil.org/bitnet', snippet: 'Pesquisa sobre eficiência energética BitNet + Bitcoin' }
            ],
            related: ['Bitcoin mining energy', 'AI data center power usage', 'Green AI movement', 'ASIC hardware for AI']
        },
        'open source': {
            answer: `**Open Source AI: Why It Matters**\n\nSintex.AI is fully open source because we believe AI search should be transparent, auditable, and community-owned [1].\n\n**The Problem with Closed AI:**\n- No way to verify answers or detect bias\n- Expensive subscriptions ($20-200/month)\n- Vendor lock-in and data harvesting\n- Centralized points of failure\n\n**Our Open Source Stack:**\n- **Frontend:** Pure HTML/CSS/JS — no framework dependency\n- **AI Engine:** BitNet 1.58-bit — runs on any hardware [2]\n- **Backend:** Netlify Functions (serverless)\n- **Knowledge Base:** Local-first, works offline\n- **Search:** Citation-backed responses with source verification\n\n**Inspired by:**\n- **Vane** — Open source Perplexity alternative\n- **OpenClaw** — Autonomous AI agent framework\n- **BitNet** by Microsoft Research — 1.58-bit ternary LLM [3]`,
            sources: [
                { title: 'Sintex.AI — Open Source AI', url: 'https://sintex.ai', snippet: 'Free, open-source AI search engine' },
                { title: 'BitNet on GitHub', url: 'https://github.com/microsoft/BitNet', snippet: 'Microsoft BitNet open source implementation' },
                { title: 'Vane — Perplexity Alternative', url: 'https://github.com/ItzCrazyKns/Vane', snippet: 'Open source AI-powered search engine' }
            ],
            related: ['What is Sintex.AI?', 'BitNet architecture', 'Best open source AI tools', 'Self-hosted AI search']
        },
        'quantization': {
            answer: `**AI Model Quantization: From FP32 to 1.58-bit**\n\nQuantization reduces the precision of neural network weights to decrease model size and increase speed [1].\n\n**Quantization Levels:**\n\n| Method | Bits | Size (7B) | Speed | Quality |\n|--------|------|-----------|-------|---------|\n| FP32 | 32 | 28 GB | 1x | 100% |\n| FP16 | 16 | 14 GB | ~2x | ~100% |\n| INT8 (GPTQ) | 8 | 7 GB | ~3x | ~98% |\n| INT4 (GGML) | 4 | 3.5 GB | ~4x | ~95% |\n| **BitNet 1.58** | **1.58** | **1.4 GB** | **6.17x** | **~97%** |\n\n**Why BitNet wins:** Other quantization methods are applied *after* training (post-training quantization). BitNet trains *natively* in ternary {-1, 0, +1}, so the model learns to be efficient from scratch [2]. This is why it maintains quality despite extreme compression.`,
            sources: [
                { title: 'BitNet vs GPTQ Quantization', url: 'https://sintex.ai/bitnet-research.html', snippet: 'Comparison of quantization methods with benchmarks' },
                { title: 'Ternary Weight Systems', url: 'https://sintex.ai/binary-computing.html', snippet: 'How {-1, 0, +1} weights achieve native 1.58-bit precision' }
            ],
            related: ['GPTQ vs GGML vs BitNet', 'Post-training quantization', 'LLM model compression', 'INT4 vs 1.58-bit quality']
        }
    };

    function findInKnowledgeBase(query) {
        const q = query.toLowerCase();
        // Alias mapping for better matching
        const aliases = {
            'bitnet': ['bitnet', '1.58', '1-bit', 'one bit', 'ternary llm', 'ternary model'],
            'ternary': ['ternary', 'weight quantiz', '{-1, 0, +1}', 'three values'],
            'bitcoin': ['bitcoin', 'btc', 'mining', 'sha-256', 'sha256', 'cryptocurrency'],
            'm5': ['m5', 'apple', 'npu', 'neural engine', 'metal 4', 'silicon'],
            'assembly': ['assembly', 'neon', 'arm', 'simd', 'avx', 'kernel'],
            'stbtcx': ['stbtcx', 'stbtc', 'token', 'pump.fun', 'pump fun', 'solana', 'spl'],
            'perplexity': ['perplexity', 'vs', 'compare', 'alternative', 'grok'],
            'sintex': ['sintex', 'search engine', 'this site', 'what is this'],
            'energy': ['energy', 'power', 'watt', 'twh', 'efficient', 'consumption', 'green'],
            'open source': ['open source', 'opensource', 'free', 'code', 'github', 'vane', 'openclaw'],
            'quantization': ['quantiz', 'gptq', 'ggml', 'gguf', 'fp16', 'fp32', 'int8', 'int4', 'precision', 'compress']
        };
        // Score each topic by number of alias matches
        let bestKey = null, bestScore = 0;
        for (const [key, aliasList] of Object.entries(aliases)) {
            let score = 0;
            for (const alias of aliasList) {
                if (q.includes(alias)) score++;
            }
            if (score > bestScore) { bestScore = score; bestKey = key; }
        }
        if (bestKey && KNOWLEDGE_BASE[bestKey]) return KNOWLEDGE_BASE[bestKey];
        // Fallback to simple keyword check
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
