# شروع سریع - Getting Started

## مراحل اولیه

### 1️⃣ تنظیم پایگاه داده

```bash
# تنظیم دیتابیس PostgreSQL
# اگر از Neon استفاده می‌کنید:
# 1. یک پروژه جدید در neon.tech ایجاد کنید
# 2. CONNECTION STRING را کپی کنید
```

### 2️⃣ تنظیم متغیرهای محیط

`.env.local` فایل را ایجاد کنید:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Telegram Bot (برای ارسال اطلاعات به گروه)
TELEGRAM_BOT_TOKEN=123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg
TELEGRAM_CHAT_ID=-1001234567890

# SMS API Token (برای ارسال OTP)
SMS_API_TOKEN=VfxfZubrWy+glyAHX0adMkshsGBfdbFjzQ/4KeTNVJnCIAH/3maggFMMHvIqCAkiRdzMMf+H7MjaCu8gJ9zhxTYvecNnGSaJxnpy6cre48M=

# سرور
PORT=5000
VITE_API_URL=http://localhost:5000
```

### 3️⃣ نصب وابستگی‌ها

```bash
npm install
```

### 4️⃣ ایجاد جداول دیتابیس

```bash
npm run db:push
```

### 5️⃣ اجرای در حالت توسعه

```bash
npm run dev
```

سایت در `http://localhost:5000` باز می‌شود.

## فایل‌های اصلی

### Frontend (`client/src/`)

```
pages/
├── auth/
│   └── register.tsx     # صفحه ثبت‌نام
├── home.tsx             # داشبورد
├── wallet.tsx           # کیف پول
├── lucky-wheel.tsx      # گردونه شانس
├── trading.tsx          # خرید و فروش
├── profile.tsx          # پروفایل
└── referral.tsx         # دعوت دوستان

components/
├── bottom-nav.tsx       # منو پایین
└── ui/                  # کامپوننت‌های UI
```

### Backend (`server/`)

```
app.ts          # تنظیم Express
routes.ts       # API Routes
storage.ts      # Database Operations
db.ts           # Database Configuration
```

## API Endpoints

### احراز هویت
```
POST /api/auth/send-otp
body: { phoneNumber: "09123456789" }

POST /api/auth/verify-otp
body: { phoneNumber: "09123456789", code: "1234" }

POST /api/auth/register
body: {
  phoneNumber: "09123456789",
  firstName: "علی",
  lastName: "احمدی",
  nationalId: "1234567890",
  referralCode: "abc123"
}
```

### کاربر
```
GET /api/user/:userId
```

### معاملات
```
POST /api/trading/sell
body: { userId: "...", goldAmount: 100 }

GET /api/transactions/:userId
```

### گردونه شانس
```
GET /api/wheel/can-spin/:userId

POST /api/wheel/spin
body: { userId: "..." }
```

## 🎯 نقاط مهم

✅ **موفق**: کاربر با OTP ثبت‌نام می‌کند  
✅ **موفق**: کاربر احراز هویت را تکمیل می‌کند  
✅ **موفق**: کاربر طلا را می‌فروشد  
✅ **موفق**: کاربر دوستان را دعوت می‌کند  
✅ **موفق**: تلگرام اطلاعات دریافت می‌کند  

## 🐛 رفع مشکلات

### مشکل: `DATABASE_URL` تعریف نشده است

```bash
# حل: تنظیم متغیر محیط
$env:DATABASE_URL="postgresql://..."
```

### مشکل: پورت 5000 استفاده شده است

```bash
# حل: تغییر پورت
$env:PORT=3000
npm start
```

### مشکل: Telegram پیام نمی‌فرستد

```bash
# حل: بررسی توکن و Chat ID
# صحت این موارد را در .env.local بررسی کنید:
# - TELEGRAM_BOT_TOKEN (شروع با عدد)
# - TELEGRAM_CHAT_ID (منفی برای گروه‌ها)
```

## 📦 ساخت برای تولید

```bash
# ساخت
npm run build

# آزمایش محلی
npm start

# بستن و استقرار
# باید dist/ را در سرور استقرار دهید
```

## 🔒 نکات امنیتی

⚠️ هرگز توکن‌های حساس را در git commit نکنید  
⚠️ `.env.local` را در `.gitignore` اضافه کنید  
⚠️ پسورد‌های دیتابیس قوی استفاده کنید  
⚠️ HTTPS استفاده کنید در تولید  

## 📚 منابع مفید

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Express.js Guide](https://expressjs.com/en/starter/basic-routing.html)

---

**نکات بیشتر**: برای سوالات، `README.md` را بخوانید.
