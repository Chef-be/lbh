import type { NextConfig } from "next";

const configurationNext: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

  // Réécriture des requêtes API vers le backend Django
  async rewrites() {
    return [
      {
        source: "/api/:chemin*",
        destination: `${process.env.URL_BACKEND || "http://bee-backend:8000"}/api/:chemin*`,
      },
    ];
  },

  // En-têtes de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.lbh-economiste.com",
      },
    ],
  },
};

export default configurationNext;
