import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const rawUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL!;
const connectionString = rawUrl ? rawUrl.replace(/[?&]sslmode=[^&]+/g, "") : "";

export default defineConfig({
  schema: path.join(process.cwd(), "prisma", "schema.prisma"),
  datasource: {
    url: connectionString,
  },
});
