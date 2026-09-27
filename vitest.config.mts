import {defineConfig} from "vitest/config";
import path from "node:path";

export default defineConfig({
    css: {postcss: {plugins: []}},
    resolve: {alias: {"@": path.resolve(import.meta.dirname, "src")}},
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        coverage: {reporter: ["text", "html"]},
    },
});
