import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
export const splitText = async (docs: Document[]) => {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 300,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    return splitDocs;
}