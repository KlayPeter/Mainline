import { ApiProblemSchema, DailyReviewInputSchema, DailyReviewSchema, ReviewListResponseSchema, TaskIdParamsSchema, type DailyReviewInput } from "@mainline/contracts";
import type { FastifyInstance } from "fastify";
import type { ReviewService } from "./service.js";

export async function registerReviewRoutes(app: FastifyInstance, options: { service: ReviewService }) {
  app.get("/reviews", { schema: { response: { 200: ReviewListResponseSchema } } }, async () => options.service.list());
  app.put("/reviews/:id", { schema: { params: TaskIdParamsSchema, body: DailyReviewInputSchema, response: { 200: DailyReviewSchema, 422: ApiProblemSchema } } }, async (request, reply) => {
    try { return options.service.save((request.params as { id: string }).id, request.body as DailyReviewInput); } catch { return reply.code(422).send({ code: "REVIEW_VALIDATION", message: "请填写真实的复盘日期。" }); }
  });
}
