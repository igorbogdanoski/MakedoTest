/**
 * Firebase Functions entry point.
 *
 * Exports a single `api` HTTP function that serves all RAG endpoints
 * via an Express router. Firebase Hosting rewrites `/api/**` to this function.
 *
 * Routes:
 *   POST /api/rag/index  — embed + upsert documents
 *   POST /api/rag/query  — embed query + retrieve top-k matches
 */

import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import { indexRouteHandlers } from './api/rag/indexHandler.js';
import { queryRouteHandlers } from './api/rag/queryHandler.js';

// Initialise Firebase Admin SDK once at cold-start.
initializeApp();

const app = express();

// Allow browser clients (local dev + hosted frontend) to call the API.
app.use(cors({ origin: true }));

// Parse JSON request bodies.
app.use(express.json({ limit: '2mb' }));

// Security: reject requests without a Content-Type header on POST routes.
app.use((req, res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    res.status(415).json({ ok: false, error: 'Content-Type must be application/json' });
    return;
  }
  next();
});

const ragRouter = express.Router();
ragRouter.post('/index', ...indexRouteHandlers);
ragRouter.post('/query', ...queryRouteHandlers);

app.use('/api/rag', ragRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

export const api = onRequest(
  {
    region: 'europe-west1',
    timeoutSeconds: 60,
    memory: '512MiB',
    invoker: 'public',
    secrets: ['GOOGLE_AI_API_KEY', 'GOOGLE_AI_EMBEDDING_MODEL'],
  },
  app
);
