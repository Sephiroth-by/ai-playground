import 'dotenv/config'
import { openai } from './openai.js'

const results = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: 'you are an AI assistent' },
    { role: 'user', content: 'hi' },
  ],
})

console.log(results.choices[0].message.content)
