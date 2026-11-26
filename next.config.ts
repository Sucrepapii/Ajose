import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co https://checkout.flutterwave.com https://*.flutterwave.com https://api.ravepay.co https://connect.facebook.net https://api.withmono.com https://connect.withmono.com https://connect.mono.co https://api.paylodeservices.com https://*.paylodeservices.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://ajose.ng https://*.flutterwave.com https://www.facebook.com https://*.paylodeservices.com;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.flutterwave.com https://*.flutterwave.com https://api.ravepay.co https://connect.facebook.net https://www.facebook.com https://api.withmono.com https://api.mono.co https://connect.mono.co https://connect.withmono.com https://api.paylodeservices.com https://*.paylodeservices.com;
    frame-src 'self' https://checkout.flutterwave.com https://*.flutterwave.com https://connect.withmono.com https://connect.mono.co https://api.paylodeservices.com https://*.paylodeservices.com https://www.facebook.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://checkout.flutterwave.com https://*.flutterwave.com https://api.paylodeservices.com https://*.paylodeservices.com https://www.facebook.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  experimental: {
    agentUpgrade: "security",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self "https://connect.withmono.com" "https://connect.mono.co"), microphone=(), geolocation=()',
          }
        ],
      },
    ];
  },
};

export default nextConfig;
