const axios = require('axios');

const claudeKey = process.env.CLAUDE_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

async function callClaude(prompt) {
  const res = await axios.post(
    'https://api.anthropic.com/v1/complete',
    {
      prompt,
      model: 'claude-2',
      max_tokens_to_sample: 120
    },
    {
      headers: {
        'x-api-key': claudeKey,
        'content-type': 'application/json'
      }
    }
  );
  return res.data.completion.trim();
}

async function callOpenAI(prompt) {
  const res = await axios.post(
    'https://api.openai.com/v1/completions',
    {
      prompt,
      model: 'text-davinci-003',
      max_tokens: 120
    },
    {
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'content-type': 'application/json'
      }
    }
  );
  return res.data.choices[0].text.trim();
}

module.exports = { callClaude, callOpenAI };