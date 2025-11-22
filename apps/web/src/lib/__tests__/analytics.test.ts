import { analytics, AnalyticsEvents } from '../analytics';

describe('Analytics', () => {
  let mockGtag: jest.Mock;
  let mockMixpanel: any;

  beforeEach(() => {
    // Setup mocks
    mockGtag = jest.fn();
    mockMixpanel = {
      track: jest.fn(),
      identify: jest.fn(),
      people: {
        set: jest.fn(),
      },
      reset: jest.fn(),
    };

    // @ts-ignore
    global.window = {
      gtag: mockGtag,
      mixpanel: mockMixpanel,
    } as any;

    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('event', () => {
    it('should track events with Google Analytics', () => {
      analytics.event('test_event', { prop: 'value' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { prop: 'value' });
    });

    it('should track events with Mixpanel', () => {
      analytics.event('test_event', { prop: 'value' });

      expect(mockMixpanel.track).toHaveBeenCalledWith('test_event', { prop: 'value' });
    });

    it('should handle events without properties', () => {
      analytics.event('test_event');

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', undefined);
      expect(mockMixpanel.track).toHaveBeenCalledWith('test_event', undefined);
    });
  });

  describe('pageView', () => {
    it('should track page views with Google Analytics', () => {
      analytics.pageView('/test-page');

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        page_path: '/test-page',
      });
    });

    it('should track page views with Mixpanel', () => {
      analytics.pageView('/test-page');

      expect(mockMixpanel.track).toHaveBeenCalledWith('Page View', { path: '/test-page' });
    });
  });

  describe('identify', () => {
    it('should identify user with Google Analytics', () => {
      analytics.identify('user123');

      expect(mockGtag).toHaveBeenCalledWith('set', { user_id: 'user123' });
    });

    it('should identify user with Mixpanel', () => {
      analytics.identify('user123');

      expect(mockMixpanel.identify).toHaveBeenCalledWith('user123');
    });

    it('should set user traits in Mixpanel', () => {
      const traits = { email: 'test@test.com', role: 'TENANT' };
      analytics.identify('user123', traits);

      expect(mockMixpanel.people.set).toHaveBeenCalledWith(traits);
    });
  });

  describe('reset', () => {
    it('should reset Mixpanel identity', () => {
      analytics.reset();

      expect(mockMixpanel.reset).toHaveBeenCalled();
    });
  });

  describe('AnalyticsEvents', () => {
    it('should have predefined event constants', () => {
      expect(AnalyticsEvents.SIGN_UP).toBe('sign_up');
      expect(AnalyticsEvents.LOGIN).toBe('login');
      expect(AnalyticsEvents.PROPERTY_VIEW).toBe('property_view');
      expect(AnalyticsEvents.CONTRACT_SIGN).toBe('contract_sign');
      expect(AnalyticsEvents.PAYMENT_SUCCESS).toBe('payment_success');
    });
  });
});
