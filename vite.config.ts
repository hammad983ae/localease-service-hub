
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {
  const plugins = [react()];
  
  // Only try to load component tagger in development mode
  if (command === 'serve') {
    try {
      // Try to dynamically import the component tagger plugin
      const module = await import('@lovable/vite-plugin-component-tagger').catch(() => null);
      
      if (module && module.componentTagger) {
        plugins.push(module.componentTagger());
      }
    } catch (error) {
      // Silently ignore if plugin is not available
      console.log('Component tagger plugin not available');
    }
  }

  return {
    plugins,
    server: {
      port: 8080
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
