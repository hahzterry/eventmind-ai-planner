import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // ──────────────────────────────────────────
  // API: POST /api/save-event  →  Notion
  // ──────────────────────────────────────────
  app.post('/api/save-event', async (req, res) => {
    const { eventName, eventType, date, location, guestCount, budgetRange } = req.body;

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const NOTION_DB_ID  = process.env.NOTION_DB_ID;

    if (!NOTION_TOKEN || !NOTION_DB_ID) {
      return res.status(500).json({
        error: 'Notion credentials not configured. Add NOTION_TOKEN and NOTION_DB_ID to your .env file.'
      });
    }

    const budgetMap = {
      'under-50k' : 'Under 50000',
      '50k-1l'    : '50000 to 100000',
      '1l-2l'     : '100000 to 200000',
      '2l-5l'     : '200000 to 500000',
      'above-5l'  : 'Above 500000',
    };

    try {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method  : 'POST',
        headers : {
          'Authorization'  : `Bearer ${NOTION_TOKEN}`,
          'Content-Type'   : 'application/json',
          'Notion-Version' : '2022-06-28',
        },
        body: JSON.stringify({
          parent     : { database_id: NOTION_DB_ID },
          properties : {
            'Event Name'  : { title: [{ text: { content: eventName || 'Untitled Event' } }] },
            'Event Type'  : { select: { name: eventType || 'Other' } },
            ...(date ? { 'Date': { date: { start: date } } } : {}),
            'Location'    : { rich_text: [{ text: { content: location || '' } }] },
            'Guest Count' : { number: parseInt(guestCount) || 0 },
            'Budget Range': { select: { name: budgetMap[budgetRange] || 'Under 50000' } },
            'Status'      : { select: { name: 'Planning' } },
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Notion API error:', data);
        return res.status(500).json({ error: data.message || 'Notion API error' });
      }
      return res.json({ success: true, id: data.id });
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ──────────────────────────────────────────
  // Vite dev server middleware (handles all non-API routes)
  // ──────────────────────────────────────────
  const vite = await createViteServer({
    server    : { middlewareMode: true },
    appType   : 'spa',
    root      : resolve(__dirname),
  });

  app.use(vite.middlewares);

  const PORT = process.env.PORT || 5173;
  app.listen(PORT, () => {
    console.log(`\n  ◈ EventMind running at http://localhost:${PORT}\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
