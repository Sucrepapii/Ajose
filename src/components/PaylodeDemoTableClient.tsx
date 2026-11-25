"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  CreditCard, 
  ArrowLeft, 
  RefreshCw,
  Copy,
  Check
} from "lucide-react";

declare global {
  interface Window {
    PaylodeCheckout?: {
      pay: (options: {
        key: string;
        email: string;
        amount: number; // in kobo
        reference?: string;
        currency?: string;
        metadata?: Record<string, unknown>;
        callbackUrl?: string;
        onSuccess?: (res: { reference: string; status: string }) => void;
        onFailed?: (res: { reference: string; status: string }) => void;
        onClose?: (res: { reference?: string; reason?: string }) => void;
        onError?: (err: { code: string; message: string }) => void;
      }) => { close: () => void } | null;
    };
  }
}

interface DemoSlot {
  slot: number;
  name: string;
  email?: string;
  paid: boolean;
  amount: number;
  paidAt?: string;
  reference?: string;
}

const INITIAL_SLOTS: DemoSlot[] = [
  { slot: 1, name: "Mayowa (Squad Leader)", email: "mayowa@gmail.com", paid: true, amount: 500, paidAt: "Ready" },
  { slot: 2, name: "Squad Member #2", paid: false, amount: 500 },
  { slot: 3, name: "Squad Member #3", paid: false, amount: 500 },
  { slot: 4, name: "Squad Member #4", paid: false, amount: 500 },
  { slot: 5, name: "Squad Member #5", paid: false, amount: 500 },
  { slot: 6, name: "Squad Member #6", paid: false, amount: 500 },
  { slot: 7, name: "Squad Member #7", paid: false, amount: 500 },
  { slot: 8, name: "Squad Member #8", paid: false, amount: 500 },
  { slot: 9, name: "Squad Member #9", paid: false, amount: 500 },
  { slot: 10, name: "Squad Member #10", paid: false, amount: 500 },
];

