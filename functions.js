import 'dotenv/config'

import { openai } from './openai.js'

const question = process.argv[2]

const messages = [
  {
    role: 'user',
    content: question,
  },
]

const functions = {
  async generateImage({ prompt }) {
    const result = await openai.images.generate({ prompt })
    console.log(prompt)
    console.log(result)
    return result.data[0].url
  },
}

const getCompletion = async () => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    temperature: 0,
    messages,
    functions: [
      {
        name: 'generateImage',
        description: 'Create image based on description',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'a description what to generate',
            },
          },
        },
        required: ['prompt'],
      },
    ],
  })

  return response
}

let response
while (true) {
  response = await getCompletion(messages)

  if (response.choices[0].finish_reason === 'stop') {
    console.log(response.choices[0].message.content)
    break
  } else if (response.choices[0].finish_reason === 'function_call') {
    const fnName = response.choices[0].message.function_call.name
    const args = response.choices[0].message.function_call.arguments

    const functionToCall = functions[fnName]
    const params = JSON.parse(args)

    const result = functionToCall(params)

    messages.push({
      role: 'assistant',
      content: null,
      function_call: {
        name: fnName,
        arguments: args,
      },
    })

    messages.push({
      role: 'function',
      name: fnName,
      content: JSON.stringify({ result: result }),
    })
  }
}
