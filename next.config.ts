import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  //  output: 'export',
  /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true, // Removed to enforce type checking
  // },
  // eslint: {
  //   ignoreDuringBuilds: true, // Removed to enforce linting
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
