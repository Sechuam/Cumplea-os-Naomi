import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// In-memory cache as fallback
let cachedConfig = null;

// API endpoint to retrieve synced surprise configuration
app.get('/api/config', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      cachedConfig = JSON.parse(data);
      return res.json(cachedConfig);
    }
    if (cachedConfig) {
      return res.json(cachedConfig);
    }
    return res.json(null);
  } catch (err) {
    console.error('Error reading config file:', err);
    if (cachedConfig) {
      return res.json(cachedConfig);
    }
    return res.json(null);
  }
});

// API endpoint to save surprise configuration
app.post('/api/config', (req, res) => {
  try {
    cachedConfig = req.body;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving config file:', err);
    // Cached in memory so still persists during runtime
    return res.json({ success: true, warning: 'Saved in memory' });
  }
});

// Serve static assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA client routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).send('<!doctype html><html><body><h1>Cargando sorpresa de cumpleaños...</h1><script>setTimeout(() => window.location.reload(), 1500);</script></body></html>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
