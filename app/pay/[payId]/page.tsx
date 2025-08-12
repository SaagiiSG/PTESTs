"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PayPage({ params }: { params: { payId: string } }) {
  const [paid, setPaid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const handleTogglePaid = () => {
    setPaid((prev) => !prev);
  };

  const handleContinue = async () => {
    if (paid) {
      toast.success("Payment successful!");
      let url = returnTo;
      // Extract testId from returnTo if possible
      let testId = null;
      const testMatch = url.match(/\/ptests\/(\w+)/);
      if (testMatch) {
        testId = testMatch[1];
      }
      if (testId) {
        try {
          await fetch(`/api/tests/${testId}/taken`, { method: 'POST' });
        } catch (e) {
          console.error('Error recording test taken:', e);
        }
        // Record the test purchase
        try {
          const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testId }),
          });
          if (!response.ok) {
            console.error('Test purchase failed:', await response.text());
          } else {
            console.log('Test purchase successful');
          }
        } catch (e) {
          console.error('Error recording test purchase:', e);
        }
      }
      // If returnTo is a course, rewrite to capital C
      const courseMatch = url.match(/\/course\/(\w+)/);
      if (courseMatch) {
        url = url.replace('/course/', '/Course/');
        // Record the course purchase
        try {
          const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId: params.payId }),
          });
          if (!response.ok) {
            console.error('Course purchase failed:', await response.text());
          } else {
            console.log('Course purchase successful');
          }
        } catch (e) {
          console.error('Error recording course purchase:', e);
        }
      }
      if (!url.includes('paid=1')) {
        url += (url.includes('?') ? '&' : '?') + 'paid=1';
      }
      router.push(url);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Temporary Payment Page</h1>
        <p className="mb-4">Payment status: <span className={paid ? "text-green-600" : "text-red-600"}>{paid ? "Paid" : "Not Paid"}</span></p>
        <Button onClick={handleTogglePaid} className="inline-flex items-center justify-center mb-4">
          <span className="font-semibold">{paid ? "Mark as Not Paid" : "Mark as Paid"}</span>
        </Button>
        <Button onClick={handleContinue} disabled={!paid} className="inline-flex items-center justify-center ml-2">
          <span className="font-semibold">Continue</span>
        </Button>
      </div>
    </div>
  );
}
