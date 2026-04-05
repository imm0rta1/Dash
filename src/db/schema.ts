import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const agentProfiles = sqliteTable("agent_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  hermesHome: text("hermes_home"),
  modelAlias: text("model_alias"),
  description: text("description"),
  permissionsJson: text("permissions_json"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const tickets = sqliteTable("tickets", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(), // backlog, planned, running, waiting_approval, blocked, done, archived
  boardColumn: text("board_column").notNull(),
  priority: text("priority").notNull(), // low, medium, high, urgent
  category: text("category"),
  linkedListingId: text("linked_listing_id"),
  assignedProfileId: text("assigned_profile_id").references(() => agentProfiles.id),
  sourceType: text("source_type"), // manual, automation, etsy
  createdBy: text("created_by"),
  dueAt: integer("due_at", { mode: "timestamp" }),
  historyJson: text("history_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const ticketComments = sqliteTable("ticket_comments", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull().references(() => tickets.id),
  authorType: text("author_type").notNull(), // user, agent
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").references(() => tickets.id),
  parentRunId: text("parent_run_id"),
  profileId: text("profile_id").references(() => agentProfiles.id),
  triggerType: text("trigger_type").notNull(), // manual, automation, sub-agent
  requestedAction: text("requested_action"),
  status: text("status").notNull(), // queued, starting, running, waiting_approval, retrying, succeeded, failed, cancelled
  startedAt: integer("started_at", { mode: "timestamp" }),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  exitCode: integer("exit_code"),
  summary: text("summary"),
  langfuseTraceId: text("langfuse_trace_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const runEvents = sqliteTable("run_events", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => runs.id),
  sequenceNumber: integer("sequence_number").notNull(),
  eventType: text("event_type").notNull(),
  eventLevel: text("event_level").notNull(), // info, warning, error, success
  message: text("message").notNull(),
  payloadJson: text("payload_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const toolCalls = sqliteTable("tool_calls", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => runs.id),
  toolName: text("tool_name").notNull(),
  status: text("status").notNull(), // pending, running, succeeded, failed, skipped
  inputJson: text("input_json"),
  outputJson: text("output_json"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  endedAt: integer("ended_at", { mode: "timestamp" }),
});

export const approvals = sqliteTable("approvals", {
  id: text("id").primaryKey(),
  runId: text("run_id").references(() => runs.id),
  ticketId: text("ticket_id").references(() => tickets.id),
  approvalType: text("approval_type").notNull(),
  requestedAction: text("requested_action").notNull(),
  contextJson: text("context_json"),
  status: text("status").notNull(), // pending, approved, rejected
  requestedAt: integer("requested_at", { mode: "timestamp" }).notNull(),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  resolvedBy: text("resolved_by"),
});

export const artifacts = sqliteTable("artifacts", {
  id: text("id").primaryKey(),
  runId: text("run_id").references(() => runs.id),
  ticketId: text("ticket_id").references(() => tickets.id),
  artifactType: text("artifact_type").notNull(),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type"),
  metadataJson: text("metadata_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const etsyListings = sqliteTable("etsy_listings", {
  id: text("id").primaryKey(),
  etsyListingId: text("etsy_listing_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  tagsJson: text("tags_json"),
  price: real("price").notNull(),
  status: text("status").notNull(),
  imagePathsJson: text("image_paths_json"),
  seoScore: integer("seo_score"),
  views7d: integer("views_7d"),
  views30d: integer("views_30d"),
  conversions30d: real("conversions_30d"),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  etsyOrderId: text("etsy_order_id").notNull(),
  itemTitle: text("item_title").notNull(),
  buyerName: text("buyer_name").notNull(),
  orderStatus: text("order_status").notNull(),
  fulfillmentStatus: text("fulfillment_status").notNull(),
  orderedAt: integer("ordered_at", { mode: "timestamp" }).notNull(),
  syncedAt: integer("synced_at", { mode: "timestamp" }).notNull(),
});

export const automations = sqliteTable("automations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isEnabled: integer("is_enabled", { mode: "boolean" }).default(true),
  cronExpression: text("cron_expression").notNull(),
  plainEnglishSchedule: text("plain_english_schedule"),
  deliveryTarget: text("delivery_target"),
  promptTemplateId: text("prompt_template_id"),
  profileId: text("profile_id").references(() => agentProfiles.id),
  lastRunAt: integer("last_run_at", { mode: "timestamp" }),
  nextRunAt: integer("next_run_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const promptTemplates = sqliteTable("prompt_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  content: text("content").notNull(),
  version: text("version").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const memoryFiles = sqliteTable("memory_files", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  memoryType: text("memory_type").notNull(), // core, business, operational
  description: text("description"),
  filePath: text("file_path").notNull(),
  embeddingStatus: text("embedding_status"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const memoryChunks = sqliteTable("memory_chunks", {
  id: text("id").primaryKey(),
  memoryFileId: text("memory_file_id").notNull().references(() => memoryFiles.id),
  chunkText: text("chunk_text").notNull(),
  embedding: text("embedding"), // Store as JSON string of float array
  metadataJson: text("metadata_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
