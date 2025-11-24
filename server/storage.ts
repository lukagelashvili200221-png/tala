import {
  users,
  otpCodes,
  kycVerifications,
  wheelSpins,
  transactions,
  referrals,
  type User,
  type InsertUser,
  type OtpCode,
  type InsertOtpCode,
  type KycVerification,
  type InsertKycVerification,
  type WheelSpin,
  type InsertWheelSpin,
  type Transaction,
  type InsertTransaction,
  type Referral,
  type InsertReferral,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  getUserByNationalId(nationalId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { referralCode: string }): Promise<User>;
  updateUserBalance(userId: string, goldDelta: number, tomanDelta: number): Promise<void>;
  updateUserBirthDate(userId: string, birthDate: string): Promise<void>;
  markUserKycVerified(userId: string): Promise<void>;

  // OTP operations
  createOtpCode(otp: InsertOtpCode & { code: string; expiresAt: Date }): Promise<OtpCode>;
  getLatestOtp(phoneNumber: string): Promise<OtpCode | undefined>;
  markOtpVerified(id: string): Promise<void>;

  // KYC operations
  createKycVerification(kyc: InsertKycVerification): Promise<KycVerification>;
  getKycByUserId(userId: string): Promise<KycVerification | undefined>;

  // Wheel spin operations
  createWheelSpin(spin: InsertWheelSpin): Promise<WheelSpin>;
  getTodayWheelSpin(userId: string): Promise<WheelSpin | undefined>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;

  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: string): Promise<Referral[]>;
  getVerifiedReferralCount(userId: string): Promise<number>;
  markReferralVerified(referralId: string): Promise<void>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user || undefined;
  }

  async getUserByNationalId(nationalId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.nationalId, nationalId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { referralCode: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        id: uuidv4(),
        createdAt: Date.now(),
      })
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, goldDelta: number, tomanDelta: number): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    const newGold = parseFloat(user.goldBalance) + goldDelta;
    const newToman = parseFloat(user.tomanBalance) + tomanDelta;

    await db
      .update(users)
      .set({
        goldBalance: newGold.toString(),
        tomanBalance: newToman.toString(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserBirthDate(userId: string, birthDate: string): Promise<void> {
    await db
      .update(users)
      .set({ birthDate })
      .where(eq(users.id, userId));
  }

  async markUserKycVerified(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isKycVerified: true })
      .where(eq(users.id, userId));
  }

  // OTP operations
  async createOtpCode(insertOtp: InsertOtpCode & { code: string; expiresAt: Date }): Promise<OtpCode> {
    const [otp] = await db
      .insert(otpCodes)
      .values({
        ...insertOtp,
        id: uuidv4(),
        expiresAt: insertOtp.expiresAt.getTime(),
        createdAt: Date.now(),
      })
      .returning();
    return otp;
  }

  async getLatestOtp(phoneNumber: string): Promise<OtpCode | undefined> {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(eq(otpCodes.phoneNumber, phoneNumber))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);
    return otp || undefined;
  }

  async markOtpVerified(id: string): Promise<void> {
    await db
      .update(otpCodes)
      .set({ isVerified: true })
      .where(eq(otpCodes.id, id));
  }

  // KYC operations
  async createKycVerification(insertKyc: InsertKycVerification): Promise<KycVerification> {
    const [kyc] = await db
      .insert(kycVerifications)
      .values({
        ...insertKyc,
        id: uuidv4(),
        submittedAt: Date.now(),
      })
      .returning();
    return kyc;
  }

  async getKycByUserId(userId: string): Promise<KycVerification | undefined> {
    const [kyc] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userId, userId))
      .orderBy(desc(kycVerifications.submittedAt))
      .limit(1);
    return kyc || undefined;
  }

  // Wheel spin operations
  async createWheelSpin(insertSpin: InsertWheelSpin): Promise<WheelSpin> {
    const [spin] = await db
      .insert(wheelSpins)
      .values({
        ...insertSpin,
        id: uuidv4(),
        spunAt: Date.now(),
      })
      .returning();
    return spin;
  }

  async getTodayWheelSpin(userId: string): Promise<WheelSpin | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const [spin] = await db
      .select()
      .from(wheelSpins)
      .where(
        and(
          eq(wheelSpins.userId, userId),
          gte(wheelSpins.spunAt, todayTimestamp)
        )
      )
      .orderBy(desc(wheelSpins.spunAt))
      .limit(1);
    return spin || undefined;
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        id: uuidv4(),
        createdAt: Date.now(),
      })
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(50);
  }

  // Referral operations
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values({
        ...insertReferral,
        id: uuidv4(),
        createdAt: Date.now(),
      })
      .returning();
    return referral;
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    return await db
      .select({
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
          phoneNumber: users.phoneNumber,
        },
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referredUserId, users.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async getVerifiedReferralCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerId, userId),
          eq(referrals.isVerified, true)
        )
      );
    return result.length;
  }

  async markReferralVerified(referralId: string): Promise<void> {
    await db
      .update(referrals)
      .set({ isVerified: true })
      .where(eq(referrals.id, referralId));
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user || undefined;
  }
}

// Helper function to generate unique referral code
export function generateReferralCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

export const storage = new DatabaseStorage();
