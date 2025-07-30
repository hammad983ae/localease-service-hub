
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {
  const plugins = [react()];
  
  // Only try to load component tagger in development mode
  if (command === 'serve') {
    try {
      const { componentTagger } = await import('@lovable/vite-plugin-component-tagger').catch(() => ({ componentTagger: null }));
      if (componentTagger) {
        plugins.push(componentTagger());
      }
    } catch (error) {
      // Silently ignore if plugin is not available
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
