import { build } from "vite";

try {
  await build();
  // vite-prerender-plugin leaves an idle handle open after a successful build.
  // All build and write hooks have completed once build() resolves.
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
