import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const loadPDF = async (filePath: string) => {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs;
}


