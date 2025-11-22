/**
 * Accessibility Utilities
 *
 * Helper functions for improving accessibility throughout the application
 */

/**
 * Generates accessible aria-label for interactive elements
 */
export function getAriaLabel(
  action: string,
  subject: string,
  context?: string
): string {
  return context ? `${action} ${subject} - ${context}` : `${action} ${subject}`;
}

/**
 * Announces message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Get readable status text for screen readers
 */
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending review',
    ACCEPTED: 'Application accepted',
    REJECTED: 'Application rejected',
    SIGNED: 'Contract signed',
    ACTIVE: 'Contract active',
    COMPLETED: 'Contract completed',
    TERMINATED: 'Contract terminated',
    REPORTED: 'Issue reported',
    ACKNOWLEDGED: 'Issue acknowledged',
    IN_PROGRESS: 'Issue in progress',
    RESOLVED: 'Issue resolved',
    CLOSED: 'Issue closed',
  };

  return statusMap[status] || status;
}

/**
 * Format currency for screen readers
 */
export function formatCurrencyForScreenReader(amount: number, currency: string = 'PLN'): string {
  return `${amount} ${currency === 'PLN' ? 'Polish Zloty' : currency}`;
}

/**
 * Format date for screen readers
 */
export function formatDateForScreenReader(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if high contrast mode is enabled
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}
