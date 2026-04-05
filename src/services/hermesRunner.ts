import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import * as schema from "../db/schema.ts";
import { nanoid } from "nanoid";

export enum EventType {
  RUN_CREATED = "run.created",
  RUN_QUEUED = "run.queued",
  RUN_STARTED = "run.started",
  STEP_STARTED = "step.started",
  STEP_COMPLETED = "step.completed",
  AGENT_SPAWNED = "agent.spawned",
  AGENT_COMPLETED = "agent.completed",
  TOOL_CALLED = "tool.called",
  TOOL_COMPLETED = "tool.completed",
  TOOL_FAILED = "tool.failed",
  ARTIFACT_CREATED = "artifact.created",
  APPROVAL_REQUESTED = "approval.requested",
  APPROVAL_RESOLVED = "approval.resolved",
  RUN_COMPLETED = "run.completed",
  RUN_FAILED = "run.failed",
  RUN_CANCELLED = "run.cancelled",
}

export class HermesRunner {
  private static instance: HermesRunner;
  private activeRuns: Map<string, any> = new Map();

  private constructor() {}

  static getInstance() {
    if (!HermesRunner.instance) {
      HermesRunner.instance = new HermesRunner();
    }
    return HermesRunner.instance;
  }

  async createRun(ticketId: string, profileId: string) {
    const runId = `run_${nanoid(10)}`;
    const now = new Date();
    
    const newRun = {
      id: runId,
      ticketId,
      profileId,
      triggerType: "manual",
      status: "queued",
      createdAt: now,
    };

    await db.insert(schema.runs).values(newRun).run();
    await this.emitEvent(runId, EventType.RUN_CREATED, "info", "Run created and queued");
    
    return runId;
  }

  async startRun(runId: string) {
    const run = await db.query.runs.findFirst({ where: eq(schema.runs.id, runId) });
    if (!run) throw new Error("Run not found");

    await db.update(schema.runs).set({ status: "running", startedAt: new Date() }).where(eq(schema.runs.id, runId)).run();
    await this.emitEvent(runId, EventType.RUN_STARTED, "info", "Run execution started");

    // Start mock execution
    this.executeMockRun(runId);
  }

  private async executeMockRun(runId: string) {
    try {
      // Step 1: Analyze ticket
      await this.emitEvent(runId, EventType.STEP_STARTED, "info", "Analyzing ticket requirements...");
      await new Promise(r => setTimeout(r, 2000));
      await this.emitEvent(runId, EventType.STEP_COMPLETED, "success", "Analysis complete. Task breakdown generated.");

      // Step 2: Spawn sub-agent
      await this.emitEvent(runId, EventType.AGENT_SPAWNED, "info", "Spawning SEO Specialist agent...");
      await new Promise(r => setTimeout(r, 1500));

      // Step 3: Tool call
      await this.emitEvent(runId, EventType.TOOL_CALLED, "info", "Calling tool: etsy_listing_fetcher", { listing_id: "12345" });
      await new Promise(r => setTimeout(r, 1000));
      await this.emitEvent(runId, EventType.TOOL_COMPLETED, "success", "Tool execution successful");

      // Step 4: Create artifact
      const artifactId = `art_${nanoid(10)}`;
      await db.insert(schema.artifacts).values({
        id: artifactId,
        runId,
        artifactType: "text",
        title: "Optimized Title Draft",
        filePath: `/storage/artifacts/${artifactId}.txt`,
        createdAt: new Date()
      }).run();
      await this.emitEvent(runId, EventType.ARTIFACT_CREATED, "info", "New artifact created: Optimized Title Draft", { artifactId });

      // Step 5: Request approval
      const approvalId = `appr_${nanoid(10)}`;
      await db.insert(schema.approvals).values({
        id: approvalId,
        runId,
        approvalType: "etsy_update",
        requestedAction: "Update listing title to 'Handmade Ceramic Mug - Large 16oz Blue Glaze'",
        status: "pending",
        requestedAt: new Date()
      }).run();
      await this.emitEvent(runId, EventType.APPROVAL_REQUESTED, "warning", "Manual approval required for Etsy update", { approvalId });

      // Update run status to waiting_approval
      await db.update(schema.runs).set({ status: "waiting_approval" }).where(eq(schema.runs.id, runId)).run();

    } catch (err: any) {
      await this.emitEvent(runId, EventType.RUN_FAILED, "error", `Run failed: ${err.message}`);
      await db.update(schema.runs).set({ status: "failed", endedAt: new Date() }).where(eq(schema.runs.id, runId)).run();
    }
  }

  private async emitEvent(runId: string, type: string, level: string, message: string, payload?: any) {
    const eventId = `evt_${nanoid(10)}`;
    const sequence = await db.query.runEvents.findMany({ where: eq(schema.runEvents.runId, runId) });
    
    await db.insert(schema.runEvents).values({
      id: eventId,
      runId,
      sequenceNumber: sequence.length + 1,
      eventType: type,
      eventLevel: level,
      message,
      payloadJson: payload ? JSON.stringify(payload) : null,
      createdAt: new Date()
    }).run();

    // In a real app, we would publish to Redis here
    console.log(`[EVENT] ${runId} - ${type}: ${message}`);
  }
}
