/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    "rules": {
        "react/no-unescaped-entities": "off",
        "@next/next/no-page-custom-font": "off"
    },
    reactStrictMode: false,
    webpack: (config) => {
        config.externals.push("pino-pretty", "lokijs", "encoding");
        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.ipfs.dweb.link',
            },
        ],
    },
    env: {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
        CHAIN: process.env.CHAIN,
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
        API_MORALIS: process.env.API_MORALIS,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig
