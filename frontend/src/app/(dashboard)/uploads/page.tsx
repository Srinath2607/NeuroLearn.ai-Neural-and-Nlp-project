"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2,
  X,
  FileSearch,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  // Fetch past documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/upload", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(() => {
      fetchDocuments();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    }
  });

  const removeFile = (name: string) => {
    setFiles(files.filter(f => f.name !== name));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    const token = localStorage.getItem("token");

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 10;
      });
    }, 200);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        await fetch("http://localhost:5001/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
      } catch (err) {
        console.error(err);
      }
    }

    clearInterval(progressInterval);
    setProgress(100);
    
    setTimeout(() => {
      setFiles([]);
      setUploading(false);
      setProgress(0);
      fetchDocuments();
    }, 1000);
  };

  const toggleExpand = (docId: string) => {
    setExpandedDoc(prev => prev === docId ? null : docId);
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Vision & OCR Uploads</h1>
        <p className="text-muted-foreground">
          Upload handwritten notes, engineering diagrams, or PDFs. Our AI will extract the text, formulas, and concepts automatically.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Upload Zone */}
        <div className="flex flex-col gap-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
              isDragActive 
                ? "border-primary bg-primary/5 scale-[1.02]" 
                : "border-border hover:border-primary/50 hover:bg-secondary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <UploadCloud className={`h-10 w-10 ${isDragActive ? "text-primary animate-bounce" : "text-primary"}`} />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </h3>
            <p className="text-muted-foreground mb-6">
              or click to browse from your computer
            </p>
            <div className="flex gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full"><ImageIcon className="h-3 w-3" /> JPG, PNG</span>
              <span className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full"><FileText className="h-3 w-3" /> PDF</span>
            </div>
          </div>

          {/* Upload Queue */}
          {files.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h4 className="font-semibold mb-4">Files to upload ({files.length})</h4>
              <div className="space-y-3">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {file.type.includes('image') ? <ImageIcon className="h-8 w-8 text-blue-500 shrink-0" /> : <FileText className="h-8 w-8 text-red-500 shrink-0" />}
                      <div className="truncate">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    {!uploading && (
                      <button onClick={() => removeFile(file.name)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {uploading && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Uploading & analyzing with AI...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-primary h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                {uploading ? "Processing..." : "Upload & Analyze"}
              </button>
            </div>
          )}
        </div>

        {/* Processed Documents Section */}
        <div className="bg-card border border-border rounded-3xl p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Your Library
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                <FileSearch className="h-12 w-12 text-muted-foreground" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} className="border border-border bg-secondary/30 rounded-2xl overflow-hidden transition-colors hover:border-primary/40">
                  {/* Document Header - always visible */}
                  <button 
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => doc.status === 'completed' ? toggleExpand(doc._id) : null}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                      {doc.mimeType?.includes('image') ? <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" /> : <FileText className="h-5 w-5 text-red-500 shrink-0" />}
                      <span className="font-medium text-sm truncate" title={doc.originalName}>{doc.originalName}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {doc.status === 'processing' ? (
                        <Loader2 className="h-4 w-4 text-accent animate-spin" />
                      ) : doc.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {expandedDoc === doc._id ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                        </>
                      ) : doc.status === 'failed' ? (
                        <span className="text-xs text-destructive flex gap-1 items-center font-bold"><X className="h-4 w-4"/> Failed</span>
                      ) : null}
                    </div>
                  </button>

                  {/* Expanded extracted content */}
                  <AnimatePresence>
                    {expandedDoc === doc._id && doc.status === 'completed' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 flex flex-col gap-3">
                          {doc.extractedText && (
                            <div className="bg-background border border-border rounded-xl p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Extracted Content</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{doc.extractedText}</p>
                            </div>
                          )}
                          {doc.formulas && doc.formulas.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {doc.formulas.map((f: string, i: number) => (
                                <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
