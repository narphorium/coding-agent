// Test script for the apply-edit endpoint
async function testApplyEditLLM() {
  console.log('--- Testing LLM mode ---');
  const testData = {
    sessionID: 'test-session-' + Date.now(),
    filePath: '/tmp/test-file.txt',
    editedContent: 'Hello, World!\nThis is a test file content.\nCreated by apply-edit endpoint with LLM intelligence.'
  };

  try {
    const response = await fetch('http://localhost:3000/api/apply-edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success:', result);
    } else {
      console.log('❌ Error:', result);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test simple replacement mode
async function testApplyEditSimple() {
  console.log('\n--- Testing Simple Replacement mode ---');
  const testData = {
    sessionID: 'test-session-simple-' + Date.now(),
    filePath: '/tmp/test-simple.txt',
    oldText: 'Hello',
    newText: 'Hi'
  };

  try {
    const response = await fetch('http://localhost:3000/api/apply-edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success:', result);
    } else {
      console.log('❌ Error:', result);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test with missing parameters
async function testValidation() {
  console.log('\n--- Testing validation ---');

  const testCases = [
    { name: 'Missing sessionID', data: { filePath: '/tmp/test.txt', editedContent: 'content' } },
    { name: 'Missing filePath', data: { sessionID: 'test', editedContent: 'content' } },
    { name: 'Missing editedContent', data: { sessionID: 'test', filePath: '/tmp/test.txt' } },
  ];

  for (const testCase of testCases) {
    try {
      const response = await fetch('http://localhost:3000/api/apply-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      console.log(`${testCase.name}: ${response.status} - ${result.error || result.message}`);
    } catch (error) {
      console.error(`${testCase.name} failed:`, error.message);
    }
  }
}

console.log('Testing apply-edit endpoint...\n');
testApplyEditLLM().then(() => {
  return testApplyEditSimple();
}).then(() => {
  return testValidation();
});