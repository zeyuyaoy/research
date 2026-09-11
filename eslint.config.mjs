import {defineConfig, globalIgnores} from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
    ...nextVitals,
    ...nextTypeScript,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", {argsIgnorePattern: "^_", varsIgnorePattern: "^_"}],
            "@typescript-eslint/no-explicit-any": "error",
        },
    },
    {
        ...globalIgnores([".next/**", "coverage/**", "node_modules/**", "next-env.d.ts"]),
    },
]);
