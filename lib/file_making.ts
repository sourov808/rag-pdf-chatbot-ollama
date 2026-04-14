import path from 'path';
import fs from "fs/promises"


export const fileMaking = async (request: Request): Promise<string[]> => {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    // const filePath = path.join(process.cwd(), 'public', 'uploads', files[0].name);
    
    if (!files.length) {
      throw new Error('No files uploaded');
    }
    

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true })

    const savedPaths: string[] = [];

    for (const file of files) {
        const uniqueName = `${Date.now()}-${file.name}`
        const filePath = path.join(uploadDir, uniqueName)

        await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()))
        savedPaths.push(filePath)
    }

    return savedPaths

}