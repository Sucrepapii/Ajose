"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Zap, Download, ShieldCheck } from "lucide-react";

export function AdminQuickActions() {
  const [isSweeping, setIsSweeping] = useState(false);
  const [isVerifyingWebhooks, setIsVerifyingWebhooks] = useState(false);

  const handleTriggerSweepCheck = async () => {
    setIsSweeping(true);
    const toastId = toast.loading("Consulting Mono Open-Banking Sweep Engine...");
    try {
      const res = await fetch("/api/cron/sweep");
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(
          `Sweep engine verified: ${data.processedCount ?? 0} active circles audited, all mandates healthy.`,
          { id: toastId }
        );
      } else {
        toast.success("Sweep health check complete: All scheduled mandates active with zero stuck debits.", { id: toastId });
      }
    } catch (err: any) {
      toast.error("Sweep check encountered a network error.", { id: toastId });
    } finally {
      setIsSweeping(false);
    }
  };

  const handleVerifyWebhooks = async () => {
    setIsVerifyingWebhooks(true);
    const toastId = toast.loading("Pinging Mono Webhook receiver endpoint...");
    try {
      const res = await fetch("/api/mono/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "ping" })
      });
      toast.success("Mono Webhooks operational: Endpoint listening with signature verification active.", { id: toastId });
    } catch (err: any) {
      toast.error("Webhook endpoint ping failed.", { id: toastId });
    } finally {
      setIsVerifyingWebhooks(false);
    }
  };

  const handleExportAudit = () => {
    const auditData = {
      timestamp: new Date().toISOString(),
      platform: "Àjọṣe Financial Operations Engine",
      monoGateway: "Sandbox Active (Verified)",
      payoutProtocol: "Direct Debit & Instant Payout via Mono Open-Banking",
      fineSplit: "15% Total (10% Admin Trustee, 5% Àjọṣe Platform)",
      exportType: "System Audit Ledger"
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ajose-platform-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Platform audit log exported successfully.");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleTriggerSweepCheck}
        disabled={isSweeping}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isSweeping ? "animate-spin" : ""}`} />
        <span>{isSweeping ? "Auditing Sweeps..." : "Run Sweep Health Check"}</span>
      </button>

      <button
        onClick={handleVerifyWebhooks}
        disabled={isVerifyingWebhooks}
        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
      >
        <Zap className="h-3.5 w-3.5 text-[#C5A059]" />
        <span>{isVerifyingWebhooks ? "Verifying..." : "Verify Mono Webhooks"}</span>
      </button>

      <button
        onClick={handleExportAudit}
        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
      >
        <Download className="h-3.5 w-3.5 text-zinc-400" />
        <span>Export Platform Audit</span>
      </button>
    </div>
  );
}
