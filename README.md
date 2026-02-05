# Aritzia Clone - Shopify Theme

A premium Shopify 2.0 theme inspired by [Aritzia](https://www.aritzia.com/), featuring a minimalist, editorial design perfect for fashion and luxury retail.

## Features

### Design
- **Minimalist Aesthetic**: Clean, editorial design with focus on product photography
- **Typography**: Elegant serif headings (Didot) with modern sans-serif body text
- **Color Scheme**: Monochromatic palette (black, white, gray) for timeless elegance
- **Responsive**: Mobile-first approach with optimized layouts for all devices

### Components
- **Sticky Header**: With mega-menu navigation and search overlay
- **Announcement Bar**: Rotating messages with dismissible functionality
- **Hero Banner**: Full-width image/video with text overlay and slideshow support
- **Product Grid**: 4-column layout with hover effects and quick add
- **Product Cards**: Image swap on hover, color swatches, wishlist button
- **Cart Drawer**: Slide-out cart with real-time updates
- **Filters**: Sidebar filtering with mobile drawer support

### Pages
- **Homepage**: Customizable sections for hero, featured collections, editorial content
- **Collection Page**: Filterable product grid with sorting and pagination
- **Product Page**: Gallery with thumbnails, variant picker, accordion details
- **Standard Pages**: Clean layout for About, Contact, etc.

## Installation

### Option 1: GitHub Integration (Recommended)
1. Push this theme to a GitHub repository
2. In Shopify Admin, go to **Online Store > Themes**
3. Click **Add theme > Connect from GitHub**
4. Select your repository and branch
5. Click **Connect**

### Option 2: ZIP Upload
1. Compress the theme folder to a ZIP file
2. In Shopify Admin, go to **Online Store > Themes**
3. Click **Add theme > Upload ZIP file**
4. Select your ZIP file

### Option 3: Shopify CLI
```bash
# Install Shopify CLI if not already installed
npm install -g @shopify/cli @shopify/theme

# Navigate to theme directory
cd aritzia-shopify-theme

# Connect to your store
shopify theme dev --store your-store.myshopify.com

# Push to store
shopify theme push
```

## Customization

### Theme Settings
Access theme settings in **Online Store > Themes > Customize > Theme settings**:

- **Colors**: Primary, secondary, background, text, and accent colors
- **Typography**: Heading and body fonts with size controls
- **Layout**: Page width and section spacing
- **Cart**: Drawer or page cart with free shipping threshold
- **Social Media**: Links to all major platforms

### Sections
Each page can be customized with drag-and-drop sections:

- **Announcement Bar**: Multiple rotating messages
- **Hero Banner**: Image/video with text overlay
- **Featured Collection**: Product grid with heading
- **Collection Grid**: Main collection page products
- **Product Information**: Gallery, variants, buy buttons
- **Related Products**: Product recommendations

## File Structure

```
aritzia-shopify-theme/
├── assets/
│   ├── base.css           # Design tokens and base styles
│   ├── component-card.css # Product card styles
│   ├── component-header.css # Header and navigation
│   ├── component-footer.css # Footer styles
│   └── theme.js           # All JavaScript functionality
├── config/
│   ├── settings_schema.json # Theme settings definition
│   └── settings_data.json   # Default settings values
├── layout/
│   └── theme.liquid       # Main layout template
├── locales/
│   └── en.default.json    # English translations
├── sections/
│   ├── announcement-bar.liquid
│   ├── collection-banner.liquid
│   ├── collection-grid.liquid
│   ├── featured-collection.liquid
│   ├── footer.liquid
│   ├── header.liquid
│   ├── hero-banner.liquid
│   ├── main-page.liquid
│   ├── main-product.liquid
│   └── related-products.liquid
├── snippets/
│   ├── cart-drawer.liquid
│   ├── icon-*.liquid      # SVG icons
│   ├── meta-tags.liquid
│   ├── price.liquid
│   └── product-card.liquid
├── templates/
│   ├── collection.json
│   ├── index.json
│   ├── page.json
│   └── product.json
├── design-tokens.json     # Design system reference
└── README.md
```

## Design Tokens

The theme uses CSS custom properties defined in `assets/base.css`:

### Colors
```css
--color-black: #000000;
--color-white: #FFFFFF;
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F5F5F5;
--color-text-primary: #000000;
--color-text-secondary: #666666;
--color-sale: #C41E3A;
```

### Typography
```css
--font-heading: 'Didot', 'Bodoni MT', serif;
--font-body: 'Helvetica Neue', Arial, sans-serif;
```

### Spacing
```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-4: 1rem;
--space-8: 2rem;
--space-16: 4rem;
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest)
- Android Chrome (latest)

## Performance

- Lazy loading for images
- CSS custom properties for theming
- Minimal JavaScript (no jQuery)
- Optimized asset loading

## Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatible
- Skip to content link

## License

This theme is provided for educational purposes. Aritzia branding and designs are property of Aritzia LP.

## Credits

- Design inspiration: [Aritzia](https://www.aritzia.com/)
- Icons: Feather Icons (MIT License)
- Fonts: System fonts with web-safe fallbacks

---

Built with ❤️ for Shopify
