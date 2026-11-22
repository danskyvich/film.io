import { neon } from "@neondatabase/serverless";

export const recommender_sql = neon(process.env.ENGINE_URL!);
export const sql = neon(process.env.DATABASE_URL!);