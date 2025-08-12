"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageSquare, Phone, ArrowLeft, Send, Clock, CheckCircle } from "lucide-react";
import Silk from "@/components/Silk/Silk";
import { useLanguage } from "@/lib/language";
import { LangToggle } from "@/components/LangToggle";

export default function VerifySMSPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const formSchema = z.object({
    code: z.string().min(4, { message: t("codeMustBe4Digits") }),
  });
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [isResending, setIsResending] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    // Get phone number from localStorage
    const storedPhone = localStorage.getItem("signupPhoneNumber");
    if (!storedPhone) {
      setError(t("phoneNumberMissing"));
      return;
    }
    setPhoneNumber(storedPhone);

    // Check if there's an existing resend cooldown
    const lastResendTime = localStorage.getItem('lastSmsResendTime');
    if (lastResendTime) {
      const timeDiff = Math.max(0, 60 - Math.floor((Date.now() - parseInt(lastResendTime)) / 1000));
      if (timeDiff > 0) {
        setResendCountdown(timeDiff);
      }
    }
  }, [t]);

  // Resend countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!phoneNumber) {
      setError(t("phoneNumberMissing"));
      router.push("/sign-up");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code: values.code }),
      });
      
      if (res.ok) {
        toast.success(t("verificationSuccessful"));
        router.push("/profile-setup");
      } else {
        setError(t("invalidOrExpiredCode"));
      }
    } catch (error) {
      setError(t("verificationError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendSMS = async () => {
    if (resendCountdown > 0) {
      toast.error(t("pleaseWaitBeforeResending"));
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch("/api/auth/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        toast.error(data.error || t("failedToSendSms"));
        return;
      }

      if (data?.devCode) {
        try { localStorage.setItem('devSmsCode', data.devCode); } catch (_) {}
      }

      // Set resend cooldown
      setResendCountdown(60);
      localStorage.setItem('lastSmsResendTime', Date.now().toString());
      
      toast.success(t("newSmsCodeSent"));
    } catch (error) {
      toast.error(t("couldNotSendSms"));
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToVerification = () => {
    router.push("/verify");
  };

  return (
    <div className="w-[100%] min-h-screen flex items-start justify-center">
      <div className="w-full h-full">
        {/* Main Content - 60/40 Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-center h-screen">
          {/* Left Column - 60% - Friendly Messages & Content */}
          <div className="w-full h-full lg:w-[60%] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 rounded-r-3xl overflow-hidden">
              <Silk 
                speed={3} 
                scale={0.5} 
                color="#29ADFF" 
                noiseIntensity={1.6} 
                rotation={-0.05}
              />
            </div>         
            <div className="flex flex-col justify-end pb-6 relative p-8 lg:p-12 rounded-r-3xl bg-white/10 border border-white/20 shadow-2xl z-10 h-full">
             
              <div className="relative z-10 text-center lg:text-left">
                <div className="mb-8">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 shadow-lg">
                      <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {t("smsVerification")}
                  </h1>
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    {t("enterVerificationCode")}
                  </p>
                </div>

                {/* Benefits Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-blue-400/30">
                      <Phone className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t("codeSentToPhone")}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-purple-400/30">
                      <CheckCircle className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t("quickAndSecure")}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-blue-400/30">
                      <Clock className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t("expiresIn10Minutes")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 40% - Verification Form */}
          <div className="w-full h-full flex justify-center items-center lg:w-[40%] pr-6">
            <Card className="w-full flex flex-col justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t("enterVerificationCode")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("sentTo")} {phoneNumber}
                  </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Input
                      {...form.register("code")}
                      className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t("enterCode")}
                      autoFocus
                    />
                    {form.formState.errors.code && (
                      <p className="text-red-500 text-sm mt-2 text-center">
                        {form.formState.errors.code.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-300 text-center">
                        {error}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t("verifying")}
                      </>
                    ) : (
                      <>
                        {t("verifyCode")} <CheckCircle className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Resend SMS Section */}
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {t("didntReceiveCode")}
                    </p>
                    
                    <Button
                      onClick={handleResendSMS}
                      disabled={resendCountdown > 0 || isResending}
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                    >
                      {isResending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          {t("sending")}
                        </>
                      ) : resendCountdown > 0 ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          {t("wait")} {resendCountdown}s
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t("resendCode")}
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={handleBackToVerification}
                    variant="ghost"
                    className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("backToVerification")}
                  </Button>
                </div>

                {/* Language Toggle */}
                <div className="mt-6 flex justify-center">
                  <LangToggle />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 