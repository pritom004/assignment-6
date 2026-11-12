import { z } from "zod";
import * as repo from "../controllers/task.controller.js";
import OpenAI from "openai";
import {
  suggestTaskSystemPrompt,
  generateSuggestionPrompt,
} from "../utils/prompt.js";

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
});

const promptSchema = z.object({
  prompt: z
    .string({ required_error: "Prompt is required." })
    .trim()
    .min(3, "Prompt must be at least 3 characters long."),
});

const recommendationSchema = z.object({
  explanation: z.string(),
  recommendations: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      reason: z.string(),
      done: z.boolean(),
    }),
  ),
});

export const suggestTask = async (req, res) => {
  try {
    const result = promptSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }
    const { prompt } = result.data;

    const tasks = await repo.getAllTasks();

    const response = await client.chat.completions.create(
      {
        model: process.env.LLM_MODEL,
        messages: [
          { role: "user", content: generateSuggestionPrompt(prompt, tasks) },
          { role: "assistant", content: suggestTaskSystemPrompt },
        ],
      },
      {
        timeout: 15000,
        maxRetries: 0,
      },
    );

    const cleanedResponse = response.choices[0].message.content
      .replace(/```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsedResponse = JSON.parse(cleanedResponse);

    const validated = recommendationSchema.safeParse(parsedResponse);

    if (!validated.success) {
      return res.status(500).json({
        message: validated.error,
      });
    }

    return res.json(validated.data);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate suggestion",
    });
  }
};
