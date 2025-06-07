import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../routes'

describe('API Routes', () => {
  let app: express.Express
  let server: any

  beforeAll(async () => {
    app = express()
    server = await registerRoutes(app)
  })

  afterAll(() => {
    if (server) {
      server.close()
    }
  })

  describe('Courts API', () => {
    it('should fetch courts successfully', async () => {
      const response = await request(app)
        .get('/api/courts')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should fetch individual court by ID', async () => {
      const response = await request(app)
        .get('/api/courts/1')
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('hourlyRate')
    })

    it('should return 404 for non-existent court', async () => {
      await request(app)
        .get('/api/courts/999')
        .expect(404)
    })
  })

  describe('Auth Protected Routes', () => {
    it('should require authentication for bookings', async () => {
      await request(app)
        .get('/api/bookings')
        .expect(401)
    })

    it('should require authentication for user profile', async () => {
      await request(app)
        .get('/api/auth/user')
        .expect(401)
    })
  })
})