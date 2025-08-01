
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async ({ command, mode }) => {
  const plugins = [react()];
  
  try {
    if (command === 'serve') {
      const { componentTagger } = await import('@lovable/vite-plugin-component-tagger');
      plugins.push(componentTagger() as any);
    }
  } catch (error) {
    console.warn('Component tagger plugin not available:', error);
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
