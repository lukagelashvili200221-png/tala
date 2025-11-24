import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet as WalletIcon, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Wallet() {
  const userId = localStorage.getItem("userId");

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ["/api/transactions", userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const goldBalance = parseFloat(user?.goldBalance || "0");
  const tomanBalance = parseFloat(user?.tomanBalance || "0");

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6 pb-28">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">کیف پول من</h1>
        <p className="text-muted-foreground">موجودی و تراکنش‌های شما</p>
      </div>

      <div className="grid gap-6">
        {/* Gold Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20" data-testid="card-gold-balance">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Coins className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                موجودی طلا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold font-numbers text-amber-600 dark:text-amber-400" data-testid="text-gold-balance">
                  {goldBalance.toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                </span>
                <span className="text-2xl text-muted-foreground">سوت</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                برای برداشت، ابتدا طلا را به تومان تبدیل کنید
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Toman Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20" data-testid="card-toman-balance">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <WalletIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                موجودی تومان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold font-numbers text-blue-600 dark:text-blue-400" data-testid="text-toman-balance">
                  {tomanBalance.toLocaleString("fa-IR", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-2xl text-muted-foreground">تومان</span>
              </div>
              {!user?.isKycVerified && (
                <p className="text-sm text-destructive mt-3 font-medium">
                  برای برداشت، احراز هویت کنید و 5 نفر دعوت کنید
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <Card className="border-2" data-testid="card-transactions">
        <CardHeader>
          <CardTitle className="text-xl">تراکنش‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover-elevate"
                  data-testid={`transaction-${tx.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'sell_gold' || tx.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
                    }`}>
                      {tx.type === 'sell_gold' || tx.type === 'withdrawal' ? (
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{getTransactionLabel(tx.type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    {tx.goldAmount && (
                      <p className={`font-bold font-numbers ${
                        parseFloat(tx.goldAmount) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(tx.goldAmount) > 0 ? '+' : ''}
                        {parseFloat(tx.goldAmount).toLocaleString("fa-IR")} سوت
                      </p>
                    )}
                    {tx.tomanAmount && (
                      <p className={`font-bold font-numbers ${
                        parseFloat(tx.tomanAmount) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(tx.tomanAmount) > 0 ? '+' : ''}
                        {parseFloat(tx.tomanAmount).toLocaleString("fa-IR")} تومان
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">هنوز تراکنشی ثبت نشده است</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getTransactionLabel(type: string): string {
  const labels: Record<string, string> = {
    sell_gold: "فروش طلا",
    buy_gold: "خرید طلا",
    wheel_prize: "جایزه گردونه",
    referral_bonus: "پاداش معرفی",
    withdrawal: "برداشت",
  };
  return labels[type] || type;
}
