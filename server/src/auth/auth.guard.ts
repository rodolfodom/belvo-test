import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private extractTokenFromCookie(request: Request): string | null {
    return (request.cookies['access_token'] as string) ?? null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token: string | null = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload: {
        email: string;
        sub: number;
      } = await this.jwtService.verifyAsync(token);

      request['user'] = payload; // Adjuntar usuario real
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
