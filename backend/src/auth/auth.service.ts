import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // usada para gerar tokens JWT
import * as bcrypt from 'bcrypt'; // biblioteca para comparar senhas criptografadas
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // busca o usuário no banco
    private jwt: JwtService, // gera o token JWT
  ) {}

  // função para buscar o usuário no banco, com o mesmo email e validar
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true }, // carrega as roles junto
    });

    // se ele não existir, ou a senha estiver errada, manda uma exceção de erro
    // compara a senha digitada pelo usuário com a senha que está criptografada no banco
    // na hora do cadastro de um usuário, a senha é criptografada e apenas o hash é salvo no banco. na hora do login, é impraticável descriptografar a senha, então o bcrypt.compare gera um hash temporário, com base nas mesmas condições do login, e ai ele compara esses hashes para ver se são iguais
    // isso é seguro, porque a senha do usuário nunca é salva nem lida de forma original, é sempre criptografada
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // se der certo, retorna o usuário
    return user;
  }

  // função para fazer o login, recebe os dados do login (LoginDto)
  async login(dto: LoginDto) {
    // chama a validateUser para validar o usuário
    const user = await this.validateUser(dto.email, dto.password);

    // cria o conteúdo que vai dentro do token (user.id é o identificador único, user.email e user.roles também são necessários para que a comunicação back/front seja mais concreta e que o gerenciamento de quem está logado e quais as permissões funcione)
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.role), // transforma em ['COLLABORATOR', 'MANAGER']
    };

    // aqui o token é gerado e o payload é codificado
    const token = await this.jwt.signAsync(payload);

    // retorna o JWT que o front vai guardar e enviar em requisições
    // esse token é a assinatura do usuário, é a prova que ele está autenticado
    return { access_token: token, user };
  }
}
