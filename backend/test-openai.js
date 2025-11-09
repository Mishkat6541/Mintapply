import 'dotenv/config';
import OpenAI from 'openai';

console.log('Testing OpenAI API connection...');
console.log('API Key (first 20 chars):', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testAPI() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello in one word." }
      ],
      max_tokens: 10
    });
    
    console.log('✅ OpenAI API test successful!');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI API test failed:');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
  }
}

testAPI();