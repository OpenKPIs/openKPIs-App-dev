/**
 * Test script to validate OpenAI API key
 * Run with: node scripts/test-openai-key.js
 * 
 * Note: This script requires Node.js 18+ for fetch API
 * If you need dotenv support, install it: npm install dotenv --save-dev
 */

// Try to load dotenv if available, otherwise use process.env directly
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('✓ Using dotenv to load .env.local\n');
} catch (e) {
  // dotenv not installed, will use process.env (must be set in environment)
  console.log('⚠ dotenv not found, using process.env (make sure OPENAI_API_KEY is set)\n');
}

async function testOpenAIKey() {
  let apiKey = process.env.OPENAI_API_KEY;

  console.log('\n=== OpenAI API Key Test ===\n');

  // Check if key exists
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not configured');
    console.log('\nPlease set OPENAI_API_KEY in your .env.local file');
    process.exit(1);
  }

  console.log('✓ API key found in environment');
  console.log(`  Key prefix: ${apiKey.substring(0, 20)}...`);
  console.log(`  Key length: ${apiKey.length} characters`);
  console.log(`  Has newlines: ${apiKey.includes('\n') || apiKey.includes('\r')}`);

  // Clean the key
  const originalKey = apiKey;
  apiKey = apiKey
    .replace(/\r?\n/g, '')
    .replace(/\s+/g, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  console.log(`  After cleaning: ${apiKey.length} characters`);

  // Validate format
  if (!apiKey.startsWith('sk-proj-')) {
    console.error('\n❌ Invalid API key format');
    console.log(`  Expected: starts with "sk-proj-"`);
    console.log(`  Got: starts with "${apiKey.substring(0, 10)}"`);
    process.exit(1);
  }

  console.log('✓ Key format is valid (starts with sk-proj-)');

  // Test API call
  console.log('\n📡 Making test API call to OpenAI...\n');

  try {
    const authHeader = `Bearer ${apiKey}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "test successful"',
          },
        ],
        max_tokens: 20,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ API request failed');
      console.error(`  Status: ${response.status} ${response.statusText}`);
      console.error('  Response:', JSON.stringify(responseData, null, 2));
      
      if (response.status === 401) {
        console.error('\n💡 This usually means:');
        console.error('  1. The API key is incorrect or expired');
        console.error('  2. The key format is wrong (check for hidden characters)');
        console.error('  3. Your OpenAI account needs billing enabled');
        console.error('\n  Key info:');
        console.error(`    Prefix: ${apiKey.substring(0, 20)}...`);
        console.error(`    Suffix: ...${apiKey.substring(apiKey.length - 10)}`);
        console.error(`    Length: ${apiKey.length}`);
      }
      
      process.exit(1);
    }

    console.log('✅ API key is valid and working!');
    console.log('\nResponse:');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('\n✓ Test successful!\n');
  } catch (error) {
    console.error('❌ Error making API request:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  }
}

testOpenAIKey();

