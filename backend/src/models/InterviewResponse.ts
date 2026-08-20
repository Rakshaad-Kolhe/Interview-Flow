import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewResponse extends Document {
  interviewId: string;
  question: string;
  answer: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

const FeedbackSchema = new Schema({
  score: { type: Number, required: true },
  comment: { type: String, required: true }
});

const InterviewResponseSchema: Schema = new Schema({
  interviewId: { type: String, required: true },
  // Embedding vs referencing relationships
  feedback: [FeedbackSchema],
  
  // Referencing relationships (NoSQL Mongo) - Evaluator references another collection
  evaluatorId: { type: Schema.Types.ObjectId, ref: 'User' },

  question: { type: String, required: true },
  answer: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export const InterviewResponse = mongoose.model<IInterviewResponse>('InterviewResponse', InterviewResponseSchema);
