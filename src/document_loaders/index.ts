import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { JSONLoader, JSONLinesLoader } from 'langchain/document_loaders/fs/json'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PineconeClient } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import 'dotenv/config'

const main = async () => {
  const loader = new DirectoryLoader('./src/document_loaders/docs', {
    '.json': (path) => new JSONLoader(path, '/texts'),
    '.jsonl': (path) => new JSONLinesLoader(path, '/html'),
    '.css': (path) => new TextLoader(path),
    '.txt': (path) => new TextLoader(path),
    '.tsx': (path) => new TextLoader(path),
    '.ts': (path) => new TextLoader(path),
    '.md': (path) => new TextLoader(path),
    '.csv': (path) => new CSVLoader(path, 'text'),
  })
  const docs = await loader.load()
  // console.log('documents', documents)

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 200,
  })

  const documents = await textSplitter.splitDocuments(docs)

  // https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/pinecone
  const client = new PineconeClient()
  await client.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENVIRONMENT as string,
  })

  const pineconeIndex = client.Index(process.env.PINECONE_INDEX as string)

  await PineconeStore.fromDocuments(documents, new OpenAIEmbeddings(), {
    pineconeIndex,
  })
}

main()
