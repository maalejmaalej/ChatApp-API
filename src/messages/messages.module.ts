import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesSchema } from './messages.schema';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Messages', schema: MessagesSchema }]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService,
    ],
})
export class MessagesModule {}