export function PaylodeDemoTableClient() {
  const [slots, setSlots] = useState<DemoSlot[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paylode_demo_slots");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 10) {
            return parsed;
          }
        } catch {}
      }
    }
    return INITIAL_SLOTS;
  });
  const [selectedSlot, setSelectedSlot] = useState<number>(2);
  const [testAmount, setTestAmount] = useState<number>(500); // ₦500
  const [name, setName] = useState("Tester Guest");
  const [email, setEmail] = useState("test@paylodeservices.com");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastLog, setLastLog] = useState<{
    stage: "idle" | "popup_open" | "success" | "failed" | "verified" | "error";
    message: string;
    data?: unknown;
    timestamp?: string;
  }>({
    stage: "idle",
    message: "Ready to test Paylode widget popup.",
  });
  const [copiedKey, setCopiedKey] = useState(false);

  const publicKey =
    process.env.NEXT_PUBLIC_PAYLODE_PUBLIC_KEY ||
    "pk_live_cbbb9e1706ce39beccfe1c2d536ab3fca92fd264184885d6";

  const saveSlots = (newSlots: DemoSlot[]) => {
    setSlots(newSlots);
    if (typeof window !== "undefined") {
      localStorage.setItem("paylode_demo_slots", JSON.stringify(newSlots));
    }
  };

  const resetDemo = () => {
    saveSlots(INITIAL_SLOTS);
    setSelectedSlot(2);
    setLastLog({
      stage: "idle",
      message: "Demo table reset back to initial 1 paid seat and 9 open slots.",
    });
    toast.success("Demo table reset.");
  };

  const handlePaylodePayment = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (testAmount <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    if (typeof window === "undefined" || !window.PaylodeCheckout) {
      toast.error("Paylode widget is still loading. Please check your connection and retry in 2 seconds.");
      return;
    }

    setIsProcessing(true);
    const amountKobo = Math.round(testAmount * 100);
    const customRef = `pld_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    setLastLog({
      stage: "popup_open",
      message: `Opening Paylode Checkout for ₦${testAmount.toLocaleString()} (${amountKobo} kobo)...`,
      data: { reference: customRef, email, amountKobo },
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      window.PaylodeCheckout.pay({
        key: publicKey,
        email: email.trim(),
        amount: amountKobo,
        reference: customRef,
        currency: "NGN",
        metadata: {
          tableId: "paylode-demo-table",
          slotNumber: selectedSlot,
          name: name.trim(),
        },
        onSuccess: async (res) => {
          setIsProcessing(false);
          toast.success(`Paylode payment successful! Reference: ${res.reference}`);
          setLastLog({
            stage: "success",
            message: `Paylode widget reported onSuccess! Now verifying on server with secret key...`,
            data: res,
            timestamp: new Date().toLocaleTimeString(),
          });

          // Mark slot as paid locally immediately
          const updated = slots.map((s) => {
            if (s.slot === selectedSlot) {
              return {
                ...s,
                name: `${name.trim()} (Paid via Paylode)`,
                email: email.trim(),
                paid: true,
                amount: testAmount,
                paidAt: new Date().toLocaleTimeString(),
                reference: res.reference,
              };
            }
            return s;
          });
          saveSlots(updated);

          // Verify with backend using PAYLODE_SECRET_KEY
          try {
            const verifyRes = await fetch(`/api/paylode/verify?reference=${encodeURIComponent(res.reference)}`);
            const verifyData = await verifyRes.json();
            setLastLog({
              stage: "verified",
              message: verifyData.success 
                ? `Payment 100% verified on server with PAYLODE_SECRET_KEY!` 
                : `Server check completed: ${verifyData.status || "Status checked"}`,
              data: verifyData,
              timestamp: new Date().toLocaleTimeString(),
            });
            if (verifyData.success) {
              toast.success("Transaction verified with Paylode server!");
            }
          } catch (err: unknown) {
            console.error("Server verify failed:", err);
          }
        },
        onFailed: (res) => {
          setIsProcessing(false);
          toast.error(`Paylode payment failed: ${res.status}`);
          setLastLog({
            stage: "failed",
            message: `Transaction failed or was cancelled by user.`,
            data: res,
            timestamp: new Date().toLocaleTimeString(),
          });
        },
        onClose: (res) => {
          setIsProcessing(false);
          setLastLog((prev) => ({
            ...prev,
            message: prev.stage === "success" || prev.stage === "verified"
              ? prev.message
              : `Paylode popup window was closed.`,
            data: res,
            timestamp: new Date().toLocaleTimeString(),
          }));
        },
        onError: (err) => {
          setIsProcessing(false);
          toast.error(`Paylode error [${err.code}]: ${err.message}`);
          setLastLog({
            stage: "error",
            message: `Paylode error: ${err.message} (${err.code})`,
            data: err,
            timestamp: new Date().toLocaleTimeString(),
          });
        },
      });
    } catch (e: unknown) {
      setIsProcessing(false);
      const errMsg = e instanceof Error ? e.message : "Could not launch Paylode checkout.";
      toast.error(errMsg);
      setLastLog({
        stage: "error",
        message: `Exception launching widget: ${errMsg}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const paidCount = slots.filter((s) => s.paid).length;
  const totalRaised = slots.reduce((acc, s) => acc + (s.paid ? s.amount : 0), 0);

  return (
    <>
      {/* Official Paylode Widget JS Script */}
      <Script 
        src="https://api.paylodeservices.com/api/v1/widget.js" 
        strategy="afterInteractive" 
        onLoad={() => console.log("[Paylode]: Widget script loaded successfully.")}
      />

      <div className="space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0B3022]/15">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Isolated Test Environment
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3022] font-serif">
              Paylode Checkout Live Demo Table
            </h1>
            <p className="text-xs text-[#0B3022]/70 mt-1">
              Test Paylode&apos;s new live public key and popup checkout widget without touching production tables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetDemo}
              className="px-3.5 py-2 rounded-xl border border-[#0B3022]/20 bg-white hover:bg-gray-50 text-[#0B3022] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
            <Link
              href="/admin/table-funds"
              className="px-4 py-2 rounded-xl bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Admin Desk</span>
            </Link>
          </div>
        </div>

        {/* Live Key Indicator */}
        <div className="p-4 rounded-2xl bg-white border border-[#0B3022]/15 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0B3022]">Paylode Gateway Active</span>
                <span className="text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Live Key Ready
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#0B3022]/60 truncate max-w-md">
                Public Key: {publicKey}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(publicKey);
              setCopiedKey(true);
              toast.success("Public key copied to clipboard!");
              setTimeout(() => setCopiedKey(false), 2000);
            }}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            <span>{copiedKey ? "Copied" : "Copy Key"}</span>
          </button>
        </div>

        {/* 2-Column Layout: Table Roster + Checkout Simulator */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: 10-Seat Table Roster */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#0B3022]/15 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-[#0B3022]/[0.06] text-[#0B3022] font-bold px-2 py-0.5 rounded-full">
                    Demo Table Fund
                  </span>
                  <h2 className="text-xl font-bold font-serif text-[#0B3022] mt-1">
                    Paylode Escrow Test Squad
                  </h2>
                  <p className="text-xs text-[#0B3022]/60">
                    The Owambe Party &bull; 10 Seats &bull; Live Paylode Checkout
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black font-mono text-[#D4A843]">
                    ₦{totalRaised.toLocaleString()} Collected
                  </div>
                  <div className="text-xs font-mono text-gray-500">
                    {paidCount} of 10 Seats Secured
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden my-4">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300" 
                  style={{ width: `${(paidCount / 10) * 100}%` }}
                />
              </div>

              {/* 10 Seats Grid */}
              <div className="space-y-2 mt-4">
                {slots.map((s) => {
                  const isSelected = selectedSlot === s.slot && !s.paid;
                  return (
                    <div
                      key={s.slot}
                      onClick={() => {
                        if (!s.paid) setSelectedSlot(s.slot);
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        s.paid
                          ? "bg-emerald-500/[0.04] border-emerald-500/25 cursor-default"
                          : isSelected
                          ? "bg-[#0B3022] text-[#F3EEE3] border-[#D4A843] shadow-md cursor-pointer"
                          : "bg-gray-50 hover:bg-white border-gray-200 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                          s.paid
                            ? "bg-emerald-600 text-white"
                            : isSelected
                            ? "bg-[#D4A843] text-[#0B3022]"
                            : "bg-gray-200 text-gray-700"
                        }`}>
                          {s.paid ? <CheckCircle2 className="w-4 h-4" /> : `#${s.slot}`}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-[#0B3022]"}`}>
                            {s.name}
                          </p>
                          <p className={`text-[10px] font-mono ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                            {s.paid ? `Paid ₦${s.amount.toLocaleString()} • ${s.paidAt || "Confirmed"}` : `Open Seat #${s.slot}`}
                            {s.reference && ` • Ref: ${s.reference}`}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {s.paid ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Secured
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4A843] text-[#0B3022]">
                            Selected
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                            Click to Test
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 3: Paylode Checkout Panel & Logger */}
          <div className="space-y-4">
            
            {/* Payment Trigger Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#0B3022]/15 shadow-md">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-[#D4A843]" />
                <h3 className="font-bold text-sm text-[#0B3022] font-serif">
                  Paylode Popup Trigger
                </h3>
              </div>

              <div className="space-y-3.5 pt-4">
                {/* Seat Selector Info */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-[#0B3022] block">
                    Paying for Seat #{selectedSlot}
                  </span>
                  <span className="text-[11px] text-[#0B3022]/70">
                    Click any open seat on the left to change target slot.
                  </span>
                </div>

                {/* Amount Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#0B3022] mb-1">
                    Test Amount (NGN)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTestAmount(amt)}
                        className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                          testAmount === amt
                            ? "border-[#0B3022] bg-[#0B3022] text-[#F3EEE3]"
                            : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                        }`}
                      >
                        ₦{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full mt-2 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
                    placeholder="Custom amount in NGN"
                  />
                  <span className="text-[10px] font-mono text-gray-400 block mt-1">
                    Paylode receives: {(testAmount * 100).toLocaleString()} kobo
                  </span>
                </div>

                {/* Name & Email inputs */}
                <div>
                  <label className="block text-xs font-bold text-[#0B3022] mb-1">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B3022] mb-1">
                    Receipt Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
                    placeholder="name@email.com"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePaylodePayment}
                  className="w-full py-3 px-4 rounded-xl bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Waiting for Paylode Window...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D4A843]" />
                      <span>Pay ₦{testAmount.toLocaleString()} with Paylode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Console Logger Card */}
            <div className="bg-[#0B3022] rounded-3xl p-5 text-white border border-[#D4A843]/30 shadow-md space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-[#D4A843] font-bold">Event & Response Monitor</span>
                <span className="text-[10px] text-white/50">{lastLog.timestamp || "Idle"}</span>
              </div>

              <div className="text-[11px] space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-white/40">Stage:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    lastLog.stage === "verified" || lastLog.stage === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : lastLog.stage === "failed" || lastLog.stage === "error"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-white/10 text-white/80"
                  }`}>
                    {lastLog.stage}
                  </span>
                </div>

                <div>
                  <span className="text-white/40 block mb-0.5">Message:</span>
                  <p className="text-white/90 text-xs leading-relaxed break-words">
                    {lastLog.message}
                  </p>
                </div>

                {Boolean(lastLog.data) && (
                  <div>
                    <span className="text-white/40 block mb-0.5">Payload Data:</span>
                    <pre className="p-2.5 rounded-lg bg-black/40 text-[10px] text-[#D4A843] overflow-x-auto max-h-40 whitespace-pre-wrap break-all">
                      {JSON.stringify(lastLog.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
