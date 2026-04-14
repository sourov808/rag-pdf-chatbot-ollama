import { loadPDF } from '../../../agents-helper/document_loader';
import { vectorStore } from '../../../agents-helper/embeddings';
import { splitText } from '../../../agents-helper/split_text';
import { fileMaking } from '../../../lib/file_making';

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const collectionName = (formData.get('collectionName') as string) || "docs";
    
    // We need to pass the request to fileMaking, but since we already consumed the formData,
    // we should have fileMaking accept the already parsed files or formData.
    // However, looking at fileMaking, it calls request.formData() again.
    // This will error if the stream was already consumed.
    // I will refactor fileMaking to handle this.
    
    const files = formData.getAll('files') as File[];
    if (!files.length) {
      return Response.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Refactored file saving logic since I have the files here
    const path = await import('path');
    const fs = await import('fs/promises');
    const uploadDir = path.default.join(process.cwd(), 'public', 'uploads');
    await fs.default.mkdir(uploadDir, { recursive: true });

    const savedPaths: string[] = [];
    for (const file of files) {
      const uniqueName = `${Date.now()}-${file.name}`;
      const filePath = path.default.join(uploadDir, uniqueName);
      await fs.default.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      savedPaths.push(filePath);
    }

    const loadedDocs = await Promise.all(savedPaths.map((fPath) => loadPDF(fPath)));
    const splitDocs = await splitText(loadedDocs.flat());
    
    await vectorStore(splitDocs, collectionName);

    return Response.json({
      success: true,
      message: `Documents stored successfully in collection: ${collectionName}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
