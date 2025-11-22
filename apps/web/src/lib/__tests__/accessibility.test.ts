import {
  getAriaLabel,
  announceToScreenReader,
  getStatusText,
  formatCurrencyForScreenReader,
  formatDateForScreenReader,
  prefersReducedMotion,
  prefersHighContrast,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('getAriaLabel', () => {
    it('should generate aria-label without context', () => {
      expect(getAriaLabel('View', 'property')).toBe('View property');
    });

    it('should generate aria-label with context', () => {
      expect(getAriaLabel('View', 'property', 'Warsaw')).toBe('View property - Warsaw');
    });
  });

  describe('announceToScreenReader', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should create announcement element with polite priority', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveAttribute('aria-atomic', 'true');
      expect(announcement).toHaveTextContent('Test message');
    });

    it('should create announcement with assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toHaveAttribute('aria-live', 'assertive');
    });

    it('should remove announcement after 1 second', () => {
      announceToScreenReader('Test message');

      expect(document.querySelector('[role="status"]')).toBeInTheDocument();

      jest.advanceTimersByTime(1000);

      expect(document.querySelector('[role="status"]')).not.toBeInTheDocument();
    });
  });

  describe('getStatusText', () => {
    it('should return readable status text', () => {
      expect(getStatusText('PENDING')).toBe('Pending review');
      expect(getStatusText('ACCEPTED')).toBe('Application accepted');
      expect(getStatusText('ACTIVE')).toBe('Contract active');
      expect(getStatusText('RESOLVED')).toBe('Issue resolved');
    });

    it('should return original status if not mapped', () => {
      expect(getStatusText('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS');
    });
  });

  describe('formatCurrencyForScreenReader', () => {
    it('should format PLN currency', () => {
      expect(formatCurrencyForScreenReader(2000, 'PLN')).toBe('2000 Polish Zloty');
    });

    it('should format other currencies', () => {
      expect(formatCurrencyForScreenReader(100, 'EUR')).toBe('100 EUR');
    });

    it('should default to PLN', () => {
      expect(formatCurrencyForScreenReader(2000)).toBe('2000 Polish Zloty');
    });
  });

  describe('formatDateForScreenReader', () => {
    it('should format date object', () => {
      const date = new Date('2025-11-22');
      const formatted = formatDateForScreenReader(date);

      expect(formatted).toContain('November');
      expect(formatted).toContain('2025');
    });

    it('should format date string', () => {
      const formatted = formatDateForScreenReader('2025-11-22');

      expect(formatted).toContain('November');
      expect(formatted).toContain('2025');
    });
  });

  describe('prefersReducedMotion', () => {
    it('should return false if window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(prefersReducedMotion()).toBe(false);

      global.window = originalWindow;
    });

    it('should detect reduced motion preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        })),
      });

      expect(prefersReducedMotion()).toBe(true);
    });
  });

  describe('prefersHighContrast', () => {
    it('should return false if window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(prefersHighContrast()).toBe(false);

      global.window = originalWindow;
    });

    it('should detect high contrast preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        })),
      });

      expect(prefersHighContrast()).toBe(true);
    });
  });
});
