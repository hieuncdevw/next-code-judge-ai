/**
 * Judge0 Verification Script
 * Tests connectivity and all three submission types against the configured Judge0 instance.
 * Run with: npx tsx scratch/verify-judge0.ts
 */
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

// ── Config ──────────────────────────────────────────────────────────────────
const JUDGE0_API_URL = process.env.JUDGE0_API_URL ?? 'http://localhost:2358'
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY
const JUDGE0_RAPIDAPI_HOST = process.env.JUDGE0_RAPIDAPI_HOST

const RAPIDAPI_SUBMIT_DELAY_MS = 1200
const RAPIDAPI_POLL_DELAY_MS = 1000

const isRapidAPI = JUDGE0_API_URL.includes('rapidapi.com')

const headers: Record<string, string> = { 'Content-Type': 'application/json' }
if (JUDGE0_API_KEY) {
  headers['x-rapidapi-key'] = JUDGE0_API_KEY
  headers['x-judge0-api-key'] = JUDGE0_API_KEY
}
if (JUDGE0_RAPIDAPI_HOST) {
  headers['x-rapidapi-host'] = JUDGE0_RAPIDAPI_HOST
}

// Language IDs (Judge0 CE)
const LANG_JS = 63   // Node.js 18

// ── Status map ───────────────────────────────────────────────────────────────
const STATUS: Record<number, string> = {
  1: 'In Queue',
  2: 'Processing',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error (SIGSEGV)',
  8: 'Runtime Error (SIGXFSZ)',
  9: 'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error',
}

// ── Helper: submit ────────────────────────────────────────────────────────────
async function submit(sourceCode: string, stdin: string, expectedOutput: string) {
  const body = {
    source_code: Buffer.from(sourceCode).toString('base64'),
    language_id: LANG_JS,
    stdin: Buffer.from(stdin).toString('base64'),
    expected_output: Buffer.from(expectedOutput).toString('base64'),
  }
  const res = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Rate Limited')
    }
    throw new Error(`Submit HTTP ${res.status}: ${await res.text()}`)
  }
  const data = (await res.json()) as { token: string }
  return data.token
}

