import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://readixon.com';

  const disallowList = [
    '/admin',
    '/admin/*',
    '/editor',
    '/editor/*',
    '/studio',
    '/studio/*',
    '/library',
    '/library/*',
    '/messages',
    '/messages/*',
    '/settings',
    '/settings/*',
    '/notifications',
    '/notifications/*',
    '/payment',
    '/payment/*',
    '/api/*',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowList,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
