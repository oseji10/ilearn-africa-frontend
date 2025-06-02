/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true, 
      },
      images: { unoptimized: true }, 

swcMinify: false,

async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
    }
  ];
}
  };

  
  export default nextConfig;
  