// Side-effect imports of stylesheets from node_modules (e.g. katex/dist/katex.min.css).
// Next.js bundles these at build time; TypeScript only needs a module declaration so
// `import 'pkg/foo.css'` does not raise TS2882. CSS Modules keep their own `*.module.css`
// typing from Next's generated types.
declare module '*.css';
