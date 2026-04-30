import { type Server } from 'http';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';
import { LoginResponse, UserResponse } from './api-response.types';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;

  const validUser = {
    name: 'Rodolfo',
    email: 'rodolfo@test.com',
    password: 'Password1!',
  };

  beforeAll(async () => {
    app = await createTestApp();
    httpServer = app.getHttpServer() as Server;
    await request(httpServer).post('/api/users').send(validUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users (registration)', () => {
    it('creates a user and returns 201 without password', async () => {
      const res = await request(httpServer).post('/api/users').send({
        name: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        password: 'Password1!',
      });

      expect(res.status).toBe(201);
      const body = res.body as UserResponse & { password?: string };
      expect(body).toMatchObject({
        name: 'Nuevo Usuario',
        email: 'nuevo@test.com',
      });
      expect(body.password).toBeUndefined();
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(httpServer)
        .post('/api/users')
        .send({ name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when the email is not valid', async () => {
      const res = await request(httpServer)
        .post('/api/users')
        .send({ name: 'Test', email: 'no-es-email', password: 'Password1!' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when the password is not strong', async () => {
      const res = await request(httpServer)
        .post('/api/users')
        .send({ name: 'Test', email: 'test@test.com', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 with accessToken, name and email when credentials are valid', async () => {
      const res = await request(httpServer)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      const body = res.body as LoginResponse;
      expect(res.status).toBe(200);
      expect(body).toMatchObject({
        name: validUser.name,
        email: validUser.email,
      });
      expect(body.accessToken).toBeDefined();
    });

    it('does not include password in the response', async () => {
      const res = await request(httpServer)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      const body = res.body as LoginResponse & { password?: string };
      expect(body.password).toBeUndefined();
    });

    it('returns 401 when the password is incorrect', async () => {
      const res = await request(httpServer)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'WrongPassword1!' });

      expect(res.status).toBe(401);
    });

    it('returns 401 when the user does not exist', async () => {
      const res = await request(httpServer)
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: 'Password1!' });

      expect(res.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(httpServer).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
    });
  });
});
