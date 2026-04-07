import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatSessionDocument = ChatSession & Document;

@Schema({ collection: 'chat_sessions', timestamps: { createdAt: 'started_at', updatedAt: 'updated_at' } })
export class ChatSession {
  @Prop({ required: true })
  user_id: string;

  @Prop({ type: String, default: null })
  lesson_id: string | null;

  @Prop({ default: 'New Chat' })
  title: string;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);
