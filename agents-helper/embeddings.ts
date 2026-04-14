import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant"

export const getEmbeddings = () => {
    return new OllamaEmbeddings({
        model: "nomic-embed-text-v2-moe:latest",
        baseUrl: "http://localhost:11434",
    })
}

export const docsEmbeddings = async (docs: Document[]) => {
    return getEmbeddings()
}

export const vectorStore = async (docs: Document[], collectionName: string = "docs") => {
    const embeddings = getEmbeddings()
    const config = {
        collectionName,
        url: "http://localhost:6333",
    }

    let vectorStore;

    try {
        vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, config)
        await vectorStore.addDocuments(docs)
    } catch (error: any) {
        if (error?.message?.includes("not found")) {
            console.log(`Collection ${collectionName} not found, creating new one...`);
            vectorStore = await QdrantVectorStore.fromDocuments(
                docs,
                embeddings,
                config
            );
        } else {
            throw error;
        }
    }

    return vectorStore
}