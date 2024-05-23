import 'dotenv/config'
import { openai } from './openai.js'
import readline from 'node:readline'
import { stdin, stdout } from 'node:process'

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
})

const newMessage = async (history, message) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [...history, message],
    temperature: 0,
  })

  return completion.choices[0].message
}

const formatMessage = (input) => {
  return { role: 'user', content: input }
}

const chat = () => {
  const history = [
    {
      role: 'system',
      content: 'you are an AI assistant. answer the questions.',
    },
  ]

  const start = () => {
    rl.question('You:', async (userInput) => {
      if (userInput.toLowerCase() === 'exit') {
        rl.close()
        return
      }

      const message = formatMessage(userInput)
      const response = await newMessage(history, message)

      history.push(message, response)
      console.log(`\n\nAI: ${response.content}\n\n`)
      start()
    })
  }

  start()
}

console.log('Initialized. Type exit to exit')

chat()
