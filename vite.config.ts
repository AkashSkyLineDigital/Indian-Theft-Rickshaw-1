import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig, type Plugin} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entryHtmlPath = path.resolve(__dirname, 'src/entry.html');
const rootIndexPath = path.resolve(__dirname, 'index.html');

function standaloneRootIndexPlugin(): Plugin {
  return {
    name: 'standalone-root-index',
    enforce: 'post',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = (req.url || '/').split('?')[0];
        if (urlPath === '/' || urlPath === '/index.html') {
          try {
            const rawHtml = fs.readFileSync(entryHtmlPath, 'utf-8').replace('./main.tsx', '/src/main.tsx');
            const html = await server.transformIndexHtml(req.url || '/', rawHtml);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
            return;
          } catch (err) {
            next(err);
            return;
          }
        }
        next();
      });
    },
    writeBundle(options) {
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      const builtEntry = path.join(outDir, 'src', 'entry.html');
      const distIndex = path.join(outDir, 'index.html');
      if (!fs.existsSync(builtEntry)) return;

      let html = fs.readFileSync(builtEntry, 'utf-8');
      // Relocate the single-file inline script to the end of <body> as a classic IIFE script
      // so opening index.html directly via file:// works in Chrome without ES-module CORS blocks.
      const scriptStart = html.search(/<script\b[^>]*>/i);
      const scriptEnd = html.toLowerCase().lastIndexOf('</script>');
      if (scriptStart !== -1 && scriptEnd > scriptStart) {
        const openTagEnd = html.indexOf('>', scriptStart);
        const jsCode = html.slice(openTagEnd + 1, scriptEnd);
        html = html.slice(0, scriptStart) + html.slice(scriptEnd + '</script>'.length);
        const bodyClose = html.toLowerCase().lastIndexOf('</body>');
        const inlineScript = `<script>(function(){\n${jsCode}\n})();</script>`;
        if (bodyClose !== -1) {
          html = html.slice(0, bodyClose) + inlineScript + html.slice(bodyClose);
        } else {
          html += inlineScript;
        }
      }

      fs.writeFileSync(distIndex, html, 'utf-8');
      fs.writeFileSync(rootIndexPath, html, 'utf-8');
      fs.rmSync(path.join(outDir, 'src'), {recursive: true, force: true});
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), viteSingleFile(), standaloneRootIndexPlugin()],
    build: {
      assetsInlineLimit: 100000000,
      cssCodeSplit: false,
      rollupOptions: {
        input: entryHtmlPath,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
