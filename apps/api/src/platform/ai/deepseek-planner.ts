import {
  isAiInterruptionContent,
  isAiTaskPlanContent,
  type AiInterruptionContent,
  type AiInterruptionRequest,
  type AiTaskPlanContent,
  type AiTaskPlanRequest,
} from "@mainline/contracts";

import { AiProposalError } from "../../modules/ai-proposals/errors.js";
import type { AiPlanningProvider } from "../../modules/ai-proposals/provider.js";

interface DeepSeekPlannerConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface JsonResponseShape {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

function getDeepSeekConfig(): DeepSeekPlannerConfig | undefined {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    return undefined;
  }

  return {
    apiKey,
    baseUrl: (process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com").replace(/\/$/, ""),
    model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash",
  };
}

function getJsonContent(payload: unknown): unknown {
  const content = (payload as JsonResponseShape).choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new AiProposalError("AI_INVALID_RESPONSE", "AI 没有返回可用的规划内容，请稍后再试。", 502);
  }

  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new AiProposalError("AI_INVALID_RESPONSE", "AI 返回的规划格式无法识别，请重新请求。", 502);
  }
}

class UnavailableAiPlanner implements AiPlanningProvider {
  async planTask(): Promise<AiTaskPlanContent> {
    throw new AiProposalError(
      "AI_NOT_CONFIGURED",
      "尚未配置 DeepSeek。请在项目根目录 .env 填写 DEEPSEEK_API_KEY 后重启本地服务。",
      503,
    );
  }

  async adviseOnInterruption(): Promise<AiInterruptionContent> {
    throw new AiProposalError(
      "AI_NOT_CONFIGURED",
      "尚未配置 DeepSeek。请在项目根目录 .env 填写 DEEPSEEK_API_KEY 后重启本地服务。",
      503,
    );
  }
}

class DeepSeekPlanner implements AiPlanningProvider {
  constructor(private readonly config: DeepSeekPlannerConfig) {}

  async planTask(input: AiTaskPlanRequest): Promise<AiTaskPlanContent> {
    const response = await this.requestJson(
      `你是 Mainline 的任务规划助手。只输出 json，不做最终决定，不声称任务已经被创建或修改。
根据用户提供的任务，给出简短分析、建议的 lane、form、timeBlock，以及 1 到 5 个可执行步骤。
lane 仅可为 main、side、growth、routine；form 仅可为 one_off、routine、challenge、event；timeBlock 仅可为 anytime、morning、afternoon、evening。
输出 JSON 格式：{"analysis":"","suggestedLane":"","suggestedForm":"","suggestedTimeBlock":"","suggestedSteps":[{"title":"","details":""}]}`,
      input,
    );

    if (!isAiTaskPlanContent(response)) {
      throw new AiProposalError("AI_INVALID_RESPONSE", "AI 返回的任务建议不完整，请重新请求。", 502);
    }

    return response;
  }

  async adviseOnInterruption(input: AiInterruptionRequest): Promise<AiInterruptionContent> {
    const response = await this.requestJson(
      `你是 Mainline 的现实中断助手。只输出 json，不做最终决定，不声称任务已经被修改。
用户遇到现实干扰时，给出简短总结和一条可选调整建议。suggestedAction 仅可为 keep、reduce、reschedule、pause。
输出 JSON 格式：{"summary":"","suggestedAction":"","suggestedAdjustment":""}`,
      input,
    );

    if (!isAiInterruptionContent(response)) {
      throw new AiProposalError("AI_INVALID_RESPONSE", "AI 返回的中断建议不完整，请重新请求。", 502);
    }

    return response;
  }

  private async requestJson(systemPrompt: string, userInput: unknown): Promise<unknown> {
    let response: Response;

    try {
      response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model,
          response_format: { type: "json_object" },
          max_tokens: 1200,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(userInput) },
          ],
        }),
      });
    } catch {
      throw new AiProposalError("AI_UPSTREAM_FAILURE", "暂时无法连接 DeepSeek，请检查网络后重试。", 502);
    }

    if (!response.ok) {
      throw new AiProposalError("AI_UPSTREAM_FAILURE", "DeepSeek 暂时无法生成建议，请稍后再试。", 502);
    }

    try {
      return getJsonContent(await response.json());
    } catch (error) {
      if (error instanceof AiProposalError) {
        throw error;
      }

      throw new AiProposalError("AI_INVALID_RESPONSE", "AI 返回的内容无法识别，请重新请求。", 502);
    }
  }
}

export function createDeepSeekPlanner(): AiPlanningProvider {
  const config = getDeepSeekConfig();
  return config ? new DeepSeekPlanner(config) : new UnavailableAiPlanner();
}
