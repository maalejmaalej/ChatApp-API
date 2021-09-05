import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MessagesModule } from './messages/messages.module';
import { AppGateway } from './app.gateway';
import { UserService } from './user/user.service';
import { UserSchema } from './user/user.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://sadak:sadak123@cluster0-shard-00-00.lqohm.mongodb.net:27017,cluster0-shard-00-01.lqohm.mongodb.net:27017,cluster0-shard-00-02.lqohm.mongodb.net:27017/projet?authSource=admin&replicaSet=atlas-61h2u0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true',
      {
        useCreateIndex: true,
        useFindAndModify: false,
      },
    ),
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),

    UserModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
