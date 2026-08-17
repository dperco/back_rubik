/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['i.imgur.com'],
        remotePatterns: [
          {
            protocol: "https",
            hostname: "s3-alpha-sig.figma.com",
          },
        ], 
      },      
};

export default nextConfig;
