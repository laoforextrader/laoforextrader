import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./sanity/schemas"

export default defineConfig({
  name: "laoforextrader",
  title: "LaoForexTrader CMS",
  projectId: "f8cr9afb",
  dataset: "production",
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
