import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with comprehensive profile data
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  nationalId: text("national_id").notNull().unique(),
  birthDate: text("birth_date"), // YYYY-MM-DD format
  goldBalance: real("gold_balance").notNull().default(0), // Sut
  tomanBalance: real("toman_balance").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  isKycVerified: integer("is_kyc_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});

// OTP verification codes
export const otpCodes = sqliteTable("otp_codes", {
  id: text("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at").notNull(),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});

// KYC verification data
export const kycVerifications = sqliteTable("kyc_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bankAccountNumber: text("bank_account_number").notNull(),
  bankCardImageUrl: text("bank_card_image_url").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  submittedAt: integer("submitted_at").notNull(),
});

// Lucky wheel spins
export const wheelSpins = sqliteTable("wheel_spins", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  prizeAmount: real("prize_amount").notNull(), // 0 for empty slot
  spunAt: integer("spun_at").notNull(),
});

// Transactions for all gold/toman movements
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // sell_gold, buy_gold, wheel_prize, referral_bonus, withdrawal
  goldAmount: real("gold_amount"),
  tomanAmount: real("toman_amount"),
  description: text("description"),
  createdAt: integer("created_at").notNull(),
});

// Referrals tracking
export const referrals = sqliteTable("referrals", {
  id: text("id").primaryKey(),
  referrerId: text("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredUserId: text("referred_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false), // True when referred user completes KYC
  bonusPaid: integer("bonus_paid", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  kycVerifications: many(kycVerifications),
  wheelSpins: many(wheelSpins),
  transactions: many(transactions),
  referralsMade: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
}));

export const kycVerificationsRelations = relations(kycVerifications, ({ one }) => ({
  user: one(users, {
    fields: [kycVerifications.userId],
    references: [users.id],
  }),
}));

export const wheelSpinsRelations = relations(wheelSpins, ({ one }) => ({
  user: one(users, {
    fields: [wheelSpins.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referred",
  }),
}));

// Zod schemas for validation
export const insertUserSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/, "شماره تلفن باید با 09 شروع شود و 11 رقم باشد"),
  nationalId: z.string().regex(/^\d{10}$/, "کد ملی باید 10 رقم باشد"),
  firstName: z.string().min(2, "نام باید حداقل 2 حرف باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل 2 حرف باشد"),
  birthDate: z.string().optional(),
  referralCode: z.string(),
  referredBy: z.string().optional().nullable(),
});

export const insertOtpSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/),
  code: z.string().length(4),
});

export const insertKycSchema = z.object({
  userId: z.string(),
  bankAccountNumber: z.string().min(10, "شماره حساب نامعتبر است").max(20),
  bankCardImageUrl: z.string(),
});

export const insertWheelSpinSchema = z.object({
  userId: z.string(),
  prizeAmount: z.number(),
});

export const insertTransactionSchema = z.object({
  userId: z.string(),
  type: z.string(),
  goldAmount: z.number().optional(),
  tomanAmount: z.number().optional(),
  description: z.string().optional(),
});

export const insertReferralSchema = z.object({
  referrerId: z.string(),
  referredUserId: z.string(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = z.infer<typeof insertOtpSchema>;

export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertKycVerification = z.infer<typeof insertKycSchema>;

export type WheelSpin = typeof wheelSpins.$inferSelect;
export type InsertWheelSpin = z.infer<typeof insertWheelSpinSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

