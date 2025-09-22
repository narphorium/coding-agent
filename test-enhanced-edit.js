// Test script for the enhanced edit_file tool
async function testEnhancedEditFile() {
  console.log('Testing enhanced edit_file tool...\n');

  // Test 1: Simple replacement mode (original functionality)
  console.log('--- Test 1: Simple replacement mode ---');
  const simpleEditData = {
    messages: [
      {
        role: 'user',
        content: 'Replace "Hello" with "Hi" in the test file'
      }
    ],
    sessionID: 'test-session-' + Date.now(),
    repositoryPath: '/tmp',
    model: 'gpt-4-turbo'
  };

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleEditData)
    });

    if (response.ok) {
      console.log('✅ Simple edit mode test initiated');
    } else {
      console.log('❌ Simple edit mode test failed');
    }
  } catch (error) {
    console.error('❌ Simple edit mode request failed:', error.message);
  }

  // Test 2: LLM-based intelligent diff mode
  console.log('\n--- Test 2: LLM-based intelligent diff mode ---');
  const llmEditData = {
    messages: [
      {
        role: 'user',
        content: `Use the edit_file tool with LLM mode to apply intelligent changes to a JavaScript function.

        Here's what I want you to do:
        1. Create a test file with a simple function
        2. Use edit_file with use_llm: true to enhance the function with better error handling and documentation

        Example of what the enhanced function should look like:
        \`\`\`javascript
        /**
         * Calculates the sum of two numbers with proper error handling
         * @param {number} a - First number
         * @param {number} b - Second number
         * @returns {number} The sum of a and b
         * @throws {Error} If inputs are not numbers
         */
        function calculateSum(a, b) {
          if (typeof a !== 'number' || typeof b !== 'number') {
            throw new Error('Both arguments must be numbers');
          }
          return a + b;
        }
        \`\`\`
        `
      }
    ],
    sessionID: 'test-session-llm-' + Date.now(),
    repositoryPath: '/tmp',
    model: 'gpt-4-turbo'
  };

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(llmEditData)
    });

    if (response.ok) {
      console.log('✅ LLM edit mode test initiated');
    } else {
      console.log('❌ LLM edit mode test failed');
    }
  } catch (error) {
    console.error('❌ LLM edit mode request failed:', error.message);
  }
}

testEnhancedEditFile();