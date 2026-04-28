import { createClient } from "@sanity/client"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb"
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET   ?? "production"

export const sanityWrite = createClient({
  projectId,
  dataset,
  apiVersion: "2025-04-25",
  useCdn:     false,
  token:      process.env.SANITY_API_TOKEN,
  perspective: "published",
})
