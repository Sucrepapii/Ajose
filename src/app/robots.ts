import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/api/'], // Blocks Google from indexing private dashboard/admin pages
    },
    sitemap: 'https://ajose.ng/sitemap.xml',
  }
}
