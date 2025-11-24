import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Share2, Users, Gift, CheckCircle, Clock, Copy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals", userId],
    enabled: !!userId,
  });

  const verifiedCount = referrals?.filter((r: any) => r.isVerified).length || 0;
  const totalCount = referrals?.length || 0;
  const progress = (verifiedCount / 5) * 100;
  const canWithdraw = verifiedCount >= 5;

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      toast({
        title: "کپی شد! ✅",
        description: "کد معرف شما کپی شد",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferral = () => {
    const text = `به پلتفرم طلا آنلاین بپیوندید!\nکد معرف من: ${user?.referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: "دعوت به طلا آنلاین",
        text,
      });
    } else {
      copyReferralCode();
    }
  };

  if (userLoading || referralsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6 pb-28">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">دعوت دوستان</h1>
        <p className="text-muted-foreground">به ازای هر دعوت موفق، 1,000 سوت طلا دریافت کنید</p>
      </div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 bg-gradient-to-br from-primary/10 via-background to-primary/5" data-testid="card-referral-code">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">کد معرف شما</CardTitle>
            <CardDescription>این کد را با دوستان خود به اشتراک بگذارید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-2xl bg-card border-2 text-center">
              <p className="text-5xl font-bold font-mono text-primary tracking-wider" data-testid="text-referral-code">
                {user?.referralCode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={copyReferralCode}
                variant="outline"
                className="h-14 gap-2"
                data-testid="button-copy-code"
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "کپی شد!" : "کپی کد"}
              </Button>
              <Button
                onClick={shareReferral}
                className="h-14 gap-2"
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5" />
                اشتراک‌گذاری
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2" data-testid="card-withdrawal-progress">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              پیشرفت برای برداشت
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">دعوت‌های تایید شده</span>
                <span className="text-2xl font-bold font-numbers" data-testid="text-verified-count">
                  {verifiedCount} / 5
                </span>
              </div>
              <Progress value={progress} className="h-3" data-testid="progress-referrals" />
            </div>

            {canWithdraw ? (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                <p className="font-bold text-green-600">تبریک! برداشت برای شما فعال شد 🎉</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted text-center">
                <p className="font-medium text-muted-foreground">
                  {5 - verifiedCount} دعوت تایید شده دیگر نیاز دارید
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-xl bg-primary/5">
                <p className="text-sm text-muted-foreground mb-1">کل دعوت‌ها</p>
                <p className="text-3xl font-bold font-numbers text-primary" data-testid="text-total-referrals">
                  {totalCount}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20">
                <p className="text-sm text-muted-foreground mb-1">پاداش کسب شده</p>
                <p className="text-3xl font-bold font-numbers text-green-600" data-testid="text-total-rewards">
                  {(verifiedCount * 1000).toLocaleString("fa-IR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral List */}
      <Card className="border-2" data-testid="card-referral-list">
        <CardHeader>
          <CardTitle className="text-xl">لیست دعوت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals && referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((referral: any, index: number) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover-elevate"
                  data-testid={`referral-item-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {referral.referredUser?.firstName} {referral.referredUser?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(referral.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <div>
                    {referral.isVerified ? (
                      <Badge className="gap-1" data-testid={`badge-verified-${index}`}>
                        <CheckCircle className="w-4 h-4" />
                        تایید شده
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1" data-testid={`badge-pending-${index}`}>
                        <Clock className="w-4 h-4" />
                        در انتظار
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">هنوز کسی را دعوت نکرده‌اید</p>
              <p className="text-sm text-muted-foreground mt-2">
                کد معرف خود را با دوستان به اشتراک بگذارید
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-2 bg-muted/30" data-testid="card-how-it-works">
        <CardHeader>
          <CardTitle className="text-lg">چگونه کار می‌کند؟</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <p>کد معرف خود را با دوستان به اشتراک بگذارید</p>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <p>دوست شما با کد شما ثبت نام کند و احراز هویت کامل کند</p>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <p>شما 1,000 سوت طلا دریافت می‌کنید</p>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <p>بعد از 5 دعوت تایید شده، برداشت برای شما فعال می‌شود</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
