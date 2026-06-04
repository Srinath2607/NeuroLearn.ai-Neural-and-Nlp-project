import { Request, Response } from 'express';
import Document from '../models/Document';
import Groq from 'groq-sdk';
import path from 'path';
import fs from 'fs';
const pdfParse = require('pdf-parse');

// Simple queue to prevent OOM when uploading multiple PDFs
let isProcessing = false;
const processingQueue: Array<() => Promise<void>> = [];

async function processNextInQueue() {
  if (isProcessing || processingQueue.length === 0) return;
  isProcessing = true;
  
  while (processingQueue.length > 0) {
    const task = processingQueue.shift();
    if (task) {
      try {
        await task();
      } catch (err) {
        console.error('Queue task error:', err);
      }
    }
  }
  
  isProcessing = false;
}

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${file.filename}`;

    const newDoc = new Document({
      userId,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: fileUrl,
      status: 'processing'
    });

    await newDoc.save();

    // Respond immediately so the frontend knows the upload succeeded
    res.status(201).json({
      message: 'File uploaded successfully',
      document: newDoc
    });

    // Queue the processing task to run sequentially
    processingQueue.push(() => processFileWithGroq(newDoc._id.toString(), file.path, file.originalname));
    processNextInQueue();

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const docs = await Document.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(docs);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processFileWithGroq(documentId: string, filePath: string, originalName: string) {
  // Read API key from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  
  console.log(`[Upload] Processing: ${originalName}`);
  console.log(`[Upload] Groq API Key present: ${apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO'}`);

  try {
    const groq = new Groq({ apiKey });

    let fileContext = '';
    
    // Extract text if it's a PDF
    if (originalName.toLowerCase().endsWith('.pdf')) {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        // Limit text to ~20000 characters to avoid Groq context length issues
        fileContext = `Here is the extracted text from the document:\n\n${data.text.substring(0, 20000)}`;
      } catch (err) {
        console.error('Error parsing PDF:', err);
        fileContext = 'Could not extract text from the PDF.';
      }
    }

    const prompt = `You are an educational AI assistant. A student uploaded a study document called "${originalName}". 

${fileContext}

Please provide:
1. **Summary**: A detailed 2-3 paragraph summary of what this document covers.
2. **Key Concepts**: List the 5-7 most important concepts a student should understand from this topic.
3. **Important Formulas**: List the key mathematical formulas or equations associated with this subject.
4. **Study Tips**: 2-3 tips for mastering this topic.

Make your response helpful, detailed and educational.`;

    console.log(`[Upload] Calling Groq API for ${originalName}...`);
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1500,
    });

    const extractedText = completion.choices[0].message.content || '';
    console.log(`[Upload] Groq responded successfully! Length: ${extractedText.length} chars`);

    await Document.findByIdAndUpdate(documentId, {
      status: 'completed',
      extractedText,
      formulas: ['See extracted content for formulas']
    });

    console.log(`[Upload] Successfully saved extracted content for: ${originalName}`);
  } catch (error: any) {
    console.error(`[Upload] Groq processing FAILED for ${originalName}:`, error?.message || error);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      extractedText: `Processing failed: ${error?.message || 'Unknown error'}. Please try again.`
    });
  }
}
