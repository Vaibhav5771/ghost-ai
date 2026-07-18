import { z } from "zod"

export const aiStatusPayloadSchema = z.object({
  thinking: z.boolean(),
  text: z.string().optional(),
})

export type AiStatusPayload = z.infer<typeof aiStatusPayloadSchema>

export const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
