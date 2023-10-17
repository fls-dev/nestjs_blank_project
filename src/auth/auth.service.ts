import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs'
import {SessionControl} from "../models/session-control.entity";
import {User} from "../models/user.entity";
import * as CryptoJS from 'crypto-js'

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User)
                public readonly user: Repository<User>,
                @InjectRepository(SessionControl)
                public readonly Session: Repository<SessionControl>,
                private JwtService: JwtService) {
    }


    async login(body, browser) {
        const findUser = await this.user.findOne({
            where: [
                {login: body.login},
                {email: body.login}
            ],
        });
        if (findUser) {
            const originalPass = CryptoJS.AES.decrypt(findUser.password, process.env.PASSWORD_KEY).toString(CryptoJS.enc.Utf8);
            if (originalPass === body.password) {
                const payload = {id: findUser.id}
                const payloadRefresh = {id: findUser.id, browser, now: Date.now()}

                const accessToken = this.JwtService.sign(payload, {expiresIn: '1h'});
                const refreshToken = this.JwtService.sign(payloadRefresh, {
                    expiresIn: '60d',
                    secret: process.env.REFRESH_KEY_JWT
                })

                let expiresIn = new Date();
                expiresIn.setMonth(expiresIn.getMonth() + 1);

                const saveSession = await this.Session.save({
                    userId: findUser.id,
                    refreshToken,
                    ua: browser,
                    expiresIn: expiresIn
                });

                const infoUser = {
                    id: findUser.id,
                    email: findUser.email,
                    password: findUser.password,
                    firstName: findUser.firstName,
                    lastName: findUser.lastName,
                    link_logo: findUser.link_logo,
                    phone: findUser.phone,
                    add_phone: findUser.add_phone,
                    group: findUser.group,
                    lang: findUser.lang,
                    position: findUser.position,
                }
                return {
                    status: true,
                    user: btoa(JSON.stringify(infoUser)),
                    accessToken,
                    refreshToken
                }
            } else throw new UnauthorizedException({status: false, message: 'no correct password'})
        } else {
            throw new UnauthorizedException({status: false, message: 'no correct user'})
        }
    }

    async refreshToken(refreshOld, browser) {
        try {
            const refreshDecode = await this.JwtService.verify(refreshOld, {secret: process.env.REFRESH_KEY_JWT})
            // console.log(refreshDecode)
            // return accessOld;
            const userId = refreshDecode.id;
            const count = await this.Session.countBy({userId: userId})
            const session = await this.Session.findOneBy({refreshToken: refreshOld, userId: userId});
            // console.log(count)
            if (session) {
                // return count;
                const payload = {id: userId}
                const payloadRefresh = {id: userId, browser, now: Date.now()}

                const accessToken = this.JwtService.sign(payload, {expiresIn: '1h'});
                const refreshToken = this.JwtService.sign(payloadRefresh, {
                    expiresIn: '60d',
                    secret: process.env.REFRESH_KEY_JWT
                })

                let expiresIn = new Date();
                expiresIn.setMonth(expiresIn.getMonth() + 1);

                if (count < 2) {
                    // const updateSession =
                    await this.Session.save(
                        {refreshToken: refreshToken, expiresIn: expiresIn, id: session.id}
                    )
                } else {
                    // const deleteSessions =
                    await this.Session.delete({userId: userId})
                    // const saveSession =
                    await this.Session.save(
                        {
                            userId: userId,
                            refreshToken,
                            ua: browser,
                            expiresIn: expiresIn
                        }
                    )
                }
                return {
                    status: true,
                    accessToken,
                    refreshToken
                }
            } else {
                return {
                    status: false,
                    refreshToken: false
                }
            }
        } catch (err) {
            return {status: false, err}
        }
    }
}
