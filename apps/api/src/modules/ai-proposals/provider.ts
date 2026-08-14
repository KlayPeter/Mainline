import type {
  AiInterruptionContent,
  AiInterruptionRequest,
  AiTaskPlanContent,
  AiTaskPlanRequest,
} from "@mainline/contracts";

export interface AiPlanningProvider {
  planTask(input: AiTaskPlanRequest): Promise<AiTaskPlanContent>;
  adviseOnInterruption(input: AiInterruptionRequest): Promise<AiInterruptionContent>;
}
