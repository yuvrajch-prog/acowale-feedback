import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { createAdminToken } from '../src/utils/auth';

const adminToken = createAdminToken('admin@acowale.com', 'Acowale Lead Admin');
let createdFeedbackId: string;

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
    createdFeedbackId = res.body.data.id;
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

  it('DELETE /api/v1/feedback/:id should reject request without admin auth token', async () => {
    const res = await request(app).delete(`/api/v1/feedback/${createdFeedbackId}`);
    expect(res.status).toBe(401);
  });

  it('DELETE /api/v1/feedback/:id should soft-delete the feedback when admin token provided', async () => {
    const res = await request(app)
      .delete(`/api/v1/feedback/${createdFeedbackId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deletedAt).toBeDefined();
  });

  it('GET /api/v1/feedback should not list the soft-deleted feedback item', async () => {
    const res = await request(app)
      .get('/api/v1/feedback')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const list = res.body.data;
    const found = list.find((item: any) => item.id === createdFeedbackId);
    expect(found).toBeUndefined();
  });

  it('DELETE /api/v1/feedback/:id should return 404 for non-existent feedback ID', async () => {
    const res = await request(app)
      .delete('/api/v1/feedback/non-existent-uuid-1234')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('GET /api/v1/analytics/summary with date range query params should return filtered analytics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/summary')
      .query({
        startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        endDate: new Date().toISOString(),
      })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalFeedback).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.data.submissionTrend)).toBe(true);
  });

  it('GET /api/v1/feedback with date range query params should return filtered list', async () => {
    const res = await request(app)
      .get('/api/v1/feedback')
      .query({
        startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        endDate: new Date().toISOString(),
      })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
