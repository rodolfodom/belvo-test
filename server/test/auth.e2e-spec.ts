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
    // Crear el usuario que se usará en los tests de login
    await request(app.getHttpServer()).post('/api/users').send(validUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users (registro)', () => {
    it('crea un usuario y retorna 201 sin password', async () => {
      const res = await request(app.getHttpServer()).post('/api/users').send({
        name: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        password: 'Password1!',
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Nuevo Usuario', email: 'nuevo@test.com' });
      expect(res.body.password).toBeUndefined();
    });

    it('retorna 400 cuando faltan campos requeridos', async () => {
      const res = await request(app.getHttpServer()).post('/api/users').send({ name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('retorna 400 cuando el email no es válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Test', email: 'no-es-email', password: 'Password1!' });

      expect(res.status).toBe(400);
    });

    it('retorna 400 cuando la password no es fuerte', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Test', email: 'test@test.com', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('retorna 200 con accessToken, name y email cuando las credenciales son válidas', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: validUser.name, email: validUser.email });
      expect(res.body.accessToken).toBeDefined();
    });

    it('no incluye password en la respuesta', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.body.password).toBeUndefined();
    });

    it('retorna 401 cuando la password es incorrecta', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'WrongPassword1!' });

      expect(res.status).toBe(401);
    });

    it('retorna 401 cuando el usuario no existe', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: 'Password1!' });

      expect(res.status).toBe(401);
    });

    it('retorna 400 cuando faltan campos requeridos', async () => {
      const res = await request(app.getHttpServer()).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
    });
  });
});
