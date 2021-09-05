import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppGateway } from 'src/app.gateway';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('Users') private readonly userSchema: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const telIsExist = await this.userSchema.findOne({
      tel: createUserDto.tel,
    });
    if (telIsExist) {
      return { telExist: true };
    }
    const emailIsExist = await this.userSchema.findOne({
      email: createUserDto.email,
    });
    if (emailIsExist) {
      return { emailExist: true };
    }
    const date = new Date(
      createUserDto.year,
      createUserDto.month - 1,
      createUserDto.day + 1,
    );
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    return await this.userSchema.create({
      nom: createUserDto.nom,
      prenom: createUserDto.prenom,
      birthdate: date,
      tel: createUserDto.tel,
      email: createUserDto.email,
      password: hash,
      active: false,
    });
  }
  async updateStatut(id: string, active: boolean): Promise<any> {
    await this.userSchema.findByIdAndUpdate(id, {
      $set: {
        active: active,
      },
    });
    const users = await this.userSchema.aggregate([{ $sort: { active: -1 } }]);
    return users;
  }

  async findAll(): Promise<any> {
    return await this.userSchema.find();
  }

  async findOne(id: string): Promise<any> {
    return await this.userSchema.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const emailIsExist = await this.userSchema.findOne({
      email: updateUserDto.email,
    });
    if (emailIsExist && emailIsExist._id.toString() !== id) {
      return { emailExist: true };
    }

    const telIsExist = await this.userSchema.findOne({
      tel: updateUserDto.tel,
    });
    if (telIsExist && telIsExist._id.toString() !== id) {
      return { telExist: true };
    }

    const password = (await this.userSchema.findById(id)).password;
    const isMatch = await bcrypt.compare(updateUserDto.password, password);
    if (isMatch) {
      const date = new Date(
        updateUserDto.year,
        updateUserDto.month - 1,
        updateUserDto.day + 1,
      );
      return await this.userSchema.findByIdAndUpdate(id, {
        $set: {
          nom: updateUserDto.nom,
          prenom: updateUserDto.prenom,
          birthdate: date,
          tel: updateUserDto.tel,
          email: updateUserDto.email,
        },
      });
    } else {
      return { message: 'IncorrectPassword' };
    }
  }

  async remove(id: string): Promise<any> {
    return await this.userSchema.findByIdAndDelete(id);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const client = await this.userSchema.findOne({ email: email });
    if (client) {
      const isMatch = await bcrypt.compare(pass, client.password);
      if (isMatch) {
        return client;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  async login(user: any) {
    const payload = { username: user.email, id: user._id };
    return { access_token: this.jwtService.sign(payload) };
  }
  async addImage(id: string, file): Promise<any> {
    if (file) {
      await this.userSchema.findByIdAndUpdate(id, {
        $set: { image: file.filename },
      });
      return file.filename;
    } else {
      await this.userSchema.findByIdAndUpdate(id, {
        $set: { image: null },
      });
      return null;
    }
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<any> {
    const password = (await this.userSchema.findById(id)).password;
    const isMatch = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      password,
    );
    if (isMatch) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(
        updatePasswordDto.newPassword,
        saltOrRounds,
      );
      return await this.userSchema.findByIdAndUpdate(id, {
        $set: { password: hash },
      });
    } else {
      return 'passwordIncorrect';
    }
  }
}
