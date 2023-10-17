import {Body, Controller, Get, Headers, HttpCode, Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import {AuthService} from "./auth.service";


@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {
    }

    @HttpCode(200)
    @Post('/login')
    async login(@Body() body,
                @Headers('user-agent') browser,
                @Res({passthrough: true}) res) {
        if(body.login) {
        const login = await this.auth.login(body, browser)

        res.cookie('refreshToken', login.refreshToken, {
            httpOnly: true,
            secure: false,
            domain: '.localhost',
            path: '/auth/refresh'
        });
        delete login.refreshToken
        return login
        }else {
            throw new UnauthorizedException({status: false, message: 'no correct user'})
        }
    }


    @HttpCode(200)
    @Post('/refresh')
    async refreshToken(@Headers() headers,
                       @Headers('user-agent') browser,
                       @Req() request,
                       @Res({passthrough: true}) res) {
        const refreshOld = request.cookies.refreshToken
        console.log(refreshOld)

        if (refreshOld) {
            const updateToken = await this.auth.refreshToken(refreshOld, browser);

            res.cookie('refreshToken', updateToken.refreshToken, {
                httpOnly: true,
                secure: false,
                domain: '.localhost',
                path: '/auth/refresh'
            });
            return updateToken;
        } else {
            return {status: false}
        }
    }

}
