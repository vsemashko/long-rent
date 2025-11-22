import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'HomeMore API',
      version: '0.1.0',
      description: 'Long-term rental platform API for Poland',
      documentation: '/api/docs',
      status: 'Development',
      phase: 'Phase 0 - Week 2: Development Environment',
    };
  }

  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
