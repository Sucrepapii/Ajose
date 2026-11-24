"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle,
  PartyPopper,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  X,
  Trash2,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { isOwambeExpired, isOwambeDeadlinePassed, STANDARD_DEMO_TABLES } from "@/utils/owambeConfig";

interface MemberSlot {
  slot: number;
  name: string;
  email?: string;
  phone?: string;
  paid: boolean;
  amount: number;
  paidAt?: string;
}

interface TableFundState {
  id: string;
  event: string;
  venue: string;
  eventDate: string;
  deadline: string;
  tier: "silver" | "gold";
  tableName: string;
  tablePrice: number;
  totalTargetWithFees: number;
  memberCount: number;
  perMemberTotal: number;
  perMemberShare: number;
  perMemberFee: number;
  squadName: string;
  leaderName: string;
  leaderEmail?: string;
  leaderPhone: string;
  contributions: MemberSlot[];
}

export function TableFundTrackerClient({ fundId }: { fundId: string }) {
  const router = useRouter();
  const [fund, setFund] = useState<TableFundState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payingSlot, setPayingSlot] = useState<number | null>(null);
  const [payingName, setPayingName] = useState("");
  const [payingEmail, setPayingEmail] = useState("");
  const [payingPhone, setPayingPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // In-app double opt-in confirmation states
  const [deleteTableModalOpen, setDeleteTableModalOpen] = useState(false);
  const [removeMemberSlot, setRemoveMemberSlot] = useState<MemberSlot | null>(null);

  const expired = isOwambeExpired();
  const deadlinePassed = isOwambeDeadlinePassed();

  useEffect(() => {
    // 1. Check localStorage for user-created or user-modified tables
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`table_fund_${fundId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) {
            setFund(parsed);
            // Sync from cloud database in background for multi-device squad updates
            fetch(`/api/owambe/table?id=${encodeURIComponent(fundId)}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.table) {
                  setFund(d.table);
                  localStorage.setItem(`table_fund_${fundId}`, JSON.stringify(d.table));
                }
              })
              .catch(() => {});
            return;
          }
        } catch (_) {}
      }
    }

    // 2. Check standard registered tables
    const demoFound = STANDARD_DEMO_TABLES.find(
      (t) =>
        t.id.toLowerCase() === fundId.toLowerCase() ||
        (t.id === "test-500" &&
          (fundId.toLowerCase() === "test-table" ||
            fundId.toLowerCase() === "test" ||
            fundId.toLowerCase() === "500"))
    );
    if (demoFound) {
      setFund(demoFound as TableFundState);
      return;
    }

    // 3. Query Cloud Database via API for tables created on other devices / shared via WhatsApp
    fetch(`/api/owambe/table?id=${encodeURIComponent(fundId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.table) {
          setFund(data.table);
          if (typeof window !== "undefined") {
            localStorage.setItem(`table_fund_${fundId}`, JSON.stringify(data.table));
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      });
  }, [fundId]);

  // Handle returning from Mono payment redirect with real server-side verification
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const paidSlotStr = urlParams.get("slot");
    const paidName = urlParams.get("name");
    const paidEmail = urlParams.get("email");
    const paidPhone = urlParams.get("phone");
    const ref = urlParams.get("ref");

    if (paymentStatus === "success" && paidSlotStr && ref) {
      const slotNum = parseInt(paidSlotStr, 10);
      const toastId = toast.loading("Verifying transaction with your bank...", { id: `verify-${ref}` });

      fetch(`/api/owambe/verify?reference=${encodeURIComponent(ref)}`)
        .then((res) => res.json())
        .then((verification) => {
          // If transaction is still pending, DO NOT mark as paid!
          if (verification.status === "pending") {
            toast.info(
              "Your transaction is still pending bank clearance. Your seat will be confirmed once cleared.",
              { id: toastId, duration: 8000 }
            );
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }

          if (!verification.verified || verification.status !== "successful") {
            toast.error(
              verification.message || "Payment could not be verified by your bank. Your seat remains open.",
              { id: toastId, duration: 7000 }
            );
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }

          // Verified successful on Mono!
          let currentFund = fund;
          if (!currentFund) {
            const stored = localStorage.getItem(`table_fund_${fundId}`);
            if (stored) {
              try {
                currentFund = JSON.parse(stored);
              } catch (_) {}
            }
            if (!currentFund) {
              currentFund = (STANDARD_DEMO_TABLES.find(
                (t) => t.id.toLowerCase() === fundId.toLowerCase()
              ) as TableFundState) || null;
            }
          }

          if (currentFund) {
            const formattedTimestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
            const updatedContributions = currentFund.contributions.map((c) => {
              if (c.slot === slotNum) {
                return {
                  ...c,
                  name: paidName ? decodeURIComponent(paidName) : c.name,
                  email: paidEmail ? decodeURIComponent(paidEmail) : c.email,
                  phone: paidPhone ? decodeURIComponent(paidPhone) : c.phone,
                  paid: true,
                  paidAt: formattedTimestamp,
                };
              }
              return c;
            });

            const updatedFund = {
              ...currentFund,
              contributions: updatedContributions,
            };

            setFund(updatedFund);
            localStorage.setItem(`table_fund_${currentFund.id}`, JSON.stringify(updatedFund));
            // Sync to cloud database for all squad members
            fetch("/api/owambe/table", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedFund),
            }).catch(() => {});
            toast.success(`Payment verified via ${verification.bankName || "Bank"}! Your seat is secured.`, {
              id: toastId,
              duration: 6000,
            });
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch((err) => {
          console.error("Verification network error:", err);
          toast.error("Failed to verify transaction. Please refresh or check your bank app.", {
            id: toastId,
            duration: 6000,
          });
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, [fundId, fund]);

  if (notFound) {
    return (
      <div className="w-full max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-[#0B3022]/15 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              Table Not Registered
            </span>
            <h2 className="text-2xl font-bold font-serif text-[#0B3022]">Squad Table Not Found</h2>
            <p className="text-xs text-[#0B3022]/70 mt-2 leading-relaxed">
              No active Squad Table was found registered with ID or query:
            </p>
            <div className="mt-2 inline-block px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 font-mono text-xs font-bold text-[#0B3022] break-all">
              {fundId}
            </div>
          </div>

          <div className="bg-[#FAF7F0] border border-[#0B3022]/10 rounded-2xl p-4 text-left text-xs text-[#0B3022]/80 space-y-2">
            <p className="font-bold text-[#0B3022]">Why am I seeing this?</p>
            <ul className="list-disc pl-4 space-y-1 text-[#0B3022]/70">
              <li>The squad leader has not registered this table yet.</li>
              <li>The phone number or table link was mistyped.</li>
              <li>The table may have been canceled or deleted by the squad leader.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/owambe"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4A843] via-[#E5B84B] to-[#C29532] text-[#0B3022] font-bold text-xs uppercase tracking-wider text-center shadow-sm hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Table Search</span>
            </Link>
            <Link
              href="/"
              className="py-3 px-4 rounded-xl bg-white border border-[#0B3022]/20 text-[#0B3022] font-semibold text-xs hover:bg-gray-50 transition-colors text-center"
            >
              Ajose Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#0B3022] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm font-mono text-[#0B3022]/70">Loading Table Fund details...</p>
      </div>
    );
  }

  const paidMembers = fund.contributions.filter((c) => c.paid);
  const paidCount = paidMembers.length;
  const currentTotal = paidCount * fund.perMemberTotal;
  const progressPct = Math.round((paidCount / fund.memberCount) * 100);
  const isComplete = paidCount === fund.memberCount;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://ajose.ng/table/${fundId}`;

  const shareText = `Hey! We're splitting a ${fund.tableName} for The Owambe Party (Wazobia Extravaganza on Dec 20). Our share is ₦${fund.perMemberTotal.toLocaleString()} each before Dec 10. Pay your share here so our table is locked: ${currentUrl}`;

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handlePayShare = async (slotNumber: number) => {
    if (!payingName.trim() || !payingEmail.trim() || !fund) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/owambe/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundId: fund.id,
          slot: slotNumber,
          name: payingName.trim(),
          email: payingEmail.trim(),
          phone: payingPhone.trim(),
          amount: fund.perMemberTotal,
          squadName: fund.squadName,
          tableName: fund.tableName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.mono_url) {
        window.location.assign(data.mono_url);
      } else {
        toast.error(data.error || "Failed to initialize Mono payment. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleDeleteTable = () => {
    setDeleteTableModalOpen(true);
  };

  const confirmDeleteTable = () => {
    if (!fund) return;
    if (typeof window !== "undefined") {
      localStorage.removeItem(`table_fund_${fund.id}`);
    }
    setDeleteTableModalOpen(false);
    router.push("/owambe");
  };

  const handleRemoveMember = (slotNumber: number) => {
    if (!fund) return;
    const slot = fund.contributions.find((c) => c.slot === slotNumber);
    if (!slot) return;
    setRemoveMemberSlot(slot);
  };

  const confirmRemoveMember = () => {
    if (!fund || !removeMemberSlot) return;

    const updatedContributions = fund.contributions.map((c) => {
      if (c.slot === removeMemberSlot.slot) {
        return {
          slot: removeMemberSlot.slot,
          name: `Squad Member #${removeMemberSlot.slot}`,
          paid: false,
          amount: fund.perMemberTotal,
        };
      }
      return c;
    });

    const updatedFund = {
      ...fund,
      contributions: updatedContributions,
    };

    setFund(updatedFund);
    if (typeof window !== "undefined") {
      localStorage.setItem(`table_fund_${fund.id}`, JSON.stringify(updatedFund));
    }
    // Sync to cloud database
    fetch("/api/owambe/table", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFund),
    }).catch(() => {});
    setRemoveMemberSlot(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/owambe"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0B3022]/80 hover:text-[#0B3022] bg-white border border-[#0B3022]/15 px-4 py-2 rounded-full shadow-xs hover:shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4A843]" />
          <span>Back to Table Funds</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
      </div>

      {/* Expiration Notice if after 21 Dec 2026 */}
      {expired && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Event Concluded:</strong> The Owambe Party took place on 20 December 2026. Table funding and new contributions are permanently closed.
          </span>
        </div>
      )}

      {/* Deadline Notice if past 10 Dec 2026 */}
      {!expired && deadlinePassed && !isComplete && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>
            <strong>Funding Deadline Passed (10 Dec 2026):</strong> This table fund did not reach 100% funding by the deadline. As guaranteed by Escrow Protection, automatic refunds will be processed for any paid members.
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0B3022] text-[#F3EEE3] rounded-3xl p-6 sm:p-9 border border-[#D4A843]/30 shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4A843]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] text-xs font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Table Fund Live
                </span>
                <span className="text-xs font-mono text-[#F3EEE3]/70 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D4A843]" /> Deadline: {fund.deadline}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold font-serif mb-2 text-white">
                {fund.squadName}
              </h1>
              <p className="text-xs sm:text-sm text-[#F3EEE3]/80 leading-relaxed">
                Splitting a <strong>{fund.tableName}</strong> for <strong>{fund.event}</strong> on <strong>{fund.eventDate}</strong> at {fund.venue}.
              </p>
            </div>

            {/* Official Event Poster Badge */}
            <div className="flex items-center gap-3 bg-white/5 border border-[#D4A843]/30 rounded-2xl p-2.5 sm:p-3 shrink-0">
              <div className="relative w-16 sm:w-20 aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-[#D4A843]/40 bg-[#0B3022]">
                <Image
                  src="/owambe-poster.jpg"
                  alt="The Owambe Party Official Poster"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="text-left text-xs max-w-[130px]">
                <span className="text-[10px] font-mono uppercase text-[#D4A843] font-bold block">Official Event</span>
                <span className="font-bold text-white text-[11px] block leading-snug">The Owambe Party</span>
                <span className="text-[10px] text-[#F3EEE3]/70 block mt-0.5">20 Dec 2026 &bull; Lekki</span>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-[#FAF7F0] text-[#0B3022] rounded-2xl p-6 shadow-md border border-[#D4A843]/30">
            <div className="flex justify-between items-baseline mb-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#0B3022]/60 font-semibold block">
                  Funded Amount
                </span>
                <span className="text-3xl font-mono font-bold text-[#0B3022]">
                  ₦{currentTotal.toLocaleString()}
                  <span className="text-sm font-normal text-[#0B3022]/60 ml-2">
                    / ₦{fund.totalTargetWithFees.toLocaleString()}
                  </span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-[#D4A843]">{progressPct}%</span>
                <span className="text-xs font-mono text-[#0B3022]/60 block">{paidCount} of {fund.memberCount} Paid</span>
              </div>
            </div>

            {/* Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-[#0B3022] to-[#D4A843] transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {isComplete ? (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                <PartyPopper className="w-4 h-4 text-emerald-600" />
                <span>100% FUNDED! Table funds have been released to The Owambe Party. Your table is booked!</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs text-[#0B3022]/70 font-mono">
                <span>₦{fund.perMemberTotal.toLocaleString()} per member share</span>
                <span>{fund.memberCount - paidCount} slots remaining</span>
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={shareOnWhatsApp}
              className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Squad WhatsApp Group</span>
            </button>
            <button
              onClick={copyLink}
              className="py-3 px-5 bg-white/10 hover:bg-white/15 text-[#F3EEE3] rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#D4A843]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Link Copied to Clipboard!" : "Copy Table Link"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Squad Slots Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0B3022]/15 shadow-md text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold font-serif text-[#0B3022]">Squad Member Slots ({fund.memberCount} Total)</h3>
            <p className="text-xs text-[#0B3022]/60 mt-0.5">
              Click &quot;Pay Share&quot; next to any empty slot to pay your ₦{fund.perMemberTotal.toLocaleString()} portion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/owambe"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0B3022] text-xs font-mono font-bold transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Back</span>
            </Link>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#0B3022]/[0.06] text-[#0B3022]">
              {paidCount}/{fund.memberCount} Confirmed
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          {fund.contributions.map((member) => (
            <div
              key={member.slot}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                member.paid
                  ? "bg-emerald-500/[0.04] border-emerald-500/30"
                  : "bg-white border-gray-200 hover:border-[#D4A843]/60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    member.paid
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {member.slot}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-[#0B3022] truncate">
                    {member.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#0B3022]/60">
                    ₦{member.amount.toLocaleString()} &bull; {member.paid ? `Paid: ${member.paidAt || "Confirmed"}` : "Unpaid"}
                  </div>
                  {member.email && (
                    <div className="text-[10px] text-gray-400 truncate">
                      {member.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 ml-3 flex items-center gap-1.5">
                {member.paid ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Paid</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.slot)}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Release / Remove this member slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPayingSlot(member.slot)}
                    disabled={expired || deadlinePassed}
                    className="py-1.5 px-3 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Pay Share
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pay Share Modal */}
      {payingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-left shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono font-bold text-[#D4A843] uppercase tracking-wider bg-[#0B3022] px-2.5 py-0.5 rounded-full">
                Slot #{payingSlot} Payment
              </span>
              <button
                onClick={() => setPayingSlot(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-[#0B3022] mb-1">
              Pay Your Share for {fund.tableName}
            </h3>
            <p className="text-xs text-[#0B3022]/70 mb-5">
              You are paying for <strong>{fund.squadName}</strong>. Total due: <strong>₦{fund.perMemberTotal.toLocaleString()}</strong>.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0B3022] mb-1 uppercase font-mono">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Femi Balogun"
                  value={payingName}
                  onChange={(e) => setPayingName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B3022] mb-1 uppercase font-mono">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. femi@gmail.com"
                  value={payingEmail}
                  onChange={(e) => setPayingEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Your official payment receipt and event entry ticket will be delivered here.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B3022] mb-1 uppercase font-mono">
                  WhatsApp Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="08022334455"
                  value={payingPhone}
                  onChange={(e) => setPayingPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Table Share (1 of {fund.memberCount}):</span>
                  <span className="font-mono font-bold text-gray-900">₦{fund.perMemberShare.toLocaleString()}</span>
                </div>
                {fund.perMemberFee > 0 ? (
                  <div className="flex justify-between text-gray-600">
                    <span>Platform & Escrow Fee (1%):</span>
                    <span className="font-mono font-bold text-gray-900">+₦{fund.perMemberFee.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-700">
                    <span>Platform & Escrow Fee:</span>
                    <span className="font-mono font-bold">₦0 (100% Free Promo)</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1.5 font-bold text-[#0B3022]">
                  <span>Total Debit / Transfer:</span>
                  <span className="font-mono text-sm text-[#0B3022]">₦{fund.perMemberTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-[#0B3022]/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4A843] shrink-0" />
                  <span>Escrow secured by Mono DirectPay. 100% refund if squad is incomplete.</span>
                </div>
                <p className="text-[10px] text-gray-500 pl-6">
                  Supports instant transfer from <strong>OPay</strong>, <strong>PalmPay</strong>, <strong>Kuda</strong>, or any Nigerian bank app.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setPayingSlot(null)}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => handlePayShare(payingSlot)}
                  disabled={isProcessing || !payingName.trim() || !payingEmail.trim()}
                  className="flex-1 py-3.5 px-4 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? "Generating Transfer Account..." : `Pay ₦${fund.perMemberTotal.toLocaleString()} (Bank Transfer / OPay)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom In-App Double Opt-In Modal: Delete Table */}
      {deleteTableModalOpen && fund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-left shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-serif text-[#0B3022] mb-2">
              Cancel & Delete Table?
            </h3>

            {fund.contributions.filter((c) => c.paid).length > 1 ? (
              <div className="space-y-4">
                <p className="text-xs text-[#0B3022]/80 leading-relaxed">
                  Squad members have already contributed into <strong>{fund.squadName}</strong>. To cancel this reservation and process automatic escrow refunds, please reach out to platform operations.
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDeleteTableModalOpen(false)}
                    className="py-2.5 px-5 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Understood
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#0B3022]/80 leading-relaxed">
                  Are you sure you want to cancel and delete <strong>&quot;{fund.squadName}&quot;</strong>? All data for this table will be permanently removed.
                </p>
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTableModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteTable}
                    className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Yes, Delete Table
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom In-App Double Opt-In Modal: Remove Member */}
      {removeMemberSlot && fund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-left shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600">
              <Users className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-serif text-[#0B3022] mb-2">
              {removeMemberSlot.paid ? "Refund & Release Seat?" : "Reset Slot to Open?"}
            </h3>

            <p className="text-xs text-[#0B3022]/80 leading-relaxed mb-5">
              {removeMemberSlot.paid ? (
                <>
                  <strong>{removeMemberSlot.name}</strong> has already paid <strong>₦{removeMemberSlot.amount.toLocaleString()}</strong> into escrow for Slot #{removeMemberSlot.slot}. Removing them will release the seat for another friend and initiate an escrow refund.
                </>
              ) : (
                <>
                  Are you sure you want to clear <strong>Slot #{removeMemberSlot.slot}</strong>? The seat will be reopened for any friend to claim.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemoveMemberSlot(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveMember}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {removeMemberSlot.paid ? "Confirm Refund & Release" : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Trust Guarantee */}
      <div className="bg-[#FAF7F0] rounded-2xl p-6 border border-[#0B3022]/10 text-left flex items-start gap-4 text-xs text-[#0B3022]/80">
        <ShieldCheck className="w-6 h-6 text-[#D4A843] shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-[#0B3022]">How Your Money is Protected</h4>
          <p className="leading-relaxed">
            Contributions are securely collected via <strong>Mono DirectPay</strong> (CBN-licensed open-banking infrastructure) and safely held in escrow until the table is 100% funded, then released to <strong>The Owambe Party (Spotlight by Mmakamba)</strong> in one single disbursement. If your squad fails to complete all {fund.memberCount} shares by <strong>10 December 2026</strong>, every contributor receives an automatic full refund.
          </p>
        </div>
      </div>

      {/* Bottom Back Navigation & Delete Actions */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#0B3022]/10">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/owambe"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0B3022] hover:text-[#D4A843] bg-white border border-[#0B3022]/15 px-5 py-2.5 rounded-full shadow-xs hover:shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D4A843]" />
            <span>Back to Table Funds</span>
          </Link>
          <button
            type="button"
            onClick={handleDeleteTable}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3.5 py-2 rounded-full transition-colors cursor-pointer"
            title="Cancel and delete this squad table"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Table</span>
          </button>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}
