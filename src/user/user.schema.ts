import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({required:true})
    nom: string;

    @Prop({required:true})
    prenom: string;

    @Prop({required:true})
    birthdate: Date;

    @Prop({required:true, unique:true})
    tel: number;

    @Prop({required:true, unique:true})
    email: string;

    @Prop({required:true})
    password: string;

    @Prop()
    image: string;

    @Prop({required:true})
    active: Boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);