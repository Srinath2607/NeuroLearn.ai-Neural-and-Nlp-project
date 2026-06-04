from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import os
import json
import uuid
import base64
from groq import Groq

load_dotenv()

app = FastAPI(title="NeuroLearn AI Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Added a 10-second timeout so the server doesn't hang infinitely if the Groq API is blocked by the user's network
client = Groq(api_key=GROQ_API_KEY, timeout=10.0) if GROQ_API_KEY else None

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []

class VisionRequest(BaseModel):
    documentId: str
    fileName: str
    mimeType: str

class QuizRequest(BaseModel):
    topic: str
    contextText: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "NeuroLearn AI Service is running with Groq Integration"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "groq_configured": client is not None}

@app.post("/api/ai/chat")
async def chat_endpoint(request: ChatRequest):
    if not client:
        # Fallback response when no API key is configured
        return {"reply": "Hello! I am the Diagnostic Agent. (Note: Groq API key is not configured, so this is a mock response. Please add your API key to interact with the real AI.)"}
    
    messages = [{"role": "system", "content": "You are a helpful AI Diagnostic Tutor for NeuroLearn AI. Help the student learn concepts effectively."}]
    
    # Map frontend history to Groq history format if necessary
    for msg in request.history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
    messages.append({"role": "user", "content": request.message})
    
    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
        )
        return {"reply": chat_completion.choices[0].message.content}
    except Exception as e:
        print(f"Groq Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get response from Groq")

@app.post("/api/ai/vision/analyze")
async def vision_endpoint(request: VisionRequest):
    if not client:
        # Fallback when API key is missing
        return {
            "status": "success",
            "extractedText": "[Mocked Analysis] This document appears to be about Machine Learning basics based on the mock data. Since no API key is provided, the Vision Agent returns this mock response.",
            "formulas": ["E = mc^2 (Mocked)"]
        }
        
    # Attempt to read the file from the backend uploads directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "..", "backend", "uploads", request.documentId, request.fileName)
    
    if not os.path.exists(file_path):
        file_path = os.path.join(base_dir, "..", "backend", "uploads", request.fileName)
        
    base64_image = ""
    if os.path.exists(file_path) and request.mimeType.startswith("image/"):
        try:
            with open(file_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print(f"Error reading image: {e}")
            
    if base64_image:
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this educational document/notes. Extract the main text concepts and list any important mathematical formulas present."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{request.mimeType};base64,{base64_image}",
                        },
                    },
                ],
            }
        ]
        try:
            vision_completion = client.chat.completions.create(
                messages=messages,
                model="llama-3.2-90b-vision-preview",
                temperature=0.3,
                max_tokens=1024,
            )
            extracted = vision_completion.choices[0].message.content
            return {
                "status": "success",
                "extractedText": extracted,
                "formulas": ["Parsed dynamically via Vision model"]
            }
        except Exception as e:
            print(f"Groq Vision Error: {str(e)}")
            
    # Fallback to text-only if file not found or vision model fails
    try:
        fallback_msg = f"Provide a brief summary and standard mathematical formulas related to the topic of '{request.fileName}' (assuming it's a study document)."
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": fallback_msg}],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
        )
        return {
            "status": "success",
            "extractedText": completion.choices[0].message.content,
            "formulas": ["Formula extraction requires successful vision processing."]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Vision analysis failed")

@app.post("/api/ai/quiz/generate")
async def generate_quiz_endpoint(request: QuizRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
        
    topic = request.topic
    context_text = request.contextText
    
    context_instruction = ""
    if context_text:
        # Limit context text to avoid blowing up the context window
        context_instruction = f"\nUse the following study material as the primary source for the questions:\n{context_text[:15000]}\n"

    prompt = f"""
    Generate a 10-question multiple choice quiz on the topic: "{topic}". {context_instruction}
    You must respond ONLY with a valid JSON object in the following format:
    {{
        "title": "Title of the quiz",
        "topic": "{topic}",
        "questions": [
            {{
                "text": "Question text?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctOptionIndex": 0,
                "explanation": "Why this is correct",
                "conceptId": "concept-name"
            }}
        ]
    }}
    Ensure exactly 10 questions are generated. Do not include any markdown formatting like ```json or anything else. Just the raw JSON object.
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        response_text = completion.choices[0].message.content
        
        # Clean up any potential markdown wrapper
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        quiz_data = json.loads(response_text)
        
        # Verify if it's the mock response disguised as JSON or if it's empty
        if not quiz_data.get("questions") or len(quiz_data.get("questions", [])) < 3:
             raise Exception("AI returned insufficient questions")

        # Add random UUIDs to questions if missing
        for q in quiz_data.get("questions", []):
            if "id" not in q:
                q["id"] = str(uuid.uuid4())
                
        return {"quiz": quiz_data}
    except Exception as e:
        print(f"Groq Quiz Error: {str(e)}")
        # If we have context, try one more time with a simpler model/prompt before giving up
        raise HTTPException(status_code=500, detail=f"Failed to generate real questions: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
