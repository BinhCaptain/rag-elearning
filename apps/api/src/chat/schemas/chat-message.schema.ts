import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

export class RetrievedSource {
  chunk_text: string;
  score: number;
  source_id: string;
  topic?: string;
  level?: string;
}

@Schema({ collection: 'chat_messages', timestamps: { createdAt: 'created_at', updatedAt: false } })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, required: true, ref: 'ChatSession' })
  session_id: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['USER', 'ASSISTANT', 'SYSTEM'] })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [Object], default: [] })
  retrieved_sources: RetrievedSource[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
ChatMessageSchema.index({ session_id: 1, created_at: 1 });
