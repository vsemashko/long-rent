/**
 * Monitoring and observability configuration
 * Centralized configuration for Sentry, Datadog, New Relic, etc.
 */

export interface MonitoringConfig {
  sentry: {
    dsn?: string;
    environment: string;
    enabled: boolean;
    tracesSampleRate: number;
    profilesSampleRate: number;
  };
  datadog: {
    apiKey?: string;
    enabled: boolean;
    service: string;
    env: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    mixpanelToken?: string;
    enabled: boolean;
  };
}

export const monitoringConfig: MonitoringConfig = {
  sentry: {
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    enabled: process.env.NODE_ENV === 'production',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
  },
  datadog: {
    apiKey: process.env.DATADOG_API_KEY,
    enabled: !!process.env.DATADOG_API_KEY,
    service: 'homemore',
    env: process.env.NODE_ENV || 'development',
  },
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    mixpanelToken: process.env.MIXPANEL_TOKEN,
    enabled: process.env.NODE_ENV === 'production',
  },
};

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
  interval: number; // milliseconds
  timeout: number; // milliseconds
  endpoints: string[];
}

export const healthCheckConfig: HealthCheckConfig = {
  interval: 30000, // 30 seconds
  timeout: 5000, // 5 seconds
  endpoints: [
    '/api/health',
    '/api/health/database',
    '/api/health/redis',
  ],
};

/**
 * Performance monitoring thresholds
 */
export const performanceThresholds = {
  api: {
    slowRequestMs: 1000, // Log requests slower than 1s
    verySlowRequestMs: 3000, // Alert on requests slower than 3s
  },
  database: {
    slowQueryMs: 500, // Log queries slower than 500ms
    verySlowQueryMs: 2000, // Alert on queries slower than 2s
  },
  frontend: {
    firstContentfulPaint: 1500, // Target FCP < 1.5s
    largestContentfulPaint: 2500, // Target LCP < 2.5s
    cumulativeLayoutShift: 0.1, // Target CLS < 0.1
    firstInputDelay: 100, // Target FID < 100ms
  },
};

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Custom error tags for better categorization
 */
export const errorTags = {
  authentication: 'auth',
  database: 'db',
  payment: 'payment',
  validation: 'validation',
  external_api: 'external_api',
  rate_limit: 'rate_limit',
};
