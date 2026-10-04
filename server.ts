import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './backend/routes/index';
import { CONFIG } from './backend/config/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json());

  // Mount API endpoints
  app.use('/api/v1', apiRouter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Smart Warehouse XAI Inventory & Demand Forecasting',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SmartWarehouse] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[SmartWarehouse] API Root: http://0.0.0.0:${PORT}/api/v1`);
    console.log(`[SmartWarehouse] Configured DATASET_DIR: ${CONFIG.DATASET_DIR}`);
  });
}

startServer().catch(err => {
  console.error('[SmartWarehouse] Fatal error during startup:', err);
  process.exit(1);
});
