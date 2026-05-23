import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function testWorkspaceFlow() {
  console.log('=== STARTING WORKSPACE FLOW INTEGRATION TEST ===')
  console.log('DATABASE_URL is:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED')

  const { runCode } = await import('../src/modules/workspace/actions/run-code')

  // Test Case 1: Wrong Answer code for Two Sum
  console.log('\n--- Test 1: Running Wrong Answer JS code for Two Sum ---')
  const payload1 = {
    problemId: 'two-sum', // Will resolve to Two Sum in action if not a UUID
    language: 'javascript',
    code: `
var twoSum = function(nums, target) {
    return [0, 0]; // Incorrect, should return indices of two different numbers
};
    `
  }

  try {
    const res1 = await runCode(payload1)
    console.log('Result 1:')
    console.log(`- Status: ${res1.status} (${res1.statusLabel})`)
    console.log(`- Passed Tests: ${res1.passedTests} / ${res1.totalTests}`)
    console.log(`- Runtime: ${res1.runtime}ms`)
    console.log(`- Memory: ${res1.memory}KB`)
    if (res1.errorMessage) {
      console.log(`- Error Message: ${res1.errorMessage.slice(0, 200)}...`)
    }
  } catch (err: unknown) {
    console.error('Test 1 failed with error:', err instanceof Error ? err.message : String(err))
  }

  // Test Case 2: Accepted JS code for Two Sum
  console.log('\n--- Test 2: Running Correct JS code for Two Sum ---')
  const payload2 = {
    problemId: 'two-sum',
    language: 'javascript',
    code: `
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
};
    `
  }

  try {
    const res2 = await runCode(payload2)
    console.log('Result 2:')
    console.log(`- Status: ${res2.status} (${res2.statusLabel})`)
    console.log(`- Passed Tests: ${res2.passedTests} / ${res2.totalTests}`)
    console.log(`- Runtime: ${res2.runtime}ms`)
    console.log(`- Memory: ${res2.memory}KB`)
  } catch (err: unknown) {
    console.error('Test 2 failed with error:', err instanceof Error ? err.message : String(err))
  }

  // Test Case 3: Accepted Python code for Palindrome Number
  console.log('\n--- Test 3: Running Correct Python code for Palindrome Number ---')
  const payload3 = {
    problemId: 'palindrome-number',
    language: 'python',
    code: `
def isPalindrome(x: int) -> bool:
    if x < 0:
        return False
    return str(x) == str(x)[::-1]
    `
  }

  try {
    const res3 = await runCode(payload3)
    console.log('Result 3:')
    console.log(`- Status: ${res3.status} (${res3.statusLabel})`)
    console.log(`- Passed Tests: ${res3.passedTests} / ${res3.totalTests}`)
  } catch (err: unknown) {
    console.error('Test 3 failed with error:', err instanceof Error ? err.message : String(err))
  }

  console.log('\n=== INTEGRATION TEST COMPLETED ===')
}

testWorkspaceFlow()
