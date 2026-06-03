/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  compiler: { styledJsx: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}
