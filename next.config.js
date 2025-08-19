/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint configuration
  eslint: {
    // Don't ignore ESLint errors during builds
    ignoreDuringBuilds: false,
    // Specify directories to lint
    dirs: ['src', 'pages', 'components', 'utils'],
  },
  
  // TypeScript configuration
  typescript: {
    // Don't ignore TypeScript errors during builds
    ignoreBuildErrors: false,
  },

  // Optional: If you want to be more permissive temporarily
  // Uncomment these lines if you want to allow the build to pass with warnings
  /*
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  */
};

module.exports = nextConfig;