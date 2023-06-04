import 'dotenv/config'
import { PromptTemplate } from 'langchain/prompts'

const main = async () => {
  const template = 'What is a good name for a company that makes {product}?'
  const prompt = new PromptTemplate({
    template: template,
    inputVariables: ['product'],
  })

  const res = await prompt.format({ product: 'socks' })
  console.log(res)
}

main()
