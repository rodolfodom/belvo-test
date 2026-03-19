import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async singIn(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password === password) {
      const payload = { email: user.email, sub: user.id };
      return {
        accessToken: await this.jwtService.signAsync(payload),
      };
    }
    throw new UnauthorizedException('Invalid email or password');
  }
}
