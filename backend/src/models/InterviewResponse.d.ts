import mongoose, { Document } from 'mongoose';
export interface IInterviewResponse extends Document {
    interviewId: string;
    question: string;
    answer: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
export declare const InterviewResponse: mongoose.Model<IInterviewResponse, {}, {}, {}, Document<unknown, {}, IInterviewResponse, {}, mongoose.DefaultSchemaOptions> & IInterviewResponse & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInterviewResponse>;
//# sourceMappingURL=InterviewResponse.d.ts.map