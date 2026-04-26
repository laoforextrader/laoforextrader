import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./sanity/schemas"

export default defineConfig({
  name: "laoforextrader",
  title: "LaoForexTrader CMS",

  projectId: "f8cr9afb",
  dataset:   "production",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("LaoForexTrader")
          .items([
            S.listItem()
              .title("📰 ບົດຄວາມ / Articles")
              .child(S.documentTypeList("article").title("ບົດຄວາມທັງໝົດ")),
            S.listItem()
              .title("🏦 Broker")
              .child(S.documentTypeList("broker").title("Broker ທັງໝົດ")),
            S.listItem()
              .title("✍️ ຜູ້ຂຽນ / Authors")
              .child(S.documentTypeList("author").title("ຜູ້ຂຽນທັງໝົດ")),
          ]),
    }),
    visionTool(),
  ],

  schema: { types: schemaTypes },
})
