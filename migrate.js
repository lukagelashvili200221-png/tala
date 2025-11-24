import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

// Create and setup database
const sqlite = new Database('dev.db');
sqlite.pragma('journal_mode = WAL');

// Create tables
const sql = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  birth_date TEXT,
  gold_balance REAL DEFAULT 0,
  toman_balance REAL DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  is_kyc_verified INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  is_verified INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_card_image_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  submitted_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS wheel_spins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  prize_amount REAL NOT NULL,
  spun_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  gold_amount REAL,
  toman_amount REAL,
  description TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  is_verified INTEGER DEFAULT 0,
  bonus_paid INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(referrer_id) REFERENCES users(id),
  FOREIGN KEY(referred_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wheel_user ON wheel_spins(user_id);
CREATE INDEX IF NOT EXISTS idx_trans_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ref_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_ref_referred ON referrals(referred_user_id);
`;

const statements = sql.split(';').filter(s => s.trim());
for (const stmt of statements) {
  if (stmt.trim()) {
    sqlite.exec(stmt);
  }
}

console.log('✅ SQLite tables created successfully!');
console.log('📊 Database: dev.db');
console.log('📁 Tables: users, otp_codes, kyc_verifications, wheel_spins, transactions, referrals');
process.exit(0);
