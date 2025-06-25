import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // rota para o login
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // toda vez que uma rota estiver protegida por esse guard, a estratégia de autenticação vai ser aplicada, verificando se o token é válido e se for, validando o usuário
  @UseGuards(JwtAuthGuard) // o guard atua antes do controlador ser executado, decidindo se a requisição pode ou não continuar
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    // retorna o que foi retornado pelo validate
    return req.user;
  }
}
