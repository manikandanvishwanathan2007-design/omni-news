import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for saved news and history
  let savedNews: any[] = [];
  let history: any[] = [];

  // API Routes
  app.get("/api/saved", (req, res) => {
    res.json(savedNews);
  });

  app.get("/api/history", (req, res) => {
    res.json(history);
  });

  app.post("/api/history", (req, res) => {
    const { news_id, title, summary, category } = req.body;
    // Add to start of array, keep unique
    history = history.filter(n => n.news_id !== news_id);
    history.unshift({ news_id, title, summary, category, viewed_at: new Date().toISOString() });
    // Keep last 10
    if (history.length > 10) history = history.slice(0, 10);
    res.json({ success: true, history });
  });

  app.post("/api/save", (req, res) => {
    const { news_id, title, summary } = req.body;
    if (!news_id) return res.status(400).json({ error: "news_id is required" });
    
    const exists = savedNews.find(n => n.news_id === news_id);
    if (!exists) {
      savedNews.push({ news_id, title, summary, saved_at: new Date().toISOString() });
    }
    res.json({ success: true, savedNews });
  });

  app.post("/api/unsave", (req, res) => {
    const { news_id } = req.body;
    savedNews = savedNews.filter(n => n.news_id !== news_id);
    res.json({ success: true, savedNews });
  });

  app.get("/api/share/:news_id", (req, res) => {
    const { news_id } = req.params;
    // In a real app, we'd fetch the news item from a DB
    // For now, we'll just return a generic share text if not found
    res.json({ 
      share_text: `📰 OmniNews AI: Check out this story! 🔥 #OmniNews #AI #Breaking` 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
