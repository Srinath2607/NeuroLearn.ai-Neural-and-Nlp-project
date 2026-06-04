"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  MoreVertical,
  Plus,
  MessageSquare,
  FileText,
  CheckCircle2,
  X,
  Square,
  Zap
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

// Basic streaming hook simulation
const useStreamText = (text: string, isStreaming: boolean, onUpdate?: (val: string) => void, speed: number = 20) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text || "");
      return;
    }

    setDisplayedText("");
    const safeText = text || "";
    let i = 0;
    const intervalId = setInterval(() => {
      const newChar = safeText.charAt(i);
      setDisplayedText((prev) => {
        const next = prev + newChar;
        if (onUpdate) onUpdate(next);
        return next;
      });
      i++;
      if (i >= safeText.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, isStreaming, speed]);

  return displayedText;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const currentStreamingTextRef = useRef("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/upload", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        interface Document {
          _id: string;
          status: string;
          originalName: string;
          extractedText: string;
        }
        setDocuments((data as Document[]).filter((doc: Document) => doc.status === 'completed'));
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewChat = () => {
    setMessages([]);
    setSelectedDoc(null);
    setInput("");
    setIsTyping(false);
    setIsResponding(false);
    setStreamingMessageId(null);
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }

    // Truncate the message in the state to exactly where it was stopped
    if (streamingMessageId) {
      setMessages(prev => prev.map(m => 
        m.id === streamingMessageId 
          ? { ...m, content: currentStreamingTextRef.current } 
          : m
      ));
    }

    setIsTyping(false);
    setIsResponding(false);
    setStreamingMessageId(null);
  };

  const handleFlashAnswer = () => {
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }
    
    // By clearing the streaming ID immediately, the component shows the full text
    setStreamingMessageId(null);
    setIsResponding(false);
    setIsTyping(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessageId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    const userMessage = { role: "user", content: currentInput, id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setIsResponding(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      let messageContent = currentInput;
      if (selectedDoc) {
        messageContent = `I am asking about the document: "${selectedDoc.originalName}". 
        Context from document: ${selectedDoc.extractedText}
        
        Question: ${currentInput}`;
      }

      const res = await fetch("http://127.0.0.1:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ 
          message: messageContent, 
          history: history.slice(-5)
        })
      });

      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      if (controller.signal.aborted) return;

      setIsTyping(false);
      setAbortController(null);
      const aiMessageId = Date.now() + 1;
      setStreamingMessageId(aiMessageId);
      
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: data.reply, id: aiMessageId }
      ]);

      // Stop streaming effect after a delay based on length
      const timeout = setTimeout(() => {
        setStreamingMessageId(null);
        setIsResponding(false);
        streamTimeoutRef.current = null;
      }, data.reply.length * 20);
      
      streamTimeoutRef.current = timeout;

    } catch (error: any) {
      setIsTyping(false);
      setIsResponding(false);
      setAbortController(null);
      
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Sidebar History */}
      <div className="hidden lg:flex w-64 flex-col gap-4 border-r border-border pr-4">
        <button 
          onClick={startNewChat}
          className="w-full flex items-center justify-between bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <span>New Chat</span>
          <Plus className="h-4 w-4" />
        </button>
        
        <div className="flex flex-col gap-2 overflow-y-auto mt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Uploaded Notes</p>
          {documents.length === 0 ? (
            <p className="text-xs text-muted-foreground italic px-3">No processed notes found.</p>
          ) : (
            documents.map((doc) => (
              <button 
                key={doc._id} 
                onClick={() => setSelectedDoc(doc)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-colors ${selectedDoc?._id === doc._id ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm">{doc.originalName}</span>
              </button>
            ))
          )}
          
          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recent Chats</p>
            {["Understanding Neural Architectures", "Optimization Strategies", "Data Preprocessing"].map((chat, i) => (
              <button key={i} className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary/50 transition-colors`}>
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm">{chat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden relative shadow-sm">
        {/* Chat Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-card/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Diagnostic Agent</h2>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online
              </p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Bot className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">How can I help you learn today?</h3>
              <p className="max-w-sm text-sm">Ask me about any topic, or upload a document for me to analyze.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isStreaming={streamingMessageId === msg.id}
                onStreamUpdate={(val) => {
                  if (streamingMessageId === msg.id) {
                    currentStreamingTextRef.current = val;
                  }
                }}
              />
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-4 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          {selectedDoc && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-center justify-between bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="bg-primary/20 p-1.5 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Tutor Mode Active</span>
                  <span className="text-xs font-medium truncate">{selectedDoc.originalName}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1 hover:bg-primary/20 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-primary" />
              </button>
            </motion.div>
          )}
          
          <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 bg-secondary border border-border rounded-2xl p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all"
          >
            <button type="button" className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 py-2 text-sm placeholder:text-muted-foreground"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            {isResponding ? (
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={handleFlashAnswer}
                  className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all mb-0.5"
                  title="Flash full answer"
                >
                  <Zap className="h-4 w-4 fill-current" />
                </button>
                <button 
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all mb-0.5"
                  title="Stop here"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              </div>
            ) : (
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-0.5"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground">AI can make mistakes. Consider verifying important information.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual messages
function ChatMessage({ message, isStreaming, onStreamUpdate }: { message: any, isStreaming: boolean, onStreamUpdate?: (val: string) => void }) {
  const isUser = message.role === "user";
  const displayedContent = useStreamText(message.content, isStreaming, onStreamUpdate, 15);
  
  return (
    <div className={`flex gap-4 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? "bg-accent text-accent-foreground" : "bg-primary/20 text-primary"}`}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      <div 
        className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser 
            ? "bg-accent text-accent-foreground rounded-tr-sm" 
            : "bg-secondary text-secondary-foreground rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-border">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
            >
              {isStreaming ? displayedContent : message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
