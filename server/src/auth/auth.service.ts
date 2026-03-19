import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async singIn(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password === password) {
      // In a real application, you would generate a JWT token here
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // Exclude password from the response
      return result;
    }
    throw new UnauthorizedException('Invalid email or password');
  }
}
