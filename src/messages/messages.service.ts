import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppGateway } from 'src/app.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesDocument } from './messages.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Messages')
    private readonly messagesSchema: Model<MessagesDocument>,
    // private getway: AppGateway,
  ) {}
  async create(createMessageDto: CreateMessageDto): Promise<any> {
    const message = await this.messagesSchema.create({
      from: Types.ObjectId(createMessageDto.from),
      to: Types.ObjectId(createMessageDto.to),
      date: new Date(),
      message: createMessageDto.message,
    });
    // this.getway.server.emit('msgToClient/' + createMessageDto.to, message);
    return message;
  }

  async findAll(): Promise<any> {
    return await this.messagesSchema.find();
  }

  async findDuscussion(idfrom: string, idto: string, page: number): Promise<any> {
    return await this.messagesSchema.aggregate([
      {
        $match: {
          $or: [
            { from: Types.ObjectId(idfrom) },
            { from: Types.ObjectId(idto) },
          ],
        },
      },
      {
        $match: {
          $or: [{ to: Types.ObjectId(idfrom) }, { to: Types.ObjectId(idto) }],
        },
      },
      { $sort: { date : -1 }},
      { $limit: page* 30},
      { $skip : (page-1)* 30}
      
    ]);
  }
  async getlastMessage(idfrom: string, idto: string): Promise<any> {
    const lastmsg = await this.messagesSchema.aggregate([
      {
        $match: {
          $or: [
            { from: Types.ObjectId(idfrom) },
            { from: Types.ObjectId(idto) },
          ],
        },
      },
      {
        $match: {
          $or: [{ to: Types.ObjectId(idfrom) }, { to: Types.ObjectId(idto) }],
        },
      },
      { $sort: { date : -1 }},
      { $limit: 1}
    ]);
    return lastmsg[0];
  }

  async findOne(id: string): Promise<any> {
    return await this.messagesSchema.findById(id);
  }

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: string) {
    return this.messagesSchema.findByIdAndRemove(id);
  }
}
