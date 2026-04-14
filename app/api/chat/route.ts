import { ChatOllama } from "@langchain/ollama";
import { QdrantVectorStore } from "@langchain/qdrant";
import { getEmbeddings } from "../../../agents-helper/embeddings";

export async function POST(request: Request) {
    try {
        const { query, collectionName = "docs" } = await request.json();

        const embeddings = getEmbeddings();

        const vectorStoreDocs = await QdrantVectorStore.fromExistingCollection(embeddings, {
            collectionName: collectionName,
            url: "http://localhost:6333",
        })

        const ret = vectorStoreDocs.asRetriever({
            k: 3 // Search across more context for better results
        })

        const docs = await ret.invoke(query)
        const context = docs.map(d => d.pageContent).join("\n\n")

        const SYSTEM_PROMPT = `
    You are a highly capable AI assistant specializing in document analysis. 
    Use the provided context to answer the user's question accurately and concisely.
    If the context doesn't contain the answer, politely state that.
    
    Context:
    ${context}
    `

        const client = new ChatOllama({
            model: "phi3:3.8b",
            baseUrl: "http://localhost:11434",
            numPredict: 500 // Increased for more detailed answers
        })

        const response = await client.stream([
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            {
                role: "user",
                content: query,
            },
        ]);

        let finalText = ""
        for await (const chunk of response) {
            finalText += chunk.content
        }

        return Response.json({
            success: true,
            answer: finalText,
            source: docs.map(d => d.metadata.source),
            collection: collectionName
        })
        
    } catch (error) {
        console.error("Chat Error:", error)
        return Response.json({ error: "Query failed", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

    
