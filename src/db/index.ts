import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.ts";

const sqlite = new Database("local.db");
export const db = drizzle(sqlite, { schema });

// Initial seed function
export function seed() {
  // Ensure tables exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS agent_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      hermes_home TEXT,
      model_alias TEXT,
      description TEXT,
      permissions_json TEXT,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      board_column TEXT NOT NULL,
      priority TEXT NOT NULL,
      category TEXT,
      linked_listing_id TEXT,
      assigned_profile_id TEXT REFERENCES agent_profiles(id),
      source_type TEXT,
      created_by TEXT,
      due_at INTEGER,
      history_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      ticket_id TEXT REFERENCES tickets(id),
      parent_run_id TEXT,
      profile_id TEXT REFERENCES agent_profiles(id),
      trigger_type TEXT NOT NULL,
      requested_action TEXT,
      status TEXT NOT NULL,
      started_at INTEGER,
      ended_at INTEGER,
      exit_code INTEGER,
      summary TEXT,
      langfuse_trace_id TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS run_events (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id),
      sequence_number INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      event_level TEXT NOT NULL,
      message TEXT NOT NULL,
      payload_json TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      run_id TEXT REFERENCES runs(id),
      ticket_id TEXT REFERENCES tickets(id),
      approval_type TEXT NOT NULL,
      requested_action TEXT NOT NULL,
      context_json TEXT,
      status TEXT NOT NULL,
      requested_at INTEGER NOT NULL,
      resolved_at INTEGER,
      resolved_by TEXT
    );

    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      run_id TEXT REFERENCES runs(id),
      ticket_id TEXT REFERENCES tickets(id),
      artifact_type TEXT NOT NULL,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      mime_type TEXT,
      metadata_json TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS etsy_listings (
      id TEXT PRIMARY KEY,
      etsy_listing_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      tags_json TEXT,
      price REAL NOT NULL,
      status TEXT NOT NULL,
      image_paths_json TEXT,
      seo_score INTEGER,
      views_7d INTEGER,
      views_30d INTEGER,
      conversions_30d REAL,
      last_synced_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  try {
    sqlite.exec("ALTER TABLE tickets ADD COLUMN history_json TEXT");
  } catch (e) {
    // Column already exists
  }

  // Check if we already have profiles
  const profiles = sqlite.prepare("SELECT count(*) as count FROM agent_profiles").get() as { count: number };
  if (profiles.count === 0) {
    console.log("Seeding initial agent profiles...");
    const now = new Date();
    
    const initialProfiles = [
      {
        id: "prof_supervisor",
        name: "Hermes Supervisor",
        role: "Supervisor",
        description: "Main coordinator for Etsy shop tasks. Breaks down complex requests and delegates to specialists.",
        modelAlias: "gemini-3.1-pro-preview",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "prof_researcher",
        name: "Market Researcher",
        role: "Research",
        description: "Specializes in competitor analysis, trend spotting, and keyword research for Etsy.",
        modelAlias: "gemini-3.1-flash-preview",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "prof_seo",
        name: "SEO Optimizer",
        role: "Listing SEO",
        description: "Expert in Etsy search algorithms. Rewrites titles, tags, and descriptions for maximum visibility.",
        modelAlias: "gemini-3.1-flash-preview",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "prof_content",
        name: "Content Creator",
        role: "Content/Ops",
        description: "Drafts social media posts, customer responses, and marketing copy.",
        modelAlias: "gemini-3.1-flash-preview",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    ];

    for (const profile of initialProfiles) {
      db.insert(schema.agentProfiles).values(profile).run();
    }

    // Seed some initial tickets
    db.insert(schema.tickets).values({
      id: "tick_1",
      title: "Optimize 'Handmade Ceramic Mug' Listing",
      description: "The listing is underperforming. Need a full SEO audit and title rewrite.",
      status: "backlog",
      boardColumn: "Backlog",
      priority: "high",
      category: "SEO",
      sourceType: "manual",
      createdAt: now,
      updatedAt: now,
    }).run();
  }
}
