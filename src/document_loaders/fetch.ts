import 'dotenv/config'
import { OpenAI } from 'langchain/llms';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores';
import { VectorDBQAChain } from 'langchain/chains';

export const run = async () => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENVIRONMENT as string,
  });

  const pineconeIndex = client.Index(process.env.PINECONE_INDEX as string);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  const model = new OpenAI();
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });
  const response = await chain.call({
    query: 'show example aicommits generate multiple commit',
  });
  console.log(response);
};

run();