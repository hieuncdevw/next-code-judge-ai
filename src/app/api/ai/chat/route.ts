import type { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'

type Message = { role: 'user' | 'assistant'; content: string }

function getMockReply(messages: Message[], problem: { title?: string } | null): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const q = lastUser?.content.toLowerCase() ?? ''

  let contextInfo = ''
  if (problem) {
    contextInfo = `[Problem Context: ${problem.title}] `
  }

  if (q.includes('hint') || q.includes('gợi ý')) {
    return `${contextInfo}Gợi ý: Thử dùng một HashMap để lưu giá trị và index khi bạn duyệt mảng. Với mỗi phần tử \`nums[i]\`, kiểm tra xem \`target - nums[i]\` đã có trong map chưa. Nếu có, bạn đã tìm được cặp số cần thiết!`
  }
  if (q.includes('time') || q.includes('độ phức tạp') || q.includes('complexity')) {
    return `${contextInfo}Giải pháp tối ưu có Time Complexity O(n) và Space Complexity O(n) sử dụng một lần duyệt kết hợp HashMap. Giải brute-force hai vòng lặp lồng nhau là O(n²) — thường quá chậm với input lớn.`
  }
  if (q.includes('error') || q.includes('lỗi') || q.includes('bug')) {
    return `${contextInfo}Hãy kiểm tra:\n1. Điều kiện biên — mảng có thể có đúng 2 phần tử.\n2. Đảm bảo bạn không trả lại cùng một index hai lần (đề bài yêu cầu hai index *khác nhau*).\n3. Nếu bạn nhận được lỗi \`undefined\`, hãy thêm kiểm tra tồn tại trước khi truy cập index.`
  }
  if (q.includes('explain') || q.includes('giải thích')) {
    return `${contextInfo}Bài ${problem?.title || 'Two Sum'} yêu cầu tìm hai số trong mảng có tổng bằng \`target\` và trả về index của chúng. Cách tiếp cận HashMap: khi duyệt đến \`nums[i]\`, ta kiểm tra xem \`complement = target - nums[i]\` đã được thấy trước đó chưa. Nếu có, trả về \`[map.get(complement), i]\`. Nếu chưa, lưu \`map.set(nums[i], i)\` và tiếp tục.`
  }

  return `${contextInfo}Tôi có thể giúp bạn với bài toán này! Bạn muốn:\n• Gợi ý thuật toán (hint)\n• Giải thích độ phức tạp (complexity)\n• Debug lỗi (error)\n• Giải thích đề bài (explain)\n\nHãy mô tả cụ thể hơn nhé!`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      messages?: Message[]
      problem?: { title: string; description: string } | null
      code?: string
      language?: string
    }

    const messages = body.messages ?? []
    const problem = body.problem ?? null
    const code = body.code ?? ''
    const language = body.language ?? 'javascript'

    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
    const hasGemini = !!geminiApiKey
    const hasOpenAI = !!process.env.OPENAI_API_KEY

    if (hasGemini || hasOpenAI) {
      const geminiModel = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash'
      const googleProvider = createGoogleGenerativeAI({
        apiKey: geminiApiKey,
      })
      const model = hasGemini
        ? googleProvider(geminiModel)
        : openai('gpt-4o-mini')

      const problemText = problem
        ? `Problem Title: ${problem.title}\nProblem Description:\n${problem.description}`
        : 'No problem details available.'

      const systemPrompt = `
You are a helpful, expert AI programming mentor on an online coding judge platform.
You are helping a developer with a programming task.

Context information:
${problemText}

Current code in the editor (Language: ${language}):
\`\`\`${language}
${code}
\`\`\`

Instructions:
1. Keep explanations concise, technical, and avoid excessive praise.
2. If they ask for a hint, focus on the current problem and current code first. Guide them step-by-step rather than giving the complete solution immediately.
3. If they ask for complexity, explain the time and space complexity of their current solution and recommend the optimal complexity.
4. Do NOT use LaTeX math syntax such as $O(N)$, \\(O(N)\\), \\mathbf{}, or \\times. For complexity notation, always use inline code formatting: \`O(n)\`, \`O(n log n)\`, \`O(1)\`, \`O(n^2)\`.
5. If they ask to debug or explain an error, analyze their code, explain where the bug is, and point out logic/compile/runtime issues.
6. Use clean Markdown formatting. Keep replies under 300 words.
`.trim()

      const formattedMessages = messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }))

      const result = await streamText({
        model,
        system: systemPrompt,
        messages: formattedMessages,
      })

      return result.toTextStreamResponse()
    }

    const reply = getMockReply(messages, problem)
    const tokens = reply.match(/\S+|\s+/g) ?? [reply]
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        for (const token of tokens) {
          controller.enqueue(encoder.encode(token))
          await new Promise((resolve) =>
            setTimeout(resolve, 25 + Math.random() * 40)
          )
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Accel-Buffering': 'no',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err: unknown) {
    console.error('[POST /api/ai/chat] error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return new Response(`Error generating response: ${message}`, { status: 500 })
  }
}
