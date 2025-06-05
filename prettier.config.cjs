module.exports = {
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  tailwindStylesheet: "./src/index.css",
  printWidth: 80,
  endOfLine: "lf",
  trailingComma: "es5",
  tailwindFunctions: ["cn", "cva", "clsx"],
  importOrder: [
    // server-only marker
    "^server-only$",
    // CSS imports
    "^(.*).css$",
    // Next and React
    "^((@?next(.*))|(react))$",
    // Third-party modules
    "<THIRD_PARTY_MODULES>",
    // @ paths
    "^@(ui)?/(.*)$",
    // Relative imports
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};
