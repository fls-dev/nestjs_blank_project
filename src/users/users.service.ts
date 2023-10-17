import {HttpException, HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../models/user.entity";
import { Repository } from 'typeorm';
import * as CryptoJS from 'crypto-js'


@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private user: Repository<User>,) {}

    findAll(): Promise<User[]> {
        return this.user.find();
    }

    async create(body) {
        const candidate = await this.user.findOne({where:{email:body.email}})
        if(!candidate){
            const hash = CryptoJS.AES.encrypt(body.password, process.env.PASSWORD_KEY).toString();
            // const hashPassword = await bcrypt.hash(body.password, 9);
            let login=body.login;
            if(body.login===''){
                login = new Date().getTime().toString()
            }
            const creating = await this.user.save({...body, password:hash, login:login});
            return {status: true, user: creating}
        }else {
            throw new HttpException('User with this Email already exists', HttpStatus.BAD_REQUEST)
        }
    }

    async updateProfile(body) {
        const findUser = await this.user.findOne({
            where: [{id: body.id}]
        });
        if (findUser) {
            const hash = CryptoJS.AES.encrypt(body.password, process.env.PASSWORD_KEY).toString();
            const saveUser =
                await this.user.save({
                ...findUser,
                email: body.email,
                password: hash,
                firstName: body.firstName,
                lastName: body.lastName,
                phone: body.phone,
                add_phone: body.add_phone,
                position: body.position
            });
            return {
                status: true,
                user: btoa(JSON.stringify(saveUser)),
            }
        } else {
            return {
                status: false,
                message:"Error update"
            }
        }
    }

    findOne(id: number): Promise<User> {
        return this.user.findOneBy({ id });
    }

    async remove(id: string): Promise<void> {
        await this.user.delete(id);
    }
}
