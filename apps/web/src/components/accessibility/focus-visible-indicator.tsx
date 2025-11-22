/**
 * Enhanced Focus Visible Styles
 *
 * This component adds a global style tag to enhance focus indicators
 * for keyboard navigation accessibility.
 */
export function FocusVisibleIndicator() {
  return (
    <style jsx global>{`
      /* Enhanced focus-visible styles for better keyboard navigation */
      *:focus-visible {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
      }

      /* Remove default outline for mouse users */
      *:focus:not(:focus-visible) {
        outline: none;
      }

      /* Ensure interactive elements have visible focus */
      a:focus-visible,
      button:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
        box-shadow: 0 0 0 4px hsl(var(--primary) / 0.1);
      }

      /* Skip link enhancement */
      .skip-link:focus {
        clip: auto;
        height: auto;
        width: auto;
        position: absolute;
        overflow: visible;
      }
    `}</style>
  );
}
