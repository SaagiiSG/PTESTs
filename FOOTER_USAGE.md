# Footer Component Documentation

## Overview

The footer component provides a comprehensive, responsive footer for the PPNIM website with multiple variants to suit different contexts.

## Features

- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Multiple Variants**: Default, Admin, and Minimal variants
- **Auto-detection**: Automatically detects admin pages and applies appropriate styling
- **Consistent Styling**: Follows the existing design system with blue-yellow theme
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Internationalization**: Supports multiple languages through the language system

## Variants

### Default Footer
The standard footer with full content including:
- Logo and company description
- Quick links navigation
- Contact information
- Social media links
- Newsletter signup
- Mobile navigation
- Copyright and legal links

### Admin Footer
A simplified footer for admin pages featuring:
- Admin panel branding
- Back to home link
- Copyright information
- Clean, professional appearance

### Minimal Footer
A compact footer for pages that need less content:
- Copyright notice
- Essential legal links (Privacy, Terms)
- Minimal styling

## Usage

### Automatic Usage (Recommended)
The footer is automatically included in the main layout and will:
- Auto-detect admin pages and use the admin variant
- Use the default variant for regular pages
- Apply appropriate styling based on the current page

```tsx
// No additional code needed - footer is included in layout.tsx
```

### Manual Usage
You can manually specify a variant if needed:

```tsx
import Footer from '@/components/footer';

// In your component
<Footer variant="admin" />
<Footer variant="minimal" />
<Footer variant="default" />
```

## Customization

### Adding New Links
To add new links to the footer, modify the arrays in the component:

```tsx
const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  // Add your new links here
  { href: "/new-page", label: "New Page" },
];
```

### Modifying Contact Information
Update the contact information array:

```tsx
const contactInfo = [
  { icon: Mail, label: "your-email@domain.com", href: "mailto:your-email@domain.com" },
  { icon: Phone, label: "Your Phone", href: "tel:your-phone" },
  { icon: MapPin, label: "Your Address", href: "#" },
];
```

### Social Media Links
Modify the social links array:

```tsx
const socialLinks = [
  { href: "https://your-social.com", icon: YourIcon, label: "Your Social" },
  // Add more social links
];
```

## Styling

The footer uses the existing design system:
- **Colors**: Uses CSS custom properties for consistent theming
- **Typography**: Follows the established font hierarchy
- **Spacing**: Uses consistent spacing tokens
- **Animations**: Smooth hover effects and transitions
- **Dark Mode**: Automatically adapts to light/dark themes

## Responsive Behavior

- **Mobile**: Stacked layout with mobile navigation
- **Tablet**: 2-column grid layout
- **Desktop**: 4-column grid layout with full content

## Accessibility

- Proper semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast support

## Dependencies

- `@/components/ui/button` - For buttons
- `@/components/ui/separator` - For visual separators
- `lucide-react` - For icons
- `@/lib/language` - For internationalization
- `next/link` - For navigation
- `next/image` - For optimized images

## File Structure

```
components/
├── footer.tsx          # Main footer component
└── ui/
    ├── button.tsx      # Button component
    └── separator.tsx   # Separator component
```

## Integration

The footer is integrated into the main layout (`app/layout.tsx`) and will appear on all pages unless specifically excluded or overridden by page-specific layouts. 