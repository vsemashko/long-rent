/**
 * Analytics utility functions
 *
 * This file provides type-safe wrappers for analytics tracking.
 * Configure your analytics IDs in .env:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID for Google Analytics
 * - NEXT_PUBLIC_MIXPANEL_TOKEN for Mixpanel
 */

export const analytics = {
  /**
   * Track a custom event
   */
  event: (name: string, properties?: Record<string, any>) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, properties);
    }

    // Mixpanel
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(name, properties);
    }
  },

  /**
   * Track page view
   */
  pageView: (path: string) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
        page_path: path,
      });
    }

    // Mixpanel
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Page View', { path });
    }
  },

  /**
   * Identify user
   */
  identify: (userId: string, traits?: Record<string, any>) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', { user_id: userId });
    }

    // Mixpanel
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(userId);
      if (traits) {
        window.mixpanel.people.set(traits);
      }
    }
  },

  /**
   * Reset user identity (on logout)
   */
  reset: () => {
    // Mixpanel
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.reset();
    }
  },
};

// Predefined event types for type safety
export const AnalyticsEvents = {
  // Authentication
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Property
  PROPERTY_VIEW: 'property_view',
  PROPERTY_FAVORITE: 'property_favorite',
  PROPERTY_SEARCH: 'property_search',
  PROPERTY_LIST: 'property_list',

  // Application
  APPLICATION_SUBMIT: 'application_submit',
  APPLICATION_ACCEPT: 'application_accept',
  APPLICATION_REJECT: 'application_reject',

  // Contract
  CONTRACT_CREATE: 'contract_create',
  CONTRACT_SIGN: 'contract_sign',
  CONTRACT_ACTIVATE: 'contract_activate',
  CONTRACT_TERMINATE: 'contract_terminate',

  // Payment
  PAYMENT_INITIATE: 'payment_initiate',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',

  // Maintenance
  MAINTENANCE_REPORT: 'maintenance_report',
  MAINTENANCE_UPDATE: 'maintenance_update',
  MAINTENANCE_RESOLVE: 'maintenance_resolve',

  // Review
  REVIEW_SUBMIT: 'review_submit',

  // Messaging
  MESSAGE_SEND: 'message_send',
  MESSAGE_READ: 'message_read',
} as const;

// TypeScript declarations
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    mixpanel: any;
  }
}
