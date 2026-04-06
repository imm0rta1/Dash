# Assets Directory

This folder is where you can store all your local static assets for the dashboard. 

Because the dashboard was initially using external APIs for avatars (DiceBear) and icons (Lucide React), there were no local image files in the repository. 

You can now place your files here:

- `/public/assets/images/` - For background images, banners, etc.
- `/public/assets/logos/` - For custom dashboard logos.
- `/public/assets/avatars/` - For user profile pictures and agent avatars.

## How to use local images in the app:

1. Place your image in the appropriate folder (e.g., `background.jpg` in `/public/assets/images/`).
2. Reference it in your CSS or React components using an absolute path starting with `/`:

**In CSS (`src/index.css`):**
```css
body {
  background-image: url('/assets/images/background.jpg');
}
```

**In React (`src/components/Sidebar.tsx`):**
```tsx
<img src="/assets/logos/my-logo.png" alt="Logo" />
```
