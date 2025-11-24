# دستورالعمل نصب و اجرا - Installation Guide

## ✅ پیش‌نیازها

- **Node.js 18+** - [دانلود](https://nodejs.org/)
- **npm 9+** (می‌آید با Node.js)
- **Git** - [دانلود](https://git-scm.com/)

## 🚀 مراحل نصب

### Step 1: کلون کردن پروژه

```bash
git clone <repository-url>
cd PastedOtp
```

### Step 2: نصب وابستگی‌ها

```bash
npm install
```

### Step 3: تنظیم متغیرهای محیط

فایل `.env.local` را ایجاد کنید در ریشه پروژه:

```bash
# Windows PowerShell
echo "" > .env.local

# یا ایجاد دستی
```

محتوای `.env.local`:

```env
# 📊 DATABASE
DATABASE_URL=postgresql://user:password@localhost:5432/goldtrading

# 🤖 TELEGRAM BOT
# 1. @BotFather در تلگرام پیدا کنید
# 2. /newbot را استفاده کنید
# 3. توکن را کپی کنید
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg

# 💬 TELEGRAM GROUP
# 1. یک گروه ایجاد کنید
# 2. ربات را اضافه کنید
# 3. یک پیام بفرستید و ID را گرفته باشید (منفی است)
TELEGRAM_CHAT_ID=-1001234567890

# 📱 SMS API TOKEN
SMS_API_TOKEN=VfxfZubrWy+glyAHX0adMkshsGBfdbFjzQ/4KeTNVJnCIAH/3maggFMMHvIqCAkiRdzMMf+H7MjaCu8gJ9zhxTYvecNnGSaJxnpy6cre48M=

# 🌐 SERVER
PORT=5000
VITE_API_URL=http://localhost:5000
```

### Step 4: ایجاد جداول دیتابیس

```bash
npm run db:push
```

### Step 5: اجرای پروژه

#### حالت توسعه:
```bash
npm run dev
```

#### ساخت برای تولید:
```bash
npm run build
npm start
```

## 🎯 اولین بار استفاده

1. برنامه را در مرورگر باز کنید: `http://localhost:5000`
2. روی "ثبت نام" کلیک کنید
3. شماره تلفن را وارد کنید (مثال: 09123456789)
4. کد تایید را دریافت کنید (صفحه کنسول را بررسی کنید)
5. اطلاعات کاربری را تکمیل کنید
6. صفحه داشبورد را ببینید

## 🔧 دستورات مفید

```bash
# بررسی نوع‌ها
npm run check

# ساخت فقط Frontend
npm run build

# اجرا بدون ساخت (زمان توسعه)
npm run dev

# پاک کردن cache
rm -r node_modules
npm install
```

## 📁 ساختار پروژه

```
PastedOtp/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # صفحات
│   │   ├── components/ # کامپوننت‌ها
│   │   ├── lib/        # توابع کمکی
│   │   ├── hooks/      # Hooks سفارشی
│   │   ├── App.tsx     # اپلیکیشن
│   │   └── main.tsx    # ورودی
│   ├── index.html      # HTML فایل
│   └── public/         # فایل‌های ثابت
├── server/             # Backend
│   ├── routes.ts       # مسیرها
│   ├── storage.ts      # دیتابیس
│   ├── db.ts          # تنظیم دیتابیس
│   ├── app.ts         # Express
│   └── index-dev.ts   # ورودی توسعه
├── shared/            # کد مشترک
│   └── schema.ts      # Schema دیتابیس
├── package.json       # وابستگی‌ها
├── tsconfig.json      # TypeScript
├── tailwind.config.ts # Tailwind
├── vite.config.ts     # Vite
└── README.md          # مستندات
```

## 🐛 رفع مشکلات رایج

### مشکل: npm command not found

**حل**: Node.js را دوباره نصب کنید از [nodejs.org](https://nodejs.org)

```bash
# بررسی
node --version
npm --version
```

### مشکل: Port 5000 already in use

**حل**: پورت متفاوت استفاده کنید

```bash
$env:PORT=3000
npm run dev
```

### مشکل: DATABASE_URL not set

**حل**: `.env.local` فایل را بررسی کنید

```bash
# بررسی فایل
cat .env.local

# یا دستور جایگزین برای PowerShell
Get-Content .env.local
```

### مشکل: ERR_MODULE_NOT_FOUND

**حل**: وابستگی‌ها را دوباره نصب کنید

```bash
rm -r node_modules
npm install
```

## 📱 تست در موبایل

```bash
# بدست آوردن IP محلی
# Windows: ipconfig (IPv4 Address را پیدا کنید)
# Mac/Linux: ifconfig

# سپس در موبایل بروید به:
http://<YOUR-IP>:5000
```

## 🌐 استقرار (Deployment)

### استقرار بر روی Replit (توصیه‌شده)

1. [`replit.com`](https://replit.com) میں لاگ ان کریں
2. پروژه را import کنید
3. `.env` تنظیم کنید
4. `npm run build` را اجرا کنید
5. `npm start` را اجرا کنید

### استقرار بر روی Vercel/Netlify

⚠️ توجه: اینجا تنها Frontend را می‌توانید به سهولت استقرار دهید. Backend نیاز به سرور رایج دارد.

## 📞 پشتیبانی

اگر مشکلی دارید:

1. **README.md** را بخوانید
2. **GETTING_STARTED.md** را بررسی کنید
3. **Console Errors** را بررسی کنید (F12 در مرورگر)
4. GitHub Issues را بررسی کنید

## ✨ نکات نهایی

- اگر قطع شد، `npm run dev` را دوباره اجرا کنید
- Ctrl+C برای توقف
- تغییرات فقط Frontend را باید صفحه را refresh کنید
- تغییرات Backend نیاز به restart دارند

---

**موفق باشید! 🎉**
