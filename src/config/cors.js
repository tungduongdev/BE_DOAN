/**
 * Updated by trungquandev.com's author on Oct 18 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { env } from './environment.js'

// Cấu hình CORS Option để cho phép tất cả domain truy cập API
export const corsOptions = {
  origin: true, // Cho phép tất cả domain
  credentials: true, // Cho phép gửi cookie qua CORS
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}