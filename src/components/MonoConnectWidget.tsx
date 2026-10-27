"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { 
  Landmark,
  Smartphone,
  QrCode,
  Copy,
  Check, 
  ShieldCheck, 
  Lock, 
  Building, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  Activity,
  AlertCircle,
  Sparkles,
  ExternalLink,
  X
} from "lucide-react";

export function MonoConnectWidget({ 
  userId, 
  isVerified: initialIsVerified,
  profile: initialProfile
}: { 
  userId: string;
  isVerified: boolean;
  profile?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    first_name?: string;
    last_name?: string;
    bvn_verified?: boolean;
    auto_sweep_enabled?: boolean;
    has_pin?: boolean;
    mono_mandate_id?: string;
    mono_mandate_status?: string;
    mono_mandate_url?: string;
  } | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState(initialProfile);
  const [isVerified, setIsVerified] = useState(initialIsVerified);

  const [mandateStatus, setMandateStatus] = useState<string>(
    initialProfile?.mono_mandate_status || "not_initiated"
  );
  const [mandateId, setMandateId] = useState<string>(
    initialProfile?.mono_mandate_id || ""
  );
  const [mandateUrl, setMandateUrl] = useState<string>(
    initialProfile?.mono_mandate_url || ""
  );
  const [isInitiatingMandate, setIsInitiatingMandate] = useState(false);
  const [isCheckingMandate, setIsCheckingMandate] = useState(false);

  useEffect(() => {
    setProfile(initialProfile);
    setIsVerified(initialIsVerified);
    if (initialProfile?.mono_mandate_status) {
      setMandateStatus(initialProfile.mono_mandate_status);
    }
    if (initialProfile?.mono_mandate_id) {
      setMandateId(initialProfile.mono_mandate_id);
    }
    if (initialProfile?.mono_mandate_url) {
      setMandateUrl(initialProfile.mono_mandate_url);
    }
  }, [initialProfile, initialIsVerified]);

  const handleAuthorizeMandate = async () => {
    setIsInitiatingMandate(true);
    const toastId = toast.loading("Connecting to Mono Mandate engine...");
    try {
      const res = await fetch("/api/mono/mandate/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate mandate");

      setMandateId(data.mandateId);
      setMandateUrl(data.monoUrl);
      setMandateStatus("awaiting_authorization");

      toast.success("Opening Mono hosted authorization window...", { id: toastId });

      window.open(data.monoUrl, "_blank", "width=600,height=750,location=no,toolbar=no");

      subscribeToMandateEvents(data.mandateId);
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate mandate", { id: toastId });
    } finally {
      setIsInitiatingMandate(false);
    }
  };

  const subscribeToMandateEvents = (mId: string) => {
    setIsCheckingMandate(true);

    const checkApprovalOnce = async () => {
      try {
        const res = await fetch(`/api/mono/mandate/status?mandateId=${encodeURIComponent(mId)}`);
        const data = await res.json();
        if (data.approved || data.readyToDebit) {
          cleanup();
          setIsCheckingMandate(false);
          setMandateStatus("approved");
          toast.success("🎉 NIBSS Direct Debit Mandate authorized successfully!", {
            duration: 6000
          });
          router.refresh();
          return true;
        }

        if (data.status === "cancelled" || data.status === "failed" || data.status === "expired") {
          cleanup();
          setIsCheckingMandate(false);
          setMandateId("");
          setMandateUrl("");
          setMandateStatus("not_initiated");
          toast.error("Bank authorization session was cancelled or expired. You can click 'Restart Authorization' to try again.", {
            duration: 6000
          });
          return true;
        }
      } catch (_) {}
      return false;
    };

    // 1. Subscribe to Mono Window postMessage events as they happen
    const handleWindowMessage = (event: MessageEvent) => {
      const type = event?.data?.type || event?.data?.event;
      if (
        type === "mono.connect.widget.account_linked" ||
        type === "mono.modal.closed" ||
        type === "mono.mandate.approved" ||
        type === "mono.mandate.authorized"
      ) {
        checkApprovalOnce();
      }
    };
    window.addEventListener("message", handleWindowMessage);

    // 2. Subscribe to Window / Tab Focus & Visibility events
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkApprovalOnce();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    // 3. Subscribe to Supabase Realtime notification events as they happen
    const channel = supabase
      .channel(`mandate-widget-${mId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload: any) => {
          const title = payload.new?.title?.toLowerCase() || "";
          if (title.includes("mandate") || title.includes("approved")) {
            await checkApprovalOnce();
          }
        }
      )
      .subscribe();

    const cleanup = () => {
      window.removeEventListener("message", handleWindowMessage);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      supabase.removeChannel(channel);
    };
  };

  const checkMandateNow = async () => {
    if (!mandateId) return;
    setIsCheckingMandate(true);
    const toastId = toast.loading("Checking NIBSS mandate status with Mono...");
    try {
      const res = await fetch(`/api/mono/mandate/status?mandateId=${encodeURIComponent(mandateId)}`);
      const data = await res.json();
      if (data.approved || data.readyToDebit) {
        setMandateStatus("approved");
        toast.success("✓ Mandate is ACTIVE and authorized for automated sweeps!", { id: toastId });
        router.refresh();
      } else if (data.status === "cancelled" || data.status === "failed" || data.status === "expired") {
        setMandateId("");
        setMandateUrl("");
        setMandateStatus("not_initiated");
        toast.error(`Session was ${data.status}. Click 'Restart Authorization' to generate a fresh link.`, { id: toastId, duration: 6000 });
      } else {
        toast.info(`Status: ${data.status || "Awaiting bank approval"}. Please complete authorization in Mono.`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Could not check mandate status", { id: toastId });
    } finally {
      setIsCheckingMandate(false);
    }
  };

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<"verify" | "set">("verify");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileVerifyUrl, setMobileVerifyUrl] = useState("https://ajose.ng/dashboard/verify");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMobileVerifyUrl(`${window.location.origin}/dashboard/verify`);
    }
  }, []);

  // Listen for real-time verification updates if user verifies on phone
  useEffect(() => {
    if (!userId || isVerified || userId === "demo-user") return;

    const channel = supabase
      .channel(`user-verify-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && payload.new.bvn_verified && payload.new.bank_name) {
            setProfile((prev) => ({
              ...prev,
              bank_name: payload.new.bank_name,
              account_number: payload.new.account_number,
              account_name: payload.new.account_name,
              bvn_verified: true,
            }));
            setIsVerified(true);
            toast.success("Bank account verified successfully from your mobile phone!", {
              id: "mobile-verified",
            });
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isVerified, supabase, router]);

  const launchMono = () => {
    const monoPublicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY || "live_pk_t1zbb1s1lakxunvxd82e";

    const initMono = () => {
      try {
        // Automatically ensure any injected Mono iframe has camera & media permissions
        if (typeof document !== "undefined") {
          const observer = new MutationObserver(() => {
            const iframes = document.querySelectorAll('iframe[src*="mono.co"], iframe[src*="withmono.com"]');
            iframes.forEach((iframe) => {
              const currentAllow = iframe.getAttribute("allow") || "";
              if (!currentAllow.includes("camera")) {
                iframe.setAttribute(
                  "allow",
                  "camera *; microphone *; autoplay *; clipboard-read; clipboard-write; fullscreen"
                );
              }
            });
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
        const monoInstance = new (window as any).Connect({
          key: monoPublicKey,
          onSuccess: async ({ code }: { code: string }) => {
            (window as any)._isMonoActive = false;
            toast.loading("Updating verified settlement account...", { id: "mono-linking" });
            try {
              const res = await fetch("/api/mono/exchange-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
              });
              const data = await res.json();
              if (res.ok) {
                setProfile(prev => ({
                  ...prev,
                  bank_name: data.bankName,
                  account_number: data.accountNumber,
                  account_name: data.accountName,
                  bvn_verified: true,
                  mono_mandate_id: undefined,
                  mono_mandate_status: "not_initiated",
                  mono_mandate_url: undefined
                }));
                setMandateId("");
                setMandateStatus("not_initiated");
                setMandateUrl("");
                setIsVerified(true);
                toast.success(`Connected ${data.bankName || "Bank"} (${data.accountNumber})! Please authorize your new direct debit mandate.`, { id: "mono-linking", duration: 6000 });
                router.refresh();
              } else {
                throw new Error(data.error || "Failed to link account");
              }
            } catch (err: any) {
              toast.error(err.message || "Failed to link bank account.", { id: "mono-linking" });
            }
          },
          onClose: () => {
            (window as any)._isMonoActive = false;
            console.log("Mono widget closed");
          },
          onEvent: (eventName: string, data: any) => {
            console.log("[Mono Event]", eventName, data);
            if (eventName === "OPENED") (window as any)._isMonoActive = true;
            if (eventName === "EXIT") (window as any)._isMonoActive = false;
            
            if (eventName === "ERROR" || eventName === "INSTITUTION_FAILED") {
              toast.error("Bank connection error. Check console for details.");
            }
          }
        });
        monoInstance.setup();
        monoInstance.open();
      } catch (err) {
        console.warn("Mono Connect initiation fallback:", err);
      }
    };

    if (typeof window !== "undefined") {
      if ((window as any).Connect) {
        initMono();
      } else {
        toast.loading("Loading secure banking partner...", { id: "mono-loading" });
        const script = document.createElement("script");
        script.src = "https://connect.mono.co/v2/connect.js";
        script.onload = () => {
          toast.dismiss("mono-loading");
          initMono();
        };
        script.onerror = () => {
          toast.dismiss("mono-loading");
          toast.error("Failed to load banking module. Please check your internet connection.");
        };
        document.body.appendChild(script);
      }
    }
  };

  const handleMonoConnectClick = () => {
    setPin("");
    setConfirmPin("");
    if (profile?.has_pin) {
      setPinModalMode("verify");
    } else {
      setPinModalMode("set");
    }
    setIsPinModalOpen(true);
  };

  const verifyPinAndLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 4) return;
    
    if (pinModalMode === "set") {
      if (!confirmPin || confirmPin.length !== 4) {
        toast.error("Please confirm your PIN.");
        return;
      }
      if (pin !== confirmPin) {
        toast.error("PINs do not match. Please verify.");
        return;
      }
    }

    setIsVerifyingPin(true);
    try {
      const payload = pinModalMode === "set" 
        ? { action: "set", pin, confirmPin }
        : { action: "verify", pin };

      const res = await fetch("/api/user/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || `PIN ${pinModalMode === "set" ? "creation" : "verification"} failed`);
      
      if (pinModalMode === "set") {
        toast.success("Transaction Security PIN created successfully!");
      }

      setIsPinModalOpen(false);
      setPin("");
      setConfirmPin("");
      launchMono();
    } catch (err: any) {
      toast.error(err.message || (pinModalMode === "set" ? "Failed to set PIN" : "Incorrect PIN"));
    } finally {
      setIsVerifyingPin(false);
    }
  };

  return (
    <>
      {isVerified ? (
        /* Unified Verified State: Official Settlement Account & Mandate Card */
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-md animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0B3022] shrink-0">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0B3022]">Verified Settlement Bank Account</h3>
                <p className="text-xs text-[#1F2937]/70 font-medium">
                  Official account for receiving rotational pool payouts and automated contribution debits.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mandateStatus === "approved" ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" /> Mandate Active
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 whitespace-nowrap">
                  <AlertCircle className="h-4 w-4 text-amber-700" /> Mandate Pending
                </span>
              )}
              <span className="text-[10px] font-mono font-bold text-zinc-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                MONO SECURED
              </span>
            </div>
          </div>

          {/* Account Details Grid */}
          <div className="bg-[#FDFBF7] p-5 rounded-xl border border-gray-200/90 space-y-3.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-[#1F2937]/70 font-medium">Verified Settlement Bank</span>
              <span className="font-bold text-[#0B3022] text-sm">{profile?.bank_name || "Commercial Bank"}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-[#1F2937]/70 font-medium">10-Digit NUBAN Account Number</span>
              <span className="font-mono font-bold text-emerald-700 text-sm tracking-wider">
                {profile?.account_number || "••••••••••"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-[#1F2937]/70 font-medium">Verified Account Name</span>
              <span className="font-bold text-[#1F2937] text-sm">
                {profile?.account_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || "Verified Saver"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-[#1F2937]/70 font-medium">Identity &amp; BVN Verification</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Verified via Mono Open-Banking
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#1F2937]/70 font-medium">DirectPay Auto-Debit Mandate</span>
              {mandateStatus === "approved" ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Authorized via NIBSS e-Mandate
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Awaiting Bank Authorization
                </span>
              )}
            </div>
          </div>

          {/* Mandate Authorization Banner */}
          {mandateStatus !== "approved" && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-[#0B3022]">
                    {mandateId ? "Finish Bank Mandate Authorization" : "Authorize Live Direct Debit Mandate"}
                  </h4>
                </div>
                <p className="text-xs text-[#1F2937]/80 leading-relaxed font-medium">
                  {mandateId 
                    ? "Your mandate was initiated on Mono. Click below to open the bank authorization screen or check verification status."
                    : "Authorize automated contribution sweeps from this verified bank account so your circle payments process without manual transfer delays."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {mandateUrl && (
                  <a
                    href={mandateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Authorize on Mono</span>
                  </a>
                )}

                {mandateId ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={checkMandateNow}
                      disabled={isCheckingMandate}
                      className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-[#0B3022] font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 text-[#C5A059] ${isCheckingMandate ? "animate-spin" : ""}`} />
                      <span>{isCheckingMandate ? "Verifying..." : "Check Status"}</span>
                    </button>
                    <button
                      onClick={handleAuthorizeMandate}
                      disabled={isInitiatingMandate}
                      className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Generate a brand new authorization link if previous link was cancelled or expired"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 text-amber-700 ${isInitiatingMandate ? "animate-spin" : ""}`} />
                      <span>{isInitiatingMandate ? "Generating..." : "Restart Authorization"}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAuthorizeMandate}
                    disabled={isInitiatingMandate}
                    className="px-5 py-3 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isInitiatingMandate ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-[#C5A059]" />
                        <span>Connecting to Mono...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
                        <span>Authorize Mandate</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions & Re-verification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="space-y-0.5 max-w-md">
              <p className="text-xs font-bold text-[#0B3022]">Need to change your settlement bank account?</p>
              <p className="text-[11px] text-[#1F2937]/70 font-medium leading-relaxed">
                Your settlement bank is strictly tied to your verified identity. If you want to change it, you must re-verify your identity with your new bank via Mono.
              </p>
            </div>

            <button 
              onClick={handleMonoConnectClick}
              className="px-5 py-3 bg-[#0B3022] hover:bg-[#0B3022]/90 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#C5A059]" />
              Re-verify &amp; Change Bank
            </button>
          </div>
        </div>
      ) : (
        /* Unified Pending State: Link Bank Account & Activate Settlement */
        <div className="bg-white border border-[#C5A059]/40 rounded-2xl p-6 sm:p-7 space-y-6 shadow-md animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0B3022]">Link Bank &amp; Activate Settlement Account</h3>
                <p className="text-xs text-[#1F2937]/70 font-medium">
                  Establish your verified settlement account and direct debit mandate via Mono Open-Banking.
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 whitespace-nowrap">
                <AlertCircle className="h-4 w-4" /> Pending Connection
              </span>
            </div>
          </div>

          <div className="bg-[#FDFBF7] p-5 rounded-xl border border-gray-200 text-xs text-[#1F2937] space-y-3 font-medium">
            <p className="font-bold text-[#0B3022] text-sm">Why linking your bank account is required:</p>
            <ul className="space-y-2 text-[#1F2937]/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Instant BVN verification and identity matching without paperwork.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>This account becomes your verified settlement destination for all rotational payouts.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Automated direct debit sweeps ensure you never miss your contribution turn.</span>
              </li>
            </ul>
          </div>

          {/* Mobile QR Verification Card (Recommended for Laptops & Desktops) */}
          <div className="bg-[#0B3022] text-white p-5 sm:p-6 rounded-2xl border border-[#C5A059]/40 shadow-lg flex flex-col md:flex-row items-center gap-5">
            <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-md flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=6&data=${encodeURIComponent(mobileVerifyUrl)}`}
                alt="Scan to verify on mobile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg"
              />
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[11px] font-bold uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Recommended: Finish on Mobile</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Scan with your phone camera for instant verification
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Laptop webcams often fail lighting or permission checks. Scan this QR code with your phone to use your front camera — takes under 15 seconds and automatically updates this screen!
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(mobileVerifyUrl);
                    setCopiedLink(true);
                    toast.success("Verification link copied to clipboard!");
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Link Copied!" : "Copy Mobile Link"}</span>
                </button>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-syncs live with this screen
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1 max-w-sm">
              <div className="flex items-center gap-2 text-xs text-[#1F2937]/70 font-medium">
                <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Protected by bank-level 256-bit encryption.</span>
              </div>
              <p className="text-[11px] text-[#1F2937]/60">
                Prefer to stay on laptop? Make sure to click <strong>&quot;Allow&quot;</strong> when your browser prompts for Camera access.
              </p>
            </div>

            <button 
              onClick={handleMonoConnectClick}
              className="px-6 py-3.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 text-sm"
            >
              <Lock className="h-4 w-4" />
              Link on this Device
            </button>
          </div>
        </div>
      )}



      {isPinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[#0B3022]">
                <Lock className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-sm">Security Verification</h3>
              </div>
              <button 
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPin("");
                  setConfirmPin("");
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={verifyPinAndLaunch} className="p-6 bg-[#FDFBF7]">
              <p className="text-gray-500 text-xs mb-6 text-center font-medium">
                {pinModalMode === "verify" 
                  ? "Please enter your 4-digit Transaction Security PIN to authorize bank linkage."
                  : "For security, please create a 4-digit Transaction PIN to protect your settlement account."}
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  {pinModalMode === "set" && <label className="block text-xs font-bold text-gray-700 mb-1.5 text-center">Enter New PIN</label>}
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[1em] text-3xl font-bold bg-white border border-gray-300 focus:border-[#0B3022] focus:ring-1 focus:ring-[#0B3022] rounded-xl py-4 text-[#1F2937] outline-none transition-all"
                    placeholder="••••"
                    autoFocus
                    required
                  />
                </div>
                
                {pinModalMode === "set" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 text-center">Confirm New PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center tracking-[1em] text-3xl font-bold bg-white border border-gray-300 focus:border-[#0B3022] focus:ring-1 focus:ring-[#0B3022] rounded-xl py-4 text-[#1F2937] outline-none transition-all"
                      placeholder="••••"
                      required
                    />
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isVerifyingPin || pin.length !== 4 || (pinModalMode === "set" && confirmPin.length !== 4)}
                className="w-full bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-md"
              >
                {isVerifyingPin ? (
                  <div className="w-5 h-5 border-2 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin"></div>
                ) : (
                  pinModalMode === "verify" ? "Verify & Continue" : "Create PIN & Continue"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
