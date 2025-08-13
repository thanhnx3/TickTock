/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
          pathname: '**',
        },
      ],
      unoptimized: true, // ⚠️ Thêm dòng này để disable Image Optimization
    },
  };
  
  export default nextConfig;
  