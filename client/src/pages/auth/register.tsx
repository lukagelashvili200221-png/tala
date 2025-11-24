import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smartphone, Shield } from "lucide-react";
import goldPattern from "@assets/generated_images/gold_pattern_mobile_background.png";

const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/, "شماره تلفن باید با 09 شروع شود و 11 رقم باشد"),
});

const otpSchema = z.object({
  code: z.string().length(4, "کد باید 4 رقم باشد"),
});

const profileSchema = z.object({
  firstName: z.string().min(2, "نام باید حداقل 2 حرف باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل 2 حرف باشد"),
  nationalId: z.string().regex(/^\d{10}$/, "کد ملی باید 10 رقم باشد"),
  referralCode: z.string().optional(),
});

export default function Register() {
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", nationalId: "", referralCode: "" },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof phoneSchema>) => {
      return await apiRequest("POST", "/api/auth/send-otp", data);
    },
    onSuccess: () => {
      toast({
        title: "کد ارسال شد",
        description: "کد تایید به شماره شما ارسال گردید",
      });
      setStep("otp");
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "ارسال کد با خطا مواجه شد",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof otpSchema>) => {
      return await apiRequest("POST", "/api/auth/verify-otp", {
        phoneNumber,
        code: data.code,
      });
    },
    onSuccess: () => {
      toast({
        title: "تایید شد",
        description: "شماره تلفن شما با موفقیت تایید شد",
      });
      setStep("profile");
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "کد وارد شده صحیح نیست",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      return await apiRequest("POST", "/api/auth/register", {
        phoneNumber,
        ...data,
      });
    },
    onSuccess: (data: any) => {
      localStorage.setItem("userId", data.userId);
      toast({
        title: "خوش آمدید!",
        description: "ثبت نام شما با موفقیت انجام شد",
      });
      setLocation("/lucky-wheel");
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "ثبت نام با خطا مواجه شد",
        variant: "destructive",
      });
    },
  });

  const onPhoneSubmit = (data: z.infer<typeof phoneSchema>) => {
    setPhoneNumber(data.phoneNumber);
    sendOtpMutation.mutate(data);
  };

  const onOtpSubmit = (data: z.infer<typeof otpSchema>) => {
    verifyOtpMutation.mutate(data);
  };

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-primary/5"
      style={{
        backgroundImage: `url(${goldPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      <Card className="w-full max-w-md border-2 shadow-xl" data-testid="card-register">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            {step === "phone" && <Smartphone className="w-8 h-8 text-primary" />}
            {step === "otp" && <Shield className="w-8 h-8 text-primary" />}
            {step === "profile" && <Shield className="w-8 h-8 text-primary" />}
          </div>
          <CardTitle className="text-3xl font-display font-bold">
            {step === "phone" && "ورود / ثبت نام"}
            {step === "otp" && "تایید شماره تلفن"}
            {step === "profile" && "تکمیل اطلاعات"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === "phone" && "لطفاً شماره تلفن خود را وارد کنید"}
            {step === "otp" && "کد 4 رقمی ارسال شده را وارد نمایید"}
            {step === "profile" && "اطلاعات شما باید دقیق و به نام خودتان باشد"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شماره تلفن</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="09123456789"
                          className="h-14 text-lg text-center font-numbers"
                          data-testid="input-phone"
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg transition-all"
                  disabled={sendOtpMutation.isPending}
                  data-testid="button-send-otp"
                >
                  {sendOtpMutation.isPending && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                  ارسال کد تایید
                </Button>
              </form>
            </Form>
          )}

          {step === "otp" && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <FormField
                  control={otpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-center block">کد تایید</FormLabel>
                      <FormControl>
                        <div className="flex justify-center" dir="ltr">
                          <InputOTP maxLength={4} {...field} data-testid="input-otp">
                            <InputOTPGroup>
                              <InputOTPSlot index={0} className="w-16 h-16 text-2xl" />
                              <InputOTPSlot index={1} className="w-16 h-16 text-2xl" />
                              <InputOTPSlot index={2} className="w-16 h-16 text-2xl" />
                              <InputOTPSlot index={3} className="w-16 h-16 text-2xl" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg transition-all"
                    disabled={verifyOtpMutation.isPending}
                    data-testid="button-verify-otp"
                  >
                    {verifyOtpMutation.isPending && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                    تایید کد
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep("phone")}
                    data-testid="button-back-to-phone"
                  >
                    بازگشت
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === "profile" && (
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="محمد" className="h-12" data-testid="input-firstname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام خانوادگی</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="احمدی" className="h-12" data-testid="input-lastname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کد ملی (به نام خودتان)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="1234567890"
                          className="h-12 text-center font-numbers"
                          dir="ltr"
                          data-testid="input-nationalid"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کد معرف (اختیاری)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="اگر کد معرف دارید وارد کنید"
                          className="h-12 text-center font-mono"
                          dir="ltr"
                          data-testid="input-referral-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg transition-all"
                  disabled={registerMutation.isPending}
                  data-testid="button-register"
                >
                  {registerMutation.isPending && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                  ثبت نام
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
