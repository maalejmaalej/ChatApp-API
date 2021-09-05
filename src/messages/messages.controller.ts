import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res,Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Res() res) {
    try {
      const message= await this.messagesService.create(createMessageDto);
      return res.status(HttpStatus.OK).send({
        status:HttpStatus.OK,
        message:message,
    })
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status:HttpStatus.INTERNAL_SERVER_ERROR,
        err:err
      })
    }
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get('discussion/:idfrom/:idto')
  async findDuscussion(
    @Query('page') page: number,
    @Param('idfrom') idfrom: string,
    @Param('idto') idto: string,
    @Res() res):Promise<any> {
      try {
        const dusc= await this.messagesService.findDuscussion(idfrom,idto,page);
        return res.status(HttpStatus.OK).send({
          status:HttpStatus.OK,
          duscussion:dusc,
      })
      } catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          status:HttpStatus.INTERNAL_SERVER_ERROR,
          err:err
        })
      }
  }
  @Get('lastmsg/:idfrom/:idto')
  async getlastMessage(
    @Param('idfrom') idfrom: string,
    @Param('idto') idto: string,
    @Res() res):Promise<any> {
      try {
        const lastMsg= await this.messagesService.getlastMessage(idfrom,idto);
        return res.status(HttpStatus.OK).send({
          status:HttpStatus.OK,
          lastMessage:lastMsg,
      })
      } catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          status:HttpStatus.INTERNAL_SERVER_ERROR,
          err:err
        })
      }
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res):Promise<any> {
    try {
      this.messagesService.remove(id);
      return res.status(HttpStatus.OK).send({
        status:HttpStatus.OK,
    })
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status:HttpStatus.INTERNAL_SERVER_ERROR,
        err:err
      })
    }
  }
}
