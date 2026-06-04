import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  conceptId: string;
}

export interface IQuiz extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  topic: string;
  documentId?: mongoose.Types.ObjectId;
  questions: IQuestion[];
  score?: number;
  completedAt?: Date;
  status: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
  conceptId: { type: String, required: true }
}, { _id: false });

const QuizSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    questions: [QuestionSchema],
    score: { type: Number },
    completedAt: { type: Date },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