// ── Helper: poll ─────────────────────────────────────────────────────────────
async function poll(token: string) {
  const pollDelay = isRapidAPI ? RAPIDAPI_POLL_DELAY_MS : 500
  for (let i = 0; i < 20; i++) {
    if (isRapidAPI) {
      await new Promise(r => setTimeout(r, pollDelay))
    }
    const res = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`, { headers })
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Rate Limited')
      }
      throw new Error(`Poll HTTP ${res.status}`)
    }
    const data = (await res.json()) as {
      status: { id: number; description: string }
      stdout?: string; stderr?: string; compile_output?: string
      time?: string; memory?: number
    }
    if (data.status.id > 2) {
      return {
        statusId: data.status.id,
        statusLabel: STATUS[data.status.id] ?? data.status.description,
        stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8').trim() : '',
        stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf-8').trim() : '',
        compileOutput: data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf-8').trim() : '',
        runtimeMs: data.time ? Math.round(parseFloat(data.time) * 1000) : undefined,
        memoryKb: data.memory,
      }
    }
    if (!isRapidAPI) {
      await new Promise(r => setTimeout(r, pollDelay))
    }
  }
  throw new Error('Timed out after 20 poll attempts')
}

// ── Helper: run one test case ─────────────────────────────────────────────────
async function runCase(label: string, code: string, stdin: string, expected: string) {
  console.log(`\n  [${label}]`)
  const token = await submit(code, stdin, expected)
  console.log(`    token: ${token}`)
  const r = await poll(token)
  console.log(`    status   : ${r.statusId} – ${r.statusLabel}`)
  console.log(`    runtime  : ${r.runtimeMs !== undefined ? r.runtimeMs + ' ms' : 'N/A'}`)
  console.log(`    memory   : ${r.memoryKb !== undefined ? r.memoryKb + ' KB' : 'N/A'}`)
  if (r.stdout)        console.log(`    stdout   : ${r.stdout.slice(0, 200)}`)
  if (r.stderr)        console.log(`    stderr   : ${r.stderr.slice(0, 200)}`)
  if (r.compileOutput) console.log(`    compile  : ${r.compileOutput.slice(0, 200)}`)
  return r
}

// ── Code under test ──────────────────────────────────────────────────────────

// Accepted solution (HashMap, O(n))
const ACCEPTED_JS = `
var twoSum = function(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) return [map.get(comp), i];
    map.set(nums[i], i);
  }
  return [];
};

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
const nums = JSON.parse(input[0]);
const target = parseInt(input[1]);
console.log(JSON.stringify(twoSum(nums, target)));
`.trim()

// Wrong answer solution (always returns [0,0])
const WRONG_JS = `
var twoSum = function(nums, target) { return [0, 0]; };

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
const nums = JSON.parse(input[0]);
const target = parseInt(input[1]);
console.log(JSON.stringify(twoSum(nums, target)));
`.trim()

// Syntax error code
const SYNTAX_ERROR_JS = `
var twoSum = function(nums target {   // missing comma & closing paren
  return [];
};
console.log(twoSum([], 0));
`.trim()

// Test cases for two-sum
const TC1 = { input: '[2,7,11,15]\n9',  expected: '[0,1]' }
const TC2 = { input: '[3,2,4]\n6',       expected: '[1,2]' }
const TC3 = { input: '[3,3]\n6',         expected: '[0,1]' }

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60))
  console.log('  Judge0 Verification Script')
  console.log('='.repeat(60))
  console.log()
  console.log('  Environment variables:')
  console.log(`    JUDGE0_API_URL       = ${JUDGE0_API_URL}`)
  console.log(`    JUDGE0_API_KEY       = ${JUDGE0_API_KEY ? '✓ SET (' + JUDGE0_API_KEY.slice(0, 8) + '…)' : '✗ NOT SET (local/self-hosted only)'}`)
  console.log(`    JUDGE0_RAPIDAPI_HOST = ${JUDGE0_RAPIDAPI_HOST ?? '✗ NOT SET (local/self-hosted only)'}`)

  // ── Connectivity check ────────────────────────────────────────────────────
  console.log('\n── Connectivity ────────────────────────────────────────────')
  try {
    const aboutRes = await fetch(`${JUDGE0_API_URL}/about`, { headers, signal: AbortSignal.timeout(4000) })
    if (aboutRes.ok) {
      const about = await aboutRes.json() as Record<string, unknown>
      console.log('  ✓ Judge0 is reachable')
      console.log(`    version: ${about.version ?? 'unknown'}`)
    } else {
      if (isRapidAPI && aboutRes.status === 403) {
        console.log(`  ⚠ /about returned HTTP 403 (expected warning for RapidAPI free tier)`)
      } else {
        console.log(`  ⚠ /about returned HTTP ${aboutRes.status}`)
        if (!isRapidAPI) {
          throw new Error(`/about returned HTTP ${aboutRes.status}`)
        }
      }
    }
  } catch (e) {
    if (isRapidAPI) {
      console.log(`  ⚠ Connectivity check skipped/warned for RapidAPI: ${(e as Error).message}`)
    } else {
      console.error(`  ✗ Judge0 unreachable at ${JUDGE0_API_URL}`)
      console.error(`    ${(e as Error).message}`)
      console.error()
      console.error('  ─── REMEDIATION ─────────────────────────────────────────')
      console.error('  Option A – Self-host with Docker (recommended for dev):')
      console.error('    1. Install & start Docker Desktop')
      console.error('    2. docker run -d --name judge0 \\')
      console.error('         -p 2358:2358 \\')
      console.error('         -e REDIS_URL=redis://localhost \\')
      console.error('         judge0/judge0:latest')
      console.error('    3. No extra .env vars needed (default localhost:2358)')
      console.error()
      console.error('  Option B – RapidAPI (cloud, free tier):')
      console.error('    1. Sign up at https://rapidapi.com/judge0-official/api/judge0-ce')
      console.error('    2. Set in .env:')
      console.error('         JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com')
      console.error('         JUDGE0_API_KEY=<your-rapidapi-key>')
      console.error('         JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com')
      process.exit(1)
    }
  }

  // ── Test 1: Accepted solution (all 3 test cases) ──────────────────────────
  console.log('\n── Test 1: two-sum – ACCEPTED solution ─────────────────────')
  let r1a, r1b, r1c
  if (isRapidAPI) {
    r1a = await runCase('TC1', ACCEPTED_JS, TC1.input, TC1.expected)
    await new Promise(r => setTimeout(r, RAPIDAPI_SUBMIT_DELAY_MS))
    r1b = await runCase('TC2', ACCEPTED_JS, TC2.input, TC2.expected)
    await new Promise(r => setTimeout(r, RAPIDAPI_SUBMIT_DELAY_MS))
    r1c = await runCase('TC3', ACCEPTED_JS, TC3.input, TC3.expected)
  } else {
    const [t1, t2, t3] = await Promise.all([
      runCase('TC1', ACCEPTED_JS, TC1.input, TC1.expected),
      runCase('TC2', ACCEPTED_JS, TC2.input, TC2.expected),
      runCase('TC3', ACCEPTED_JS, TC3.input, TC3.expected),
    ])
    r1a = t1; r1b = t2; r1c = t3
  }
  const allAccepted = [r1a, r1b, r1c].every(r => r.statusId === 3)
  console.log(`\n  → Overall: ${allAccepted ? '✓ ACCEPTED (3/3 passed)' : '✗ FAILED'}`)

  // ── Test 2: Wrong answer ──────────────────────────────────────────────────
  console.log('\n── Test 2: two-sum – WRONG ANSWER ──────────────────────────')
  let r2a, r2b
  if (isRapidAPI) {
    await new Promise(r => setTimeout(r, RAPIDAPI_SUBMIT_DELAY_MS))
    r2a = await runCase('TC1', WRONG_JS, TC1.input, TC1.expected)
    await new Promise(r => setTimeout(r, RAPIDAPI_SUBMIT_DELAY_MS))
    r2b = await runCase('TC2', WRONG_JS, TC2.input, TC2.expected)
  } else {
    const [t1, t2] = await Promise.all([
      runCase('TC1', WRONG_JS, TC1.input, TC1.expected),
      runCase('TC2', WRONG_JS, TC2.input, TC2.expected),
    ])
    r2a = t1; r2b = t2
  }
  const gotWrong = [r2a, r2b].some(r => r.statusId === 4)
  console.log(`\n  → Overall: ${gotWrong ? '✓ Got WRONG_ANSWER as expected' : '✗ Unexpected result'}`)

  // ── Test 3: Syntax error ──────────────────────────────────────────────────
  console.log('\n── Test 3: SYNTAX ERROR / RUNTIME PARSE ERROR code ──────────')
  if (isRapidAPI) {
    await new Promise(r => setTimeout(r, RAPIDAPI_SUBMIT_DELAY_MS))
  }
  const r3 = await runCase('TC1', SYNTAX_ERROR_JS, TC1.input, TC1.expected)
  let gotExpectedSyntaxError = false
  if (r3.statusId === 6) {
    gotExpectedSyntaxError = true
  } else if (r3.statusId === 11) {
    const hasSyntaxErrorText = r3.stderr.includes('SyntaxError') || r3.compileOutput.includes('SyntaxError')
    if (hasSyntaxErrorText) {
      gotExpectedSyntaxError = true
    } else {
      console.log(`    ✗ Status is 11 (NZEC) but neither stderr nor compileOutput contained "SyntaxError"`)
    }
  }
  console.log(`\n  → Overall: ${gotExpectedSyntaxError ? '✓ Got SYNTAX_ERROR / RUNTIME_PARSE_ERROR as expected' : '✗ Unexpected result (statusId=' + r3.statusId + ')'}`)

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60))
  console.log('  SUMMARY')
  console.log('='.repeat(60))
  console.log(`  Test 1 – Accepted   : ${allAccepted ? '✓ PASS' : '✗ FAIL'}`)
  console.log(`  Test 2 – Wrong Ans  : ${gotWrong ? '✓ PASS' : '✗ FAIL'}`)
  console.log(`  Test 3 – Syntax/Parse: ${gotExpectedSyntaxError ? '✓ PASS' : '✗ FAIL'}`)

  const allPassed = allAccepted && gotWrong && gotExpectedSyntaxError
  console.log()
  console.log(`  Judge0 runner: ${allPassed ? '✓ FULLY VERIFIED' : '⚠ PARTIAL RESULTS'}`)
  console.log()

  if (allPassed) {
    console.log('  Submissions tab will show:')
    console.log('    • status badges (Accepted / Wrong Answer / Compile/Runtime Error)')
    console.log(`    • runtime: ${r1a.runtimeMs} ms (from Test 1, TC1)`)
    console.log(`    • memory : ${r1a.memoryKb} KB (from Test 1, TC1)`)
    console.log('    • per-test pass/fail indicators')
  }
}

main().catch((e) => {
  const message = e instanceof Error ? e.message : String(e)
  if (message.includes('Rate Limited') || message.includes('Too many requests') || message.includes('429')) {
    console.error('\n[FATAL] RapidAPI rate limit hit. Wait a few minutes or upgrade plan.')
  } else {
    console.error('\n[FATAL]', e)
  }
  process.exit(1)
})
