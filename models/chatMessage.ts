import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  username: string;
  message: string;
  createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
  username: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
