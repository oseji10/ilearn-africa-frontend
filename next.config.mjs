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


  };

  
  export default nextConfig;
  