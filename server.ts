import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { db, seed } from "./src/db/index.ts";
import * as schema from "./src/db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { HermesRunner } from "./src/services/hermesRunner.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB
try {
  console.log("Initializing database...");
  seed();
  console.log("Database initialized successfully.");
} catch (err) {
  console.error("Failed to initialize database:", err);
}

const runner = HermesRunner.getInstance();

async function startServer() {
  console.log("Starting Hermes Operator Dashboard server...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // SSE Client Management
  const sseClients = new Set<express.Response>();

  const broadcastEvent = (event: any) => {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    sseClients.forEach(client => {
      try {
        client.write(data);
      } catch (err) {
        sseClients.delete(client);
      }
    });
  };

  // Tickets API
  app.get("/api/tickets", async (req, res) => {
    try {
      const allTickets = await db.query.tickets.findMany({
        orderBy: [desc(schema.tickets.createdAt)],
      });
      res.json(allTickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const { title, description, priority, category, sourceType } = req.body;
      const newTicket = {
        id: `tick_${nanoid(10)}`,
        title,
        description,
        priority: priority || "medium",
        category,
        status: "backlog",
        boardColumn: "Backlog",
        sourceType: sourceType || "manual",
        historyJson: JSON.stringify([{
          id: nanoid(10),
          timestamp: new Date().toISOString(),
          user: "Operator",
          description: "Ticket created"
        }]),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.insert(schema.tickets).values(newTicket).run();
      
      broadcastEvent({ type: "TICKET_CREATED", ticket: newTicket });
      
      res.json(newTicket);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const oldTicket = await db.query.tickets.findFirst({ where: eq(schema.tickets.id, id) });
      if (!oldTicket) return res.status(404).json({ error: "Ticket not found" });

      const updates = { ...req.body, updatedAt: new Date() };
      
      // Generate history entry
      const history = JSON.parse(oldTicket.historyJson || "[]");
      const changes = [];
      const fieldsToTrack = ["title", "description", "status", "boardColumn", "priority", "assignedProfileId"];
      
      for (const key of fieldsToTrack) {
        if (req.body[key] !== undefined && req.body[key] !== oldTicket[key]) {
          changes.push({
            field: key,
            old: oldTicket[key],
            new: req.body[key]
          });
        }
      }

      if (changes.length > 0) {
        history.push({
          id: nanoid(10),
          timestamp: new Date().toISOString(),
          user: "Operator",
          changes,
          description: `Updated ${changes.map(c => c.field).join(", ")}`
        });
        updates.historyJson = JSON.stringify(history);
      }

      await db.update(schema.tickets).set(updates).where(eq(schema.tickets.id, id)).run();
      const updated = await db.query.tickets.findFirst({ where: eq(schema.tickets.id, id) });
      
      broadcastEvent({ type: "TICKET_UPDATED", ticket: updated });
      
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(schema.tickets).where(eq(schema.tickets.id, id)).run();
      
      broadcastEvent({ type: "TICKET_DELETED", ticketId: id });
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Agent Profiles API
  app.get("/api/profiles", async (req, res) => {
    try {
      const profiles = await db.query.agentProfiles.findMany();
      res.json(profiles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const { name, role, modelAlias, description, hermesHome } = req.body;
      const newProfile = {
        id: `prof_${nanoid(10)}`,
        name,
        role,
        modelAlias,
        description,
        hermesHome,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.insert(schema.agentProfiles).values(newProfile).run();
      res.json(newProfile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date() };
      await db.update(schema.agentProfiles).set(updates).where(eq(schema.agentProfiles.id, id)).run();
      const updated = await db.query.agentProfiles.findFirst({ where: eq(schema.agentProfiles.id, id) });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(schema.agentProfiles).where(eq(schema.agentProfiles.id, id)).run();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Runs API
  app.get("/api/runs", async (req, res) => {
    try {
      const allRuns = await db.query.runs.findMany({
        orderBy: [desc(schema.runs.createdAt)],
      });
      res.json(allRuns);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/runs", async (req, res) => {
    const { ticketId, profileId } = req.body;
    try {
      const runId = await runner.createRun(ticketId, profileId);
      res.json({ runId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/runs/:id/start", async (req, res) => {
    const { id } = req.params;
    try {
      await runner.startRun(id);
      res.json({ status: "started" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/runs/:id/events", async (req, res) => {
    try {
      const { id } = req.params;
      const events = await db.query.runEvents.findMany({
        where: eq(schema.runEvents.runId, id),
        orderBy: [schema.runEvents.sequenceNumber],
      });
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Approvals API
  app.get("/api/approvals", async (req, res) => {
    try {
      const allApprovals = await db.query.approvals.findMany({
        where: eq(schema.approvals.status, "pending"),
      });
      res.json(allApprovals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Etsy Listings API (Mocked for now)
  app.get("/api/etsy/listings", async (req, res) => {
    try {
      const listings = await db.query.etsyListings.findMany();
      res.json(listings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // SSE for live events
  app.get("/api/stream/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    sseClients.add(res);

    const interval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: "heartbeat", timestamp: new Date() })}\n\n`);
    }, 15000);

    req.on("close", () => {
      clearInterval(interval);
      sseClients.delete(res);
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
