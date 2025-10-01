import { defineCliConfig } from "sanity/cli";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.SANITY_PROJECT_ID!;
const dataset = process.env.SANITY_DATASET!;

export default defineCliConfig({
  api: { projectId, dataset },
});
