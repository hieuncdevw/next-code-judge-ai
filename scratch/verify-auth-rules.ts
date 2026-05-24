/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv'
import path from 'path'

// Load original env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function runTests() {
  console.log('=== STARTING AUTHENTICATION INTEGRATION TEST ===\n')

  const { runCode } = await import('../src/modules/workspace/actions/run-code')

  const testPayload = {
    problemId: 'two-sum',
    language: 'javascript',
    code: 'var twoSum = function(nums, target) { return []; };'
  }

  // Scenario 1: Guest Mode (ALLOW_DEV_AUTH_FALLBACK is undefined/false, Clerk not logged in)
  console.log('--- Scenario 1: Guest Mode (No Auth) ---')
  ;(process.env as any).NODE_ENV = 'development'
  process.env.ALLOW_DEV_AUTH_FALLBACK = 'false'
  
  try {
    const res = await runCode(testPayload)
    console.log('Result Status:', res.status)
    console.log('Result Status Label:', res.statusLabel)
    console.log('Result Error Message:', res.errorMessage)
    console.log('Passed:', res.status === 'UNAUTHORIZED' ? 'PASSED ✅' : 'FAILED ❌')
  } catch (err: any) {
    console.error('Scenario 1 Error:', err.message)
  }

  // Scenario 2: Dev Auth Fallback Allowed (ALLOW_DEV_AUTH_FALLBACK="true", NODE_ENV="development")
  console.log('\n--- Scenario 2: Developer Fallback Allowed ---')
  ;(process.env as any).NODE_ENV = 'development'
  process.env.ALLOW_DEV_AUTH_FALLBACK = 'true'

  try {
    const res = await runCode(testPayload)
    console.log('Result Status:', res.status)
    console.log('Result Status Label:', res.statusLabel)
    console.log('Passed:', res.status !== 'UNAUTHORIZED' ? 'PASSED ✅' : 'FAILED ❌')
  } catch (err: any) {
    console.error('Scenario 2 Error:', err.message)
  }

  // Scenario 3: Production Mode (NODE_ENV="production", ALLOW_DEV_AUTH_FALLBACK="true" but should be ignored)
  console.log('\n--- Scenario 3: Production Mode (Fallback should be disabled) ---')
  ;(process.env as any).NODE_ENV = 'production'
  process.env.ALLOW_DEV_AUTH_FALLBACK = 'true'

  try {
    const res = await runCode(testPayload)
    console.log('Result Status:', res.status)
    console.log('Result Status Label:', res.statusLabel)
    console.log('Result Error Message:', res.errorMessage)
    console.log('Passed:', res.status === 'UNAUTHORIZED' ? 'PASSED ✅' : 'FAILED ❌')
  } catch (err: any) {
    console.error('Scenario 3 Error:', err.message)
  }

  console.log('\n=== AUTHENTICATION INTEGRATION TEST COMPLETED ===')
}

runTests()
