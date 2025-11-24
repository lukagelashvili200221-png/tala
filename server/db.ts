import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// استفاده از SQLite برای توسعه و تولید
console.log("📊 Using SQLite for database...");
const sqlite = new Database('dev.db');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle({ client: sqlite, schema });
export const pool = null; // Not needed for SQLite
