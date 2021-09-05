import { IsNotEmpty, IsString } from "class-validator";

export class CreateMessageDto {
    @IsNotEmpty()
    @IsString()
    from:string;

    @IsNotEmpty()
    @IsString()
    to:string;

    @IsNotEmpty()
    @IsString()
    message:string;
}
