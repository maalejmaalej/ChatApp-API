import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "secret token",
    });
  }

    async validate(payload: any) {
        const user = await this.userService.findOne(payload.id)
        if (user){
            return { userId: payload.id, username: payload.username };
        }else{
            throw new UnauthorizedException({mesaage:"user not found"})
        }
  }
}