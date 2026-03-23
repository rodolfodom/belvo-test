import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const validUser = {
    name: 'Rodolfo',
    email: 'rodolfo@test.com',
    password: 'Password1!',
  };

  beforeAll(async () => {
    app = await createTestApp();
    // Create the user to be used in login tests
    await request(app.getHttpServer()).post('/api/users').send(validUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users (registration)', () => {
    it('creates a user and returns 201 without password', async () => {
      const res = await request(app.getHttpServer()).post('/api/users').send({
        name: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        password: 'Password1!',
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Nuevo Usuario', email: 'nuevo@test.com' });
      expect(res.body.password).toBeUndefined();
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer()).post('/api/users').send({ name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when the email is not valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Test', email: 'no-es-email', password: 'Password1!' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when the password is not strong', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Test', email: 'test@test.com', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 with accessToken, name and email when credentials are valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: validUser.name, email: validUser.email });
      expect(res.body.accessToken).toBeDefined();
    });

    it('does not include password in the response', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.body.password).toBeUndefined();
    });

    it('returns 401 when the password is incorrect', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'WrongPassword1!' });

      expect(res.status).toBe(401);
    });

    it('returns 401 when the user does not exist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: 'Password1!' });

      expect(res.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer()).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
    });
  });
});
