import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function configApiPlugin(): Plugin {
  return {
    name: 'config-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/config') {
          const dataDir = path.resolve(process.cwd(), 'data');
          const configFile = path.join(dataDir, 'config.json');

          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            if (fs.existsSync(configFile)) {
              try {
                const data = fs.readFileSync(configFile, 'utf-8');
                res.end(data);
                return;
              } catch (e) {
                res.end(JSON.stringify(null));
                return;
              }
            } else {
              res.end(JSON.stringify(null));
              return;
            }
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                if (!fs.existsSync(dataDir)) {
                  fs.mkdirSync(dataDir, { recursive: true });
                }
                fs.writeFileSync(configFile, body, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e?.message || 'Error saving' }));
              }
            });
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), configApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
