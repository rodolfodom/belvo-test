import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const validUser = {
    name: 'Rodolfo',
    email: 'rodolfo@transactions.com',
    password: 'Password1!',
  };

  const validTransaction = {
    account: 'BBVA',
    amount: -255,
    type: 'outflow',
    category: 'groceries',
    date: '2026-03-01',
  };

  beforeAll(async () => {
    app = await createTestApp();

    await request(app.getHttpServer()).post('/api/users').send(validUser);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/transactions', () => {
    it('crea una transacción y retorna 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTransaction);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        account: 'BBVA',
        amount: -255,
        type: 'outflow',
        category: 'groceries',
      });
    });

    it('no incluye el usuario en la respuesta', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTransaction);

      expect(res.body.user).toBeUndefined();
    });

    it('retorna 401 sin token de autenticación', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .send(validTransaction);

      expect(res.status).toBe(401);
    });

    it('retorna 400 cuando amount es positivo en un outflow', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...validTransaction, amount: 100 });

      expect(res.status).toBe(400);
    });

    it('retorna 400 cuando el tipo no es válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...validTransaction, type: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/transactions/bulk', () => {
    const bulkTransactions = [
      { account: 'BBVA', amount: -100, type: 'outflow', category: 'transport', date: '2026-03-01' },
      { account: 'BBVA', amount: 2000, type: 'inflow', category: 'salary', date: '2026-03-02' },
    ];

    it('crea múltiples transacciones y retorna 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkTransactions);

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('retorna las transacciones con los datos correctos', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkTransactions);

      expect(res.body[0]).toMatchObject({ account: 'BBVA', amount: -100, type: 'outflow', category: 'transport' });
      expect(res.body[1]).toMatchObject({ account: 'BBVA', amount: 2000, type: 'inflow', category: 'salary' });
    });

    it('no incluye el usuario en ninguna transacción', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkTransactions);

      res.body.forEach((tx: any) => {
        expect(tx.user).toBeUndefined();
      });
    });

    it('retorna 401 sin token de autenticación', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/bulk')
        .send(bulkTransactions);

      expect(res.status).toBe(401);
    });

    it('retorna 400 cuando un item tiene amount positivo en outflow', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send([...bulkTransactions, { account: 'BBVA', amount: 100, type: 'outflow', category: 'food', date: '2026-03-01' }]);

      expect(res.status).toBe(400);
    });

    it('retorna 400 cuando un item tiene un tipo inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send([{ ...bulkTransactions[0], type: 'invalid' }]);

      expect(res.status).toBe(400);
    });

    it('retorna 400 cuando el body no es un array', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTransaction);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/transactions', () => {
    it('retorna 200 con las transacciones del usuario', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('no incluye el usuario en cada transacción', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`);

      res.body.forEach((tx: any) => {
        expect(tx.user).toBeUndefined();
      });
    });

    it('retorna 401 sin token de autenticación', async () => {
      const res = await request(app.getHttpServer()).get('/api/transactions');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions/summary/by-category', () => {
    it('retorna 200 con el resumen agrupado por tipo y categoría', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions/summary/by-category')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(typeof res.body).toBe('object');
    });

    it('retorna 401 sin token de autenticación', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/transactions/summary/by-category',
      );

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions/summary/by-account', () => {
    it('retorna 200 con el resumen por cuenta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions/summary/by-account')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('retorna 200 con filtros de fecha', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions/summary/by-account')
        .query({ startDate: '2026-01-01', endDate: '2026-12-31' })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
    });

    it('retorna 401 sin token de autenticación', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/transactions/summary/by-account',
      );

      expect(res.status).toBe(401);
    });
  });
});
