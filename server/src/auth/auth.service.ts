import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/utils/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async singIn(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; name: string; email: string }> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.hashService.compare(password, user.password))) {
      const payload = { email: user.email, sub: user.id };
      return {
        accessToken: await this.jwtService.signAsync(payload),
        name: user.name,
        email: user.email,
      };
    }
    throw new UnauthorizedException('Invalid email or password');
  }
}
