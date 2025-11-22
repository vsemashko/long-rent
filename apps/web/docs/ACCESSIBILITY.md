# Accessibility Guide

HomeMore is committed to providing an accessible experience for all users, including those with disabilities. This document outlines our accessibility features and compliance standards.

## WCAG 2.1 Level AA Compliance

We strive to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.

## Key Accessibility Features

### 1. Keyboard Navigation

- **Tab Navigation**: All interactive elements are keyboard accessible
- **Skip to Content**: Press Tab on any page to reveal a "Skip to main content" link
- **Focus Indicators**: Clear visual indicators show which element has keyboard focus
- **No Keyboard Traps**: Users can navigate away from all components using standard keyboard commands

### 2. Screen Reader Support

- **Semantic HTML**: Proper use of HTML5 semantic elements (header, nav, main, footer, article, section)
- **ARIA Labels**: Descriptive labels for interactive elements and dynamic content
- **Live Regions**: Status updates and notifications are announced to screen readers
- **Alternative Text**: All meaningful images include descriptive alt text

### 3. Visual Accessibility

- **Color Contrast**: All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Text Sizing**: Text can be resized up to 200% without loss of functionality
- **Focus Indicators**: High-contrast focus outlines on all interactive elements
- **No Color-Only Information**: Information is never conveyed by color alone

### 4. Motor Accessibility

- **Large Click Targets**: All interactive elements meet minimum size requirements (44x44px)
- **Generous Spacing**: Adequate spacing between interactive elements
- **No Hover-Only Content**: All content accessible without hover
- **Timeout Controls**: Users can extend or disable time limits where applicable

### 5. Cognitive Accessibility

- **Clear Language**: Simple, straightforward language throughout
- **Consistent Navigation**: Navigation structure is consistent across all pages
- **Error Prevention**: Form validation with clear error messages
- **Help Text**: Contextual help available where needed

## Testing

### Automated Testing

We use Playwright with axe-core for automated accessibility testing. Run tests with:

```bash
npm run test:e2e
```

### Manual Testing

We regularly test with:
- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)
- **Keyboard Only**: Complete navigation without mouse
- **Browser Zoom**: Testing at 200% zoom level
- **Color Blindness Simulators**: Various color vision deficiency simulations

### Browser Support

HomeMore is tested and supported on:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Assistive Technology Compatibility

### Recommended Screen Readers

- **Windows**: NVDA (free), JAWS
- **macOS**: VoiceOver (built-in)
- **iOS**: VoiceOver (built-in)
- **Android**: TalkBack (built-in)

### Voice Control

HomeMore works with voice control software including:
- Dragon NaturallySpeaking
- Windows Speech Recognition
- macOS Voice Control

## Known Issues

We maintain a list of known accessibility issues and are actively working to resolve them. If you encounter an accessibility barrier, please report it to support@homemore.pl.

## Accessibility Statement

HomeMore is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

### Measures

- Accessibility is part of our development process
- Regular accessibility audits
- Training for development team on accessibility best practices
- User testing with people with disabilities

### Feedback

We welcome your feedback on the accessibility of HomeMore. Please contact us:

- **Email**: support@homemore.pl
- **Subject Line**: "Accessibility Feedback"

We aim to respond to accessibility feedback within 3 business days.

## Accessibility Features by Component

### Navigation

- Landmark regions for easy navigation
- Skip links to bypass repetitive content
- Clear heading hierarchy
- Breadcrumb navigation where applicable

### Forms

- All form inputs have associated labels
- Required fields are clearly marked
- Error messages are descriptive and linked to fields
- Success confirmations are announced

### Modals and Dialogs

- Focus trapped within modal when open
- ESC key closes modals
- Focus returns to trigger element on close
- ARIA attributes for screen reader context

### Dynamic Content

- ARIA live regions for status updates
- Loading states announced to screen readers
- Skeleton screens with proper labeling
- Progressive enhancement approach

### Media

- Text alternatives for images
- Transcripts for video content (when applicable)
- Captions for video content (when applicable)
- Audio descriptions available where needed

## Keyboard Shortcuts

### Global

- `Tab` - Move focus forward
- `Shift + Tab` - Move focus backward
- `Enter` or `Space` - Activate focused element
- `Esc` - Close modals/dialogs

### Navigation

- `Alt + 1` - Skip to main content (when visible)
- Arrow keys - Navigate dropdown menus and accordions

## Third-Party Integrations

We ensure that all third-party integrations (maps, payment forms, etc.) meet accessibility standards or provide accessible alternatives.

## Updates

This accessibility statement was last updated on 2025-11-22. We review and update our accessibility practices regularly.

## Standards

We aim to conform to the following standards:

- WCAG 2.1 Level AA
- Section 508 (US)
- EN 301 549 (EU)
- AODA (Canada)

## Contact

For accessibility-related questions or to report issues:

**Email**: support@homemore.pl
**Subject**: Accessibility Inquiry

We take all accessibility concerns seriously and will work to resolve issues promptly.
