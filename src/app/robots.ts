import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/dashboard/*',
        '/admin',
        '/admin/*',
        '/api',
        '/api/*',
        '/auth',
        '/auth/*',
        '/invite',
        '/invite/*',
        '/forgot-password',
        '/reset-password',
      ],
    },
    sitemap: 'https://ajose.ng/sitemap.xml',
  }
}
