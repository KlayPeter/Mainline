import type { DatabaseSync } from "node:sqlite";

import { isAiProposal, type AiProposal, type AiProposalStatus } from "@mainline/contracts";

interface AiProposalRow {
  id: string;
  status: AiProposalStatus;
  payload_json: string;
  resolved_at: string | null;
}

function toProposal(row: AiProposalRow): AiProposal {
  const payload: unknown = JSON.parse(row.payload_json);

  if (!isAiProposal(payload)) {
    throw new Error("本地 AI 提案记录损坏。");
  }

  return {
    ...payload,
    status: row.status,
    resolvedAt: row.resolved_at,
  };
}

export class AiProposalRepository {
  constructor(private readonly database: DatabaseSync) {}

  create(proposal: AiProposal): AiProposal {
    this.database
      .prepare(
        `
          INSERT INTO ai_proposals (id, kind, status, payload_json, created_at, resolved_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        proposal.id,
        proposal.kind,
        proposal.status,
        JSON.stringify(proposal),
        proposal.createdAt,
        proposal.resolvedAt,
      );

    return proposal;
  }

  listPending(): AiProposal[] {
    const rows = this.database
      .prepare(
        "SELECT id, status, payload_json, resolved_at FROM ai_proposals WHERE status = 'pending' ORDER BY created_at DESC",
      )
      .all() as unknown as AiProposalRow[];

    return rows.map(toProposal);
  }

  findById(id: string): AiProposal | undefined {
    const row = this.database
      .prepare("SELECT id, status, payload_json, resolved_at FROM ai_proposals WHERE id = ?")
      .get(id) as unknown as AiProposalRow | undefined;

    return row ? toProposal(row) : undefined;
  }

  resolve(id: string, status: Extract<AiProposalStatus, "accepted" | "dismissed">): AiProposal {
    const resolvedAt = new Date().toISOString();
    this.database
      .prepare("UPDATE ai_proposals SET status = ?, resolved_at = ? WHERE id = ?")
      .run(status, resolvedAt, id);

    return this.findById(id)!;
  }
}
