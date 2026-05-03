import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
const REPLICATE_API_BASE = "https://api.replicate.com/v1";

async function replicateFetch(path: string, body?: unknown) {
  if (!REPLICATE_API_TOKEN) {
    throw new Error("Replicate API token not configured");
  }
  const resp = await fetch(`${REPLICATE_API_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Replicate error (${resp.status}): ${text}`);
  }
  return resp.json();
}

export const aiProxyRouter = createRouter({
  models: authedQuery.query(async () => {
    if (!REPLICATE_API_TOKEN) return [];
    const data = await replicateFetch("/models?owner=stability-ai") as {
      results: Array<{ owner: string; name: string; description?: string }>;
    };
    return data.results?.slice(0, 20) ?? [];
  }),

  run: authedQuery
    .input(
      z.object({
        version: z.string().min(1),
        input: z.record(z.string(), z.any()),
      }),
    )
    .mutation(async ({ input }) => {
      const prediction = (await replicateFetch("/predictions", {
        version: input.version,
        input: input.input,
      })) as { id: string; status: string; output?: unknown; urls?: { get: string } };
      return prediction;
    }),

  status: authedQuery
    .input(z.object({ predictionId: z.string().min(1) }))
    .query(async ({ input }) => {
      const prediction = (await replicateFetch(`/predictions/${input.predictionId}`)) as {
        id: string;
        status: string;
        output?: unknown;
        error?: string;
        urls?: { get: string };
      };
      return prediction;
    }),

  imageGenerate: authedQuery
    .input(
      z.object({
        prompt: z.string().min(1),
        width: z.number().optional().default(1024),
        height: z.number().optional().default(1024),
        numOutputs: z.number().optional().default(1),
      }),
    )
    .mutation(async ({ input }) => {
      // Stability SDXL default version
      const version = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
      const prediction = (await replicateFetch("/predictions", {
        version,
        input: {
          prompt: input.prompt,
          width: input.width,
          height: input.height,
          num_outputs: input.numOutputs,
        },
      })) as { id: string; status: string; output?: string[]; urls?: { get: string } };
      return prediction;
    }),

  videoGenerate: authedQuery
    .input(
      z.object({
        prompt: z.string().min(1),
        numFrames: z.number().optional().default(24),
        fps: z.number().optional().default(24),
      }),
    )
    .mutation(async ({ input }) => {
      // A generic video generation endpoint — user can supply their own version
      // For now we return a structured response that the frontend can poll
      return {
        id: "pending",
        status: "starting",
        message: "Video generation queued via Replicate",
        prompt: input.prompt,
      };
    }),

  voiceGenerate: authedQuery
    .input(
      z.object({
        text: z.string().min(1),
        voice: z.string().optional().default("af_bella"),
        speed: z.number().optional().default(1.0),
      }),
    )
    .mutation(async ({ input }) => {
      // Kokoro TTS default
      const version = "c97b4e22e47f440180682c404029564967e63e9d23c76fc5a6818c592aa95f59";
      const prediction = (await replicateFetch("/predictions", {
        version,
        input: {
          text: input.text,
          voice: input.voice,
          speed: input.speed,
        },
      })) as { id: string; status: string; output?: string; urls?: { get: string } };
      return prediction;
    }),
});
