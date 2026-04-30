import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';
import {
  LoginResponse,
  TransactionResponse,
  AccountSummaryResponse,
} from './api-response.types';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let httpServer: Server;

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
    httpServer = app.getHttpServer() as Server;

    await request(httpServer).post('/api/users').send(validUser);

    const loginRes = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    const body = loginRes.body as LoginResponse;

    accessToken = body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/transactions', () => {
    it('creates a transaction and returns 201', async () => {
      const res = await request(httpServer)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTransaction);

      expect(res.status).toBe(201);
      expect(res.body as TransactionResponse).toMatchObject({
        account: 'BBVA',
        amount: -255,
        type: 'outflow',
        category: 'groceries',
      });
    });

    it('does not include the user in the response', async () => {
      const res = await request(httpServer)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTransaction);

      const body = res.body as TransactionResponse & { user?: unknown };
      expect(body.user).toBeUndefined();
    });

    it('returns 401 without authentication token', async () => {
      const res = await request(httpServer)
        .post('/api/transactions')
        .send(validTransaction);

      expect(res.status).toBe(401);
    });

    it('returns 400 when amount is positive in an outflow', async () => {
      const res = await request(httpServer)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...validTransaction, amount: 100 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when the type is not valid', async () => {
      const res = await request(httpServer)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...validTransaction, type: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/transactions/bulk', () => {
    const bulkTransactions = [
      {
        account: 'BBVA',
        amount: -100,
        type: 'outflow',
        category: 'transport',
        date: '2026-03-01',
      },
      {
        account: 'BBVA',
        amount: 2000,
        type: 'inflow',
        category: 'salary',
        date: '2026-03-02',
      },
    ];

    it('creates multiple transactions and returns 201', async () => {
      const res = await request(httpServer)
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkTransactions);

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body as TransactionResponse[]).toHaveLength(2);
    });

    it('returns the transactions with the correct data', async () => {
      const res = await request(httpServer)
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkTransactions);

      const body = res.body as TransactionResponse[];
      expect(body[0]).toMatchObject({
        account: 'BBVA',
        amount: -100,
        type: 'outflow',
        category: 'transport',
      });
      expect(body[1]).toMatchObject({
        account: 'BBVA',
        amount: 2000,
        type: 'inflow',
        category: 'salary',
      });
    });

    it('does not include the user in any transaction', async () => {
      const res = await request(httpServer)
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkTransactions);

      const body = res.body as Array<TransactionResponse & { user?: unknown }>;
      body.forEach((tx) => {
        expect(tx.user).toBeUndefined();
      });
    });

    it('returns 401 without authentication token', async () => {
      const res = await request(httpServer)
        .post('/api/transactions/bulk')
        .send(bulkTransactions);

      expect(res.status).toBe(401);
    });

    it('returns 400 when an item has positive amount in outflow', async () => {
      const res = await request(httpServer)
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send([
          ...bulkTransactions,
          {
            account: 'BBVA',
            amount: 100,
            type: 'outflow',
            category: 'food',
            date: '2026-03-01',
          },
        ]);

      expect(res.status).toBe(400);
    });

    it('returns 400 when an item has an invalid type', async () => {
      const res = await request(httpServer)
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send([{ ...bulkTransactions[0], type: 'invalid' }]);

      expect(res.status).toBe(400);
    });

    it('returns 400 when the body is not an array', async () => {
      const res = await request(httpServer)
        .post('/api/transactions/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTransaction);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/transactions', () => {
    it('returns 200 with the user transactions', async () => {
      const res = await request(httpServer)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body as TransactionResponse[])).toBe(true);
    });

    it('does not include the user in each transaction', async () => {
      const res = await request(httpServer)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`);

      const body = res.body as Array<TransactionResponse & { user?: unknown }>;
      body.forEach((tx) => {
        expect(tx.user).toBeUndefined();
      });
    });

    it('returns 401 without authentication token', async () => {
      const res = await request(httpServer).get('/api/transactions');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions/summary/by-category', () => {
    it('returns 200 with the summary grouped by type and category', async () => {
      const res = await request(httpServer)
        .get('/api/transactions/summary/by-category')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(typeof (res.body as Record<string, Record<string, string>>)).toBe(
        'object',
      );
    });

    it('returns 401 without authentication token', async () => {
      const res = await request(httpServer).get(
        '/api/transactions/summary/by-category',
      );

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions/summary/by-account', () => {
    it('returns 200 with the summary by account', async () => {
      const res = await request(httpServer)
        .get('/api/transactions/summary/by-account')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body as AccountSummaryResponse[])).toBe(true);
    });

    it('returns 200 with date filters', async () => {
      const res = await request(httpServer)
        .get('/api/transactions/summary/by-account')
        .query({ startDate: '2026-01-01', endDate: '2026-12-31' })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
    });

    it('returns 401 without authentication token', async () => {
      const res = await request(httpServer).get(
        '/api/transactions/summary/by-account',
      );

      expect(res.status).toBe(401);
    });
  });
});
