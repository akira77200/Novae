// babel.config.js — Jest transform only (Next.js uses SWC in dev/build)
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
}
