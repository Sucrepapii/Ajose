import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ajose.ng'

  // The main marketing pages that we want Google to index
  return [
    {
      url: baseUrl, // Homepage
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1, // Highest priority
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // You can add more public marketing pages here (e.g. /about, /faq)
  ]
}
