import { z } from 'zod';
import { chat } from './chat';
import { openai } from './core/llm/openai';
import { tool } from './core/tool';
import { cached } from './rag/cached';
import { createVectorStore, VectorStore } from './rag/createVectorStore';
import { ollama } from './rag/ollama';
import { createDocumentsFromPDF, PDFDocument } from './rag/pdf';
import { toRecursiveCharacterSplit } from './rag/toRecursiveCharacterSplit';
import { render } from './render';
import { Either } from './utils/Either';
import { Schema } from './utils/schema';

async function main() {
  const created = await createPDFStore('./nke-10k-2023.pdf');

  if (Either.isLeft(created)) {
    return console.log('ERROR', created.value);
  }

  const inference = chat(
    {
      system: createSystemPrompt(),
      welcome: createWelcomeMessage(),
    },
    {
      llm: openai,
      tools: [createRetrieveTool(created.value)],
    },
  );

  return render(inference);
}

async function createPDFStore(pdf: string) {
  const embeddings = await createDocumentsFromPDF(pdf).then(
    toRecursiveCharacterSplit,
  );

  return createVectorStore<PDFDocument>(cached(ollama)).add(embeddings);
}

function createSystemPrompt() {
  return `You are an AI assistant that answers questions using information retrieved from a specific pdf.
    
  You have access to a tool called \`retrieve\` that searches a vector database containing passages from this pdf.
  
  # Core Rules
  
  * **Always use the retrieve tool before answering questions about the pdf.**.
  * The \`retrieve\` tool returns relevant passages from the pdf. Your answers must be based only on those passages.
  * **Do not invent information** that is not present in retrieved passages.
  * If the retrieved content does not contain enough information to answer the question, say so clearly.
  * Prefer quoting or closely paraphrasing the retrieved passages when answering.
  * If multiple passages are retrieved, synthesize them into a clear answer.
  * If the user asks something unrelated to the pdf, respond: "I can only answer questions based on the provided pdf."
  
  # Retrieval Strategy
  
  When using \`retrieve\`:
  
  * Reformulate the user's question into a **semantic search query**.
  * If the first retrieval is insufficient, you may perform **additional retrievals with improved queries.**
  * Focus queries on **key concepts, names, events, or terminology** from the question.
  
  # Answer Format
  
  When answering:
  
  * Provide a **clear answer to the question.**
  * Support the answer using **information from retrieved passages.**
  * When possible, reference or quote relevant parts of the retrieved text.
  
  # Handling Missing Information
  
  If retrieval results do not contain the answer:
  
  * Say that the pdf does not appear to contain the requested information.
  * Do not speculate or rely on outside knowledge.
  
  # Goal
  
  Your goal is to **faithfully answer questions using only the knowledge contained in the pdf**, leveraging retrieval to locate the relevant passages.
  `;
}

function createWelcomeMessage() {
  return (
    'Hello, I am helpful AI assistant. ' +
    'I can answer questions related to a pdf, contents of which can be retrieved using \`retrieve\` tool'
  );
}

function createRetrieveTool(store: VectorStore<PDFDocument>) {
  return tool({
    name: 'retrieve',
    description:
      'Retrieve information from a pdf by a query getting top K results.',
    schema: Schema.create(
      z.object({
        query: z.string().describe('Query string to be search against.'),
        k: z
          .number()
          .default(5)
          .describe('A number of records to be returned. 5 by default.'),
      }),
    ),
    fn: async ({ query, k }) => {
      const results = await store.search(query, { k });

      if (Either.isLeft(results)) {
        return `Search has been failed. ${results.value.kind}: ${results.value.body}`;
      }

      return results.value
        .map((it) => `Page #${it.num}\n\n${it.content}`)
        .join('\n');
    },
  });
}

void main();
