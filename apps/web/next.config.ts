import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@realestate-crm/database', '@realestate-crm/domain'],
}

export default nextConfig
