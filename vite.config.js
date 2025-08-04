const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/main.js"),
      name: "ppal",
      fileName: (format) => `ppal.${format}.js`,
    },
    rollupOptions: {
      // External dependencies that shouldn't be bundled into the library
      external: ["moment", "lodash"],
      output: {
        globals: {
          moment: "moment",
          lodash: "_",
        },
      },
    },
  },
});
