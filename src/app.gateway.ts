import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { UserDocument } from './user/user.schema';
import { UserService } from './user/user.service';

@WebSocketGateway({
  namespace: 'connexion',
  cors:true,
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{  constructor(@InjectModel('Users') private readonly userSchema: Model<UserDocument>) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  private usersConnected = {};

  @SubscribeMessage('msgtoserver')
  handleMessage(client: Socket, payload: any): void {
    this.server.emit('msgToClient/'+payload.to, payload);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }
  @SubscribeMessage('userConnected')
  async userConnected(client: Socket, userId: any): Promise<void> {
    this.usersConnected[userId] = client.id;
    await this.userSchema.findByIdAndUpdate(userId, {
      $set: {
        active: true,
      },
    });
    const users = await this.userSchema.aggregate([{ $sort: { active: -1 } }]);
    this.server.emit('usersConnected',users)
  }
  @SubscribeMessage('userDisconnected')
  async userDisconnected(client: Socket, userId: any): Promise<void> {
    delete this.usersConnected[userId]
    await this.userSchema.findByIdAndUpdate(userId, {
      $set: {
        active: false,
      },
    });
    const users = await this.userSchema.aggregate([{ $sort: { active: -1 } }]);    
    this.server.emit('usersConnected',users)
  }
  @SubscribeMessage('callUser')
  callUser(client: Socket, data: any): void {
    this.server
      .to(this.usersConnected[data.to._id])
      .emit(`callUser`, {
        video:data.video,
        from: data.from,
        signal: data.signal,
        clientId: client.id,
      });
  }
  @SubscribeMessage('answerCall')
  answerCall(client: Socket, data: any): void {
    this.server
      .to(data.to)
      .emit('callAccepted', { signal: data.signal, clientId: client.id });
  }
  @SubscribeMessage('callEnded')
  callEnded(client: Socket, data: any): void {
    this.server
      .to(this.usersConnected[data.to])
      .emit('callEnded');
  }

  handleDisconnect(client: Socket) {
    delete this.usersConnected[client.id];
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  @SubscribeMessage('disconnect')
  disconnect(client: Socket): void {
    this.server.emit('callEnded');
  }
}
