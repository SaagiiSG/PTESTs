"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
  code: z.string().min(4, { message: "Code must be at least 4 digits." }),
});

export default function VerifySMSPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const phoneNumber = localStorage.getItem("signupPhoneNumber");
    if (!phoneNumber) {
      setError("Phone number missing. Please sign up again.");
      router.push("/sign-up");
      return;
    }
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, code: values.code }),
    });
    if (res.ok) {
      router.push("/profile-setup");
    } else {
      setError("Invalid or expired code. Please try again.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center h-screen">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-1/3">
        <div>
          <label>Enter the code sent to your phone</label>
          <Input {...form.register("code")} placeholder="Verification code" />
          {form.formState.errors.code && <p>{form.formState.errors.code.message}</p>}
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit">Verify</Button>
      </form>
    </div>
  );
} 