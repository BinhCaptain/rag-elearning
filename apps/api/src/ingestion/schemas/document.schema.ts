import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IngestionDocumentDocument = IngestionDocument & Document;

export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR';

@Schema({
  collection: 'ingestion_documents',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class IngestionDocument {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ type: String, required: true, enum: ['PENDING', 'PROCESSING', 'DONE', 'ERROR'], default: 'PENDING' })
  status: string;

  @Prop({ type: String, default: null })
  lesson_id: string | null;

  @Prop({ type: String, default: null })
  error_message: string | null;

  @Prop({ default: 0 })
  chunk_count: number;

  @Prop({ required: true })
  uploaded_by: string;

  @Prop({ type: String, default: null })
  topic: string | null;

  @Prop({ type: String, default: null })
  level: string | null;
}

export const IngestionDocumentSchema = SchemaFactory.createForClass(IngestionDocument);
