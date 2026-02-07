"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PhoneVerificationProps {
  isVerified: boolean;
}

type Step = "phone" | "code" | "done";

export function PhoneVerification({ isVerified }: PhoneVerificationProps) {
  const [step, setStep] = useState<Step>(isVerified ? "done" : "phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/phone/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to send code");
    } else {
      setStep("code");
    }
    setLoading(false);
  }

  async function handleVerifyCode() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/phone/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Verification failed");
    } else {
      setStep("done");
    }
    setLoading(false);
  }

  if (step === "done") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <svg
          className="h-4 w-4 text-offer"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="m9 11 3 3L22 4" />
        </svg>
        <span className="text-offer font-medium">Phone verified</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {step === "phone" && (
        <>
          <div className="flex gap-2">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15551234567"
              className="flex-1"
            />
            <Button
              onClick={handleSendCode}
              disabled={loading || !phone}
            >
              {loading ? "Sending..." : "Send Code"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your phone number in international format (e.g., +1 for US).
          </p>
        </>
      )}

      {step === "code" && (
        <>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to {phone}
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="flex-1 tracking-widest text-center"
            />
            <Button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => { setStep("phone"); setCode(""); }}
            className="text-xs text-primary hover:underline"
          >
            Use a different number
          </button>
        </>
      )}
    </div>
  );
}
