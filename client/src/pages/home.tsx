import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, ArrowDownUp, Users, Wallet as WalletIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import heroBackground from "@assets/generated_images/hero_gradient_background.png";

export default function Home() {
  const userId = localStorage.getItem("userId");
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const { data: canSpin } = useQuery({
    queryKey: ["/api/wheel/can-spin", userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const goldBalance = parseFloat(user?.goldBalance || "0");
  const tomanBalance = parseFloat(user?.tomanBalance || "0");

  return (
    <div className="pb-28">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container max-w-2xl mx-auto p-8 py-16 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block p-4 rounded-full bg-primary/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              خوش آمدید، {user?.firstName}!
            </h1>
            <p className="text-xl text-white/90 mb-2">
              پلتفرم خرید و فروش طلا
            </p>
            <p className="text-white/70">
              امن، سریع و قابل اعتماد
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-6 space-y-6 -mt-8">
        {/* Balance Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="border-2 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20" data-testid="card-home-gold">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">موجودی طلا</p>
              <p className="text-3xl font-bold font-numbers text-amber-600 dark:text-amber-400">
                {goldBalance.toLocaleString("fa-IR", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">سوت</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20" data-testid="card-home-toman">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">موجودی تومان</p>
              <p className="text-3xl font-bold font-numbers text-blue-600 dark:text-blue-400">
                {tomanBalance.toLocaleString("fa-IR", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">تومان</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2" data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="text-xl">دسترسی سریع</CardTitle>
              <CardDescription>به قسمت‌های مختلف دسترسی داشته باشید</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {canSpin?.canSpin && (
                <Button
                  onClick={() => setLocation("/lucky-wheel")}
                  className="h-16 text-lg justify-start gap-4 bg-gradient-to-r from-primary via-secondary to-amber-500 hover:from-primary/90 hover:via-secondary/90 hover:to-amber-500/90 shadow-lg hover:shadow-xl transition-all"
                  data-testid="button-go-to-wheel"
                >
                  <Gift className="w-6 h-6" />
                  <div className="text-right flex-1">
                    <div className="font-bold">گردونه شانس</div>
                    <div className="text-sm opacity-90">امروز یک بار رایگان!</div>
                  </div>
                </Button>
              )}

              <Button
                onClick={() => setLocation("/trading")}
                variant="outline"
                className="h-16 text-lg justify-start gap-4"
                data-testid="button-go-to-trading"
              >
                <div className="p-2 rounded-full bg-primary/10">
                  <ArrowDownUp className="w-6 h-6 text-primary" />
                </div>
                <div className="text-right flex-1">
                  <div className="font-bold">معاملات</div>
                  <div className="text-sm text-muted-foreground">خرید و فروش طلا</div>
                </div>
              </Button>

              <Button
                onClick={() => setLocation("/referral")}
                variant="outline"
                className="h-16 text-lg justify-start gap-4"
                data-testid="button-go-to-referral"
              >
                <div className="p-2 rounded-full bg-green-500/10">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-right flex-1">
                  <div className="font-bold">دعوت دوستان</div>
                  <div className="text-sm text-muted-foreground">به ازای هر نفر 1,000 سوت</div>
                </div>
              </Button>

              <Button
                onClick={() => setLocation("/wallet")}
                variant="outline"
                className="h-16 text-lg justify-start gap-4"
                data-testid="button-go-to-wallet"
              >
                <div className="p-2 rounded-full bg-blue-500/10">
                  <WalletIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-right flex-1">
                  <div className="font-bold">کیف پول</div>
                  <div className="text-sm text-muted-foreground">مشاهده موجودی و تراکنش‌ها</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* KYC Status */}
        {!user?.isKycVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-destructive/20 bg-destructive/5" data-testid="card-kyc-warning">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg mb-2">احراز هویت نشده‌اید</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  برای استفاده از امکانات معامله و برداشت، احراز هویت الزامی است
                </p>
                <Button
                  onClick={() => setLocation("/profile")}
                  variant="destructive"
                  className="w-full"
                  data-testid="button-go-to-kyc"
                >
                  احراز هویت کنید
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
