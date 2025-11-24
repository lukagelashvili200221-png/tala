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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, CheckCircle, XCircle, Loader2, Upload, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const kycSchema = z.object({
  birthDate: z.string().min(10, "تاریخ تولد الزامی است"),
  bankAccountNumber: z.string().min(10, "شماره حساب نامعتبر است").max(20),
  bankCardImage: z.instanceof(FileList).optional(),
});

export default function Profile() {
  const [tab, setTab] = useState("info");
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const form = useForm<z.infer<typeof kycSchema>>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      birthDate: "",
      bankAccountNumber: "",
    },
  });

  const kycMutation = useMutation({
    mutationFn: async (data: z.infer<typeof kycSchema>) => {
      const formData = new FormData();
      formData.append("userId", userId || "");
      formData.append("birthDate", data.birthDate);
      formData.append("bankAccountNumber", data.bankAccountNumber);
      if (data.bankCardImage && data.bankCardImage.length > 0) {
        formData.append("bankCardImage", data.bankCardImage[0]);
      }

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در ارسال اطلاعات");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "موفق! ✅",
        description: "اطلاعات احراز هویت شما ارسال شد و در حال بررسی است",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setTab("info");
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "ارسال اطلاعات با خطا مواجه شد",
        variant: "destructive",
      });
    },
  });

  const onKycSubmit = (data: z.infer<typeof kycSchema>) => {
    if (!data.bankCardImage || data.bankCardImage.length === 0) {
      toast({
        title: "خطا",
        description: "لطفاً عکس کارت بانکی را آپلود کنید",
        variant: "destructive",
      });
      return;
    }
    kycMutation.mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">پروفایل من</h1>
        <p className="text-muted-foreground">اطلاعات کاربری و احراز هویت</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted" data-testid="tabs-profile">
          <TabsTrigger 
            value="info" 
            className="text-lg gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all" 
            data-testid="tab-info"
          >
            <User className="w-5 h-5" />
            اطلاعات کاربر
          </TabsTrigger>
          <TabsTrigger 
            value="kyc" 
            className="text-lg gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all" 
            data-testid="tab-kyc"
          >
            <Shield className="w-5 h-5" />
            احراز هویت
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card className="border-2" data-testid="card-user-info">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">اطلاعات کاربری</CardTitle>
                {user?.isKycVerified && (
                  <Badge className="gap-1 px-3 py-1" data-testid="badge-verified">
                    <CheckCircle className="w-4 h-4" />
                    تایید شده
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4"
              >
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">نام و نام خانوادگی</p>
                  <p className="text-xl font-semibold" data-testid="text-fullname">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">شماره تلفن</p>
                  <p className="text-xl font-semibold font-numbers" dir="ltr" data-testid="text-phone">
                    {user?.phoneNumber}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">کد ملی</p>
                  <p className="text-xl font-semibold font-numbers" dir="ltr" data-testid="text-nationalid">
                    {user?.nationalId}
                  </p>
                </div>

                {user?.birthDate && (
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-sm text-muted-foreground mb-1">تاریخ تولد</p>
                    <p className="text-xl font-semibold" data-testid="text-birthdate">
                      {user.birthDate}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">کد معرف شما</p>
                  <p className="text-2xl font-bold font-mono text-primary" data-testid="text-referral-code">
                    {user?.referralCode}
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="mt-6">
          <Card className="border-2" data-testid="card-kyc">
            <CardHeader>
              <CardTitle className="text-2xl">احراز هویت</CardTitle>
              <CardDescription className="text-base">
                برای معامله و برداشت، احراز هویت الزامی است
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.isKycVerified ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
                  <h3 className="text-2xl font-bold text-green-600">احراز هویت تایید شده</h3>
                  <p className="text-muted-foreground">
                    حساب شما با موفقیت تایید شده است
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onKycSubmit)} className="space-y-6">
                    <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                      <p className="text-sm font-medium">اطلاعات ثبت شده</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">نام:</span>
                          <span className="mr-2 font-medium">{user?.firstName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">نام خانوادگی:</span>
                          <span className="mr-2 font-medium">{user?.lastName}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">کد ملی:</span>
                          <span className="mr-2 font-medium font-numbers" dir="ltr">
                            {user?.nationalId}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">شماره تلفن:</span>
                          <span className="mr-2 font-medium font-numbers" dir="ltr">
                            {user?.phoneNumber}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-destructive font-medium">
                        توجه: تمام اطلاعات باید به نام خودتان باشد
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            تاریخ تولد
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="h-14 text-lg"
                              data-testid="input-birthdate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankAccountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">شماره حساب بانکی (به نام خودتان)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="1234567890123456"
                              className="h-14 text-lg text-center font-numbers"
                              dir="ltr"
                              data-testid="input-bank-account"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankCardImage"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            عکس کارت بانکی
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <Input
                                {...field}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  onChange(e.target.files);
                                  handleImageChange(e);
                                }}
                                className="h-14 cursor-pointer"
                                data-testid="input-bank-card-image"
                              />
                              {imagePreview && (
                                <div className="relative rounded-xl overflow-hidden border-2">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-16 text-xl font-bold"
                      disabled={kycMutation.isPending}
                      data-testid="button-submit-kyc"
                    >
                      {kycMutation.isPending && <Loader2 className="ml-3 h-6 w-6 animate-spin" />}
                      <Shield className="ml-3 h-6 w-6" />
                      ارسال اطلاعات احراز هویت
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
