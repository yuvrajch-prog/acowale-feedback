import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { createAdminToken } from '../src/utils/auth';

const adminToken = createAdminToken('admin@acowale.com', 'Acowale Lead Admin');

describe('Acowale CRM Backend API Integration Tests', () => {
  it('GET /api/v1/health should return 200 OK with health metadata', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.service).toContain('Acowale CRM');
    expect(res.body.system).toBeDefined();
  });

  it('POST /api/v1/auth/login should authenticate admin with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@acowale.com',
      password: 'admin123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/v1/feedback should accept public feedback payload without auth', async () => {
    const res = await request(app).post('/api/v1/feedback').send({
      name: 'Public Test Candidate',
      email: 'candidate@acowale.com',
      category: 'FEATURE_REQUEST',
      rating: 5,
      comment: 'Testing public feedback submission API endpoint.',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Public Test Candidate');
  });

  it('GET /api/v1/feedback should reject request without admin auth token', async () => {
    const res = await request(app).get('/api/v1/feedback');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/feedback should return list when admin token provided', async () => {
    const res = await request(app)
      .get('/api/v1/feedback')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/analytics/summary should return analytics when admin token provided', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalFeedback).toBeGreaterThanOrEqual(0);
  });
});
