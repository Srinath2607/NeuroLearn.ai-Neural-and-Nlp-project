# NeuroLearn AI – Multi-Agent Personalized Adaptive Learning Platform

NeuroLearn AI is a production-ready, full-stack AI educational SaaS platform designed to provide a futuristic, personalized learning experience. It leverages a multi-agent AI architecture to handle diagnostic tutoring, vision-based document processing, knowledge tracking, and adaptive curriculum generation.

## 🚀 Key Features

- **Multi-Agent AI Intelligence**:
    - **Diagnostic Agent**: Real-time AI tutoring with LaTeX and Markdown support.
    - **Vision Agent**: Multimodal processing for handwritten notes and diagrams.
    - **Tracker Agent**: Interactive 3D/2D Knowledge Graph of learning mastery.
    - **Curriculum Agent**: Dynamic quiz and syllabus generation based on performance.
- **Premium UI/UX**: Built with Next.js 15, Tailwind CSS v4, and Framer Motion for high-performance, glassmorphic UI.
- **Gamification**: Real-time XP, Levels, Badges, and Leaderboards.
- **Advanced Analytics**: Interactive charts (Recharts) for tracking learning velocity.
- **Secure Architecture**: JWT-based authentication with protected dashboard routes.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, Recharts, XYFlow (React Flow).
- **Backend (API Gateway)**: Node.js, Express, TypeScript, Mongoose, Socket.io, Multer, JWT.
- **AI Service**: Python, FastAPI, Pydantic, Uvicorn.
- **Database**: MongoDB (Atlas or Local).

## 📂 Project Structure

```text
/
├── frontend/           # Next.js 15 Web Application
├── backend/            # Express.js API Gateway
├── ai-service/         # Python AI microservice (FastAPI)
├── docker-compose.yml  # Orchestration for all services
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env with MONGO_URI, JWT_SECRET, AI_SERVICE_URL
npm run dev
```

### 2. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
# Configure .env
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Configure .env.local with NEXT_PUBLIC_API_URL
npm run dev
```

## 🧪 Development & Testing

- **API Documentation**: The backend runs on `http://localhost:5000/api`.
- **AI Microservice**: Exposed at `http://localhost:8000`.
- **Frontend Dashboard**: Accessible at `http://localhost:3000/dashboard`.

## 🛡 Security & Best Practices

- **Authentication**: Stateless JWT-based auth stored in `localStorage` with middleware protection on all sensitive routes.
- **Data Validation**: Schema-based validation using Mongoose.
- **Styling**: Atomic CSS principles using Tailwind CSS v4 for maximum efficiency.
- **Performance**: Optimized Next.js 15 builds with server-side components where appropriate.

## 📄 License
MIT License.

