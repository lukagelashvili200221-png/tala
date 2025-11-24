import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownUp, TrendingDown, TrendingUp, Lock, Loader2 } from "lucide-react";

const GOLD_PRICE_PER_SUTE = 1000; // 1 Sut = 1000 Toman

const sellSchema = z.object({
  goldAmount: z.string().refine((val) => parseFloat(val) > 0, "مقدار باید بیشتر از صفر باشد"),
});

export default function Trading() {
  const [tab, setTab] = useState("sell");
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const form = useForm<z.infer<typeof sellSchema>>({
    resolver: zodResolver(sellSchema),
    defaultValues: { goldAmount: "" },
  });

  const sellMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sellSchema>) => {
      return await apiRequest("POST", "/api/trading/sell", {
        userId,
        goldAmount: parseFloat(data.goldAmount),
      });
    },
    onSuccess: () => {
      toast({
        title: "موفق! ✅",
        description: "طلای شما با موفقیت به تومان تبدیل شد",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "تبدیل با خطا مواجه شد",
        variant: "destructive",
      });
    },
  });

  const onSellSubmit = (data: z.infer<typeof sellSchema>) => {
    if (!user?.isKycVerified) {
      toast({
        title: "احراز هویت لازم است",
        description: "ابتدا باید احراز هویت کنید",
        variant: "destructive",
      });
      return;
    }
    sellMutation.mutate(data);
  };

  const goldAmount = form.watch("goldAmount");
  const tomanEquivalent = goldAmount ? parseFloat(goldAmount) * GOLD_PRICE_PER_SUTE : 0;
  const goldBalance = parseFloat(user?.goldBalance || "0");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 pb-28">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <ArrowDownUp className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">معاملات</h1>
        <p className="text-muted-foreground">خرید و فروش طلا</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted" data-testid="tabs-trading">
          <TabsTrigger 
            value="sell" 
            className="text-lg gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white transition-all" 
            data-testid="tab-sell"
          >
            <TrendingDown className="w-5 h-5" />
            فروش طلا
          </TabsTrigger>
          <TabsTrigger 
            value="buy" 
            className="text-lg gap-2 rounded-lg opacity-50 cursor-not-allowed" 
            data-testid="tab-buy" 
            disabled
          >
            <Lock className="w-4 h-4" />
            خرید طلا
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sell" className="mt-6">
          <Card className="border-2" data-testid="card-sell">
            <CardHeader>
              <CardTitle className="text-2xl">فروش طلا</CardTitle>
              <CardDescription className="text-base">
                طلای خود را به تومان تبدیل کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!user?.isKycVerified && (
                <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20">
                  <p className="text-destructive font-medium text-center">
                    برای معامله باید احراز هویت کنید
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-muted">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">موجودی طلا</span>
                  <span className="text-xl font-bold font-numbers" data-testid="text-available-gold">
                    {goldBalance.toLocaleString("fa-IR")} سوت
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm">نرخ فعلی</span>
                  <span className="text-lg font-bold font-numbers text-primary">
                    {GOLD_PRICE_PER_SUTE.toLocaleString("fa-IR")} تومان / سوت
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSellSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="goldAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">مقدار طلا (سوت)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className="h-16 text-2xl text-center font-numbers"
                            dir="ltr"
                            data-testid="input-sell-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {tomanEquivalent > 0 && (
                    <div className="p-6 rounded-xl bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">دریافت می‌کنید</p>
                        <p className="text-4xl font-bold font-numbers text-green-600 dark:text-green-400" data-testid="text-toman-equivalent">
                          {tomanEquivalent.toLocaleString("fa-IR")} تومان
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.setValue("goldAmount", (goldBalance * 0.25).toString())}
                      className="flex-1"
                      data-testid="button-25-percent"
                    >
                      25%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.setValue("goldAmount", (goldBalance * 0.5).toString())}
                      className="flex-1"
                      data-testid="button-50-percent"
                    >
                      50%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.setValue("goldAmount", (goldBalance * 0.75).toString())}
                      className="flex-1"
                      data-testid="button-75-percent"
                    >
                      75%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.setValue("goldAmount", goldBalance.toString())}
                      className="flex-1"
                      data-testid="button-100-percent"
                    >
                      همه
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all"
                    disabled={sellMutation.isPending || !user?.isKycVerified || goldBalance === 0}
                    data-testid="button-confirm-sell"
                  >
                    {sellMutation.isPending && <Loader2 className="ml-3 h-6 w-6 animate-spin" />}
                    <TrendingDown className="ml-3 h-6 w-6" />
                    فروش طلا
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buy" className="mt-6">
          <Card className="border-2 relative overflow-hidden" data-testid="card-buy">
            <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center p-8">
                <Lock className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">به زودی</h3>
                <p className="text-muted-foreground">
                  بخش خرید طلا به زودی فعال می‌شود
                </p>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">خرید طلا</CardTitle>
              <CardDescription>
                با موجودی تومان خود طلا بخرید
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96" />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
