/**
 * AI Provider Streaming Verification Script
 * Tests both direct SDK Gemini streaming and API route HTTP endpoints.
 *
 * Run: npx tsx scratch/verify-ai-stream.ts
 */
import dotenv from 'dotenv'
import path from 'path'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

// ── Helper: call the API route ────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000'

async function callChatRoute(userMessage: string, label: string) {
  console.log(`\n── ${label} ${'─'.repeat(Math.max(0, 50 - label.length))}`)
  console.log(`  user: "${userMessage}"`)

  const problem = {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
  }
  const code = `var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) return [map.get(complement), i];\n        map.set(nums[i], i);\n    }\n    return [];\n};`

  try {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
        problem,
        code,
        language: 'javascript',
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const text = await res.text()
      console.log(`  ✗ HTTP ${res.status}: ${text.slice(0, 200)}`)
      return
    }

    const contentType = res.headers.get('content-type') ?? ''
    console.log(`  ✓ HTTP ${res.status} | Content-Type: ${contentType}`)

    if (!res.body) {
      console.log('  ✗ No body stream')
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let full = ''
    let chunkCount = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunkCount++
      full += decoder.decode(value, { stream: true })
    }

    console.log(`  chunks received : ${chunkCount}`)
    console.log(`  total length    : ${full.length} chars`)
    console.log(`  first 300 chars :`)
    console.log('  ' + full.slice(0, 300).replace(/\n/g, '\n  '))
    console.log(`  streaming       : ${chunkCount > 1 ? '✓ real streaming (multiple chunks)' : '⚠ single chunk (may be buffered)'}`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
      console.log(`  ✗ Dev server not running at ${BASE_URL}`)
    } else {
      console.log(`  ✗ Error: ${msg}`)
    }
  }
}

async function testDirectGeminiStream() {
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  const geminiModel = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash'

  console.log('='.repeat(60))
  console.log('  Direct Gemini Stream Verification (via SDK)')
  console.log('='.repeat(60))

  const googleKeyStatus = googleKey ? '✓ SET' : '✗ not set'
  const geminiKeyStatus = geminiKey ? '✓ SET' : '✗ not set'
  console.log(`  GOOGLE_GENERATIVE_AI_API_KEY = ${googleKeyStatus}`)
  console.log(`  GEMINI_API_KEY               = ${geminiKeyStatus}`)
  console.log()
  
  const apiKeyToUse = googleKey || geminiKey
  let keySource = ''
  if (googleKey) {
    keySource = 'GOOGLE_GENERATIVE_AI_API_KEY'
  } else if (geminiKey) {
    keySource = 'GEMINI_API_KEY (alias)'
  }

  if (!apiKeyToUse) {
    console.log('  ✗ No Gemini API key found (neither GOOGLE_GENERATIVE_AI_API_KEY nor GEMINI_API_KEY is set).')
    console.log('    Skipping direct Gemini SDK streaming test. Fallback stream would be used in route.')
    return false
  }

  console.log(`  Using Env Var : ${keySource}`)
  console.log(`  Using Model   : ${geminiModel}`)
  console.log('  Attempting to stream prompt: "Explain the two sum problem in one sentence."')
  console.log('-'.repeat(60))

  try {
    const googleProvider = createGoogleGenerativeAI({
      apiKey: apiKeyToUse,
    })
    const model = googleProvider(geminiModel)

    const result = await streamText({
      model,
      prompt: 'Explain the two sum problem in one sentence.',
    })

    process.stdout.write('  Response: ')
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart)
    }
    console.log('\n')
    console.log('-'.repeat(60))
    console.log('  ✓ Gemini streaming successful!')
    return true
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.log('\n')
    console.log('-'.repeat(60))
    console.log('  ✗ Gemini streaming FAILED!')
    console.log(`  Exact API Error: ${errorMsg}`)
    console.log()
    console.log('  [RECOMMENDATION]')
    console.log(`  If the model "${geminiModel}" is not supported or failed, please try setting:`)
    console.log('  GEMINI_MODEL="gemini-3-flash-preview"')
    console.log('  in your .env file and re-run verification.')
    console.log('='.repeat(60))
    return false
  }
}

async function main() {
  await testDirectGeminiStream()

  // Try calling the live dev server
  console.log(`\n  Checking dev server at ${BASE_URL}...`)
  try {
    await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(2000) })
    console.log('  ✓ Dev server is running. Running API route streaming checks...')
    await callChatRoute('Give me a hint', 'Test 1 – Hint')
    await callChatRoute('Analyze my time complexity', 'Test 2 – Complexity')
    await callChatRoute('Find bug in my code', 'Test 3 – Bug')
  } catch {
    console.log(`  ✗ Dev server not reachable at ${BASE_URL}`)
    console.log('    To test local API route endpoints, start with: npm run dev')
    console.log('    Then re-run: npx tsx scratch/verify-ai-stream.ts')
  }

  console.log('\n' + '='.repeat(60))
  console.log('  DONE')
  console.log('='.repeat(60))
}

main()
