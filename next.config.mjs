/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      // ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true, // Ignore TypeScript type errors during build
      },
      images: { unoptimized: true } 
      // Ensure to add exportPathMap if you have dynamic routes
  // For static export
//   async exportPathMap() {
//     return {
//       '/': { page: '/' },
//       '/about': { page: '/about' },
//       // Add other pages here
//     };
//   },
  };
  
  export default nextConfig;
  