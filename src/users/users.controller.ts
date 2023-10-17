import {Body, Controller, Get, Headers, HttpCode, Post, UseGuards} from '@nestjs/common';
import {UsersService} from "./users.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('user')

export class UsersController {
    constructor(private readonly user: UsersService) {}

    @HttpCode(200)
    @Get('/find-all')
    @UseGuards(JwtAuthGuard)
    async findAll(){
        return await this.user.findAll()
    }

    @HttpCode(200)
    @Post('/create')

    async create(@Body() body){
        return await this.user.create(body)
    }

    @HttpCode(200)
    @Post('/update')
    async update(@Body() body){
        return await this.user.updateProfile(body)
    }


}
