import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignInDto } from './dto/signIn.dto';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

export const storage = {
  storage: diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res): Promise<any> {
    try {
      const user = await this.userService.create(createUserDto);
      if (user._id) {
        return res.status(HttpStatus.OK).send({
          status: HttpStatus.OK,
          user: user,
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status: HttpStatus.BAD_REQUEST,
          erreur: user,
        });
      }
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        err: err,
      });
    }
  }
  @Get()
  async findAll(@Res() res): Promise<any> {
    try {
      const users = await this.userService.findAll();
      return res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        users: users,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        err: err,
      });
    }
  }
  // @UseGuards(JwtAuthGuard)
  @Get('image/:imagename')
  getFile(@Res() res, @Param('imagename') imagename) {
    try {
      const file = createReadStream(
        join(process.cwd(), 'uploads/images/' + imagename),
      );
      file.pipe(res);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: HttpStatus.BAD_REQUEST,
        err: err,
      });
    }
  }
  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res): Promise<any> {
    try {
      const user = await this.userService.findOne(id);
      return res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        user: user,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        err: err,
      });
    }
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res): Promise<any> {
    try {
      this.userService.remove(id);
      return res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        err: err,
      });
    }
  }

  @Post('signin')
  async login(@Body() body: SignInDto, @Res() res): Promise<any> {
    try {
      const user = await this.userService.validateUser(body.email, body.password);
      if (user === false) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status: HttpStatus.BAD_REQUEST,
          user: user,
        });
      }
      const { access_token } = await this.userService.login(user);
      return res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        user: user,
        token: access_token,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        err: err,
      });
    }
  }
  // @UseGuards(JwtAuthGuard)
  @Post('image/:id')
  @UseInterceptors(FileInterceptor('image', storage))
  async createImage(
    @Param('id') id: string,
    @Res() res,
    @UploadedFile() file,
  ): Promise<any> {
    try {
      const image = await this.userService.addImage(id, file);
      return res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        image: image,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        err: err,
      });
    }
  }
  // @UseGuards(JwtAuthGuard)
  @Post('updatepassword/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res() res,
  ): Promise<any> {
    try {
      const user = await this.userService.updatePassword(id, updatePasswordDto);
      return res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        user: user,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        err: err,
      });
    }
  }
  // @UseGuards(JwtAuthGuard)
  @Post('updateinfo/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res,
  ): Promise<any> {
    try {
      const user = await this.userService.update(id, updateUserDto);
      if (user._id) {
        return res.status(HttpStatus.OK).send({
          status: HttpStatus.OK,
          upUser: user,
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status: HttpStatus.BAD_REQUEST,
          erreur: user,
        });
      }
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        err: err,
      });
    }
  }
}
