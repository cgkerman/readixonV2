import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/studio/', 
          '/messages/', 
          '/settings/',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/studio/', 
          '/messages/', 
          '/settings/',
          '/api/',
        ],
      }
    ],
    sitemap: 'https://readixon.com/sitemap.xml',
  }
}
