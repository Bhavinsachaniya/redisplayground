# Deployment Guide - Redis in Action

## Cloudflare Pages Deployment

This project is optimized for deployment on Cloudflare Pages.

### Automatic Deployment

1. **Connect to Cloudflare Pages:**
   - Log in to your Cloudflare dashboard
   - Navigate to Pages
   - Click "Create a project"
   - Connect your Git repository

2. **Build Configuration:**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   Node version: 20
   ```

3. **Environment Variables:**
   - No environment variables required for basic deployment
   - Add `NODE_VERSION=20` if needed

### Manual Deployment

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview locally
npm run preview

# Deploy using Wrangler CLI (optional)
npx wrangler pages deploy dist
```

### Production Features Included

✅ **SEO Optimization:**
- Meta tags for search engines
- Open Graph tags for social media
- Twitter Card tags
- Structured sitemap.xml
- robots.txt configuration

✅ **Performance:**
- Vite build optimization
- Code splitting
- Asset optimization
- Caching headers

✅ **Security:**
- Security headers (_headers file)
- CSP configuration
- XSS protection
- Frame protection

✅ **PWA Ready:**
- manifest.json for installability
- Favicon in multiple sizes
- Theme color configuration

✅ **SPA Routing:**
- _redirects file for client-side routing
- All routes handled correctly

### Custom Domain Setup

1. Go to Cloudflare Pages project settings
2. Navigate to "Custom domains"
3. Add your domain
4. Update DNS records as instructed
5. Update the canonical URL in `index.html` and `sitemap.xml`

### Monitoring & Analytics

Consider adding:
- Cloudflare Web Analytics (free)
- Google Analytics
- Error tracking (Sentry, LogRocket)

### Build Verification

Before deploying, verify the build locally:

```bash
npm run build && npm run preview
```

Visit http://localhost:4173 to test the production build.

### Troubleshooting

**Build fails:**
- Ensure Node.js version 20 is used
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Routes not working:**
- Verify _redirects file exists in public/
- Check Cloudflare Pages build output includes _redirects

**Assets not loading:**
- Ensure public folder is properly copied during build
- Check asset paths use relative URLs

### Post-Deployment Checklist

- [ ] Test all routes
- [ ] Verify favicons appear correctly
- [ ] Check meta tags in page source
- [ ] Test responsive design
- [ ] Validate sitemap.xml accessibility
- [ ] Test PWA installation
- [ ] Check browser console for errors
- [ ] Verify security headers
