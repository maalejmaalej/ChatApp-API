import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';

export type MessagesDocument = Messages & Document;

@Schema()
export class Messages {
    @Prop({required:true, type: Types.ObjectId, ref:"users"})
    from:ObjectId

    @Prop({required:true, type: Types.ObjectId, ref:"users"})
    to:ObjectId

    @Prop({required:true})
    message: string;

    @Prop({required:true})
    date: Date;

}

export const MessagesSchema = SchemaFactory.createForClass(Messages);