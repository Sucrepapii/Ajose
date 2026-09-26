"use client";

import { useState } from "react";
import { 
  Share2, 
  MessageCircle, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Coins, 
  X, 
  Send,
  Download,
  Users
} from "lucide-react";
import { toast } from "sonner";

interface OrganizerShareKitModalProps {
  groupId: string;
  groupName: string;
  amount?: number;
  frequency?: string;
  maxMembers?: number;
  joinedCount?: number;
  minScore?: number;
  adminCommissionPct?: number;
  buttonLabel?: string;
  variant?: "primary" | "secondary" | "compact";
}

export function OrganizerShareKitModal({
  groupId,
  groupName,
  amount = 50000,
  frequency = "monthly",
  maxMembers = 10,
  joinedCount = 1,
  minScore = 0,
  adminCommissionPct = 5,
  buttonLabel = "Share Invite Kit",
  variant = "primary"
}: OrganizerShareKitModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"whatsapp" | "qr" | "links">("whatsapp");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Generate Invite URL
  const getInviteUrl = () => {
    if (typeof window === "undefined") return "";
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    if (groupName) params.set("name", groupName);
    if (amount) params.set("amount", amount.toString());
    if (frequency) params.set("freq", frequency);
    if (maxMembers) params.set("members", maxMembers.toString());
    if (minScore) params.set("score", minScore.toString());
    const qs = params.toString();
    return `${baseUrl}/invite/${groupId}${qs ? `?${qs}` : ""}`;
  };

  const inviteUrl = getInviteUrl();
  const openSlots = Math.max(0, maxMembers - joinedCount);
  const totalPool = amount * maxMembers;
  const adminCommissionAmount = Math.round((adminCommissionPct / 100) * totalPool);

  // Formatted WhatsApp Viral Message
  const formatWhatsAppMessage = () => {
    const freqLabel = frequency === "daily" ? "Daily" : frequency === "weekly" ? "Weekly" : "Monthly";
    return `🇳🇬 *Àjọṣe Rotational Thrift Circle Invitation*
━━━━━━━━━━━━━━━━━━
👋 You've been invited by the organizer to join *${groupName}*!

💰 *Contribution:* ₦${amount.toLocaleString()} / ${freqLabel}
🎯 *Total Cycle Pot:* ₦${totalPool.toLocaleString()}
👥 *Open Slots:* ${openSlots} of ${maxMembers} slots remaining
🔄 *Rotational Model:* Guaranteed direct payout when it's your turn

🛡️ *Bank-Grade Security:*
• Direct bank settlement via Mono Open-Banking
• Verified BVN Identity & Ajo Trust Standing
• Automated direct debit sweeps — zero manual cash chasing
• 100% transparent live ledger

👉 *Tap below to reserve your payout slot now:*
${inviteUrl}`;
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWhatsApp = () => {
    const msg = formatWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setCopiedMessage(true);
    toast.success("WhatsApp message template copied!");
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const msg = formatWhatsAppMessage();
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(inviteUrl)}`;

  return (
    <>
      {/* Trigger Button */}
      {variant === "primary" ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B3022] hover:bg-[#154634] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer border border-[#C5A059]/40 group"
        >
          <Share2 className="h-4 w-4 text-[#C5A059] group-hover:rotate-12 transition-transform" />
          <span>{buttonLabel}</span>
          <span className="bg-[#C5A059] text-[#0B3022] text-[10px] font-black px-1.5 py-0.5 rounded-full">
            Kit
          </span>
        </button>
      ) : variant === "compact" ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          title="Open Organizer Invite & Share Kit"
        >
          <Share2 className="h-3.5 w-3.5 text-[#C5A059]" />
          <span>Invite</span>
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-[#0B3022] border border-gray-200 text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Share2 className="h-4 w-4 text-[#C5A059]" />
          <span>{buttonLabel}</span>
        </button>
      )}


      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0B3022] text-white p-6 relative overflow-hidden shrink-0">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#C5A059]/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-[#C5A059] text-[#0B3022] px-2.5 py-0.5 rounded-full">
                    Organizer Toolkit
                  </span>
                  <span className="text-xs text-white/70">
                    {openSlots > 0 ? `${openSlots} slots left` : "Full Roster"}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h2 className="text-2xl font-black text-white relative z-10 font-serif">
                {groupName}
              </h2>
              <p className="text-xs text-white/80 mt-1 relative z-10 font-medium">
                ₦{amount.toLocaleString()} • {frequency.toUpperCase()} • ₦{totalPool.toLocaleString()} Total Pot
              </p>

              {/* Admin Commission Badge */}
              {adminCommissionPct > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-[#C5A059]/40 text-xs font-medium text-[#C5A059]">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Your Admin Cut: <strong>{adminCommissionPct}%</strong> (~₦{adminCommissionAmount.toLocaleString()} upon completion)</span>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 pt-2 shrink-0">
              <button
                onClick={() => setActiveTab("whatsapp")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "whatsapp"
                    ? "border-[#0B3022] text-[#0B3022] bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>WhatsApp Kit</span>
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "qr"
                    ? "border-[#0B3022] text-[#0B3022] bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <QrCode className="h-4 w-4 text-[#C5A059]" />
                <span>Scan & QR Pass</span>
              </button>
              <button
                onClick={() => setActiveTab("links")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "links"
                    ? "border-[#0B3022] text-[#0B3022] bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Copy className="h-4 w-4 text-gray-600" />
                <span>Quick Links</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* TAB 1: WhatsApp Viral Invite Kit */}
              {activeTab === "whatsapp" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 font-medium flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div>
                      <strong className="block text-emerald-900 text-sm mb-0.5">High-Converting WhatsApp Template</strong>
                      Drop this directly into your church group, market union, office clique, or family WhatsApp chat to fill slots instantly.
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-mono text-[11px] sm:text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto select-all">
                    {formatWhatsAppMessage()}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={handleOpenWhatsApp}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>Share on WhatsApp</span>
                    </button>

                    <button
                      onClick={handleCopyWhatsApp}
                      className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-[#0B3022] border-2 border-gray-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>Copied Template!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-gray-600" />
                          <span>Copy Message Text</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: QR Code & Printable Flyer */}
              {activeTab === "qr" && (
                <div className="space-y-4 animate-in fade-in duration-150 text-center">
                  <p className="text-xs text-[#1F2937]/80 font-medium">
                    Have members scan this code with their smartphone camera at meetings, market stalls, or events to join instantly.
                  </p>

                  <div className="inline-block p-4 bg-white rounded-3xl border-2 border-[#C5A059]/40 shadow-lg mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR code for ${groupName}`} 
                      className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-xl"
                    />
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs font-bold text-[#0B3022]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Àjọṣe Verified Circle</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                    <button
                      onClick={handleCopyLink}
                      className="w-full sm:w-auto py-2.5 px-5 bg-[#0B3022] hover:bg-[#154634] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedLink ? "Link Copied!" : "Copy Target URL"}</span>
                    </button>
                    <a
                      href={qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Save QR Image</span>
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 3: Direct Link & Multi-Channel */}
              {activeTab === "links" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-[#0B3022] mb-1 uppercase tracking-wider">
                      Direct Circle Invite Link
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={inviteUrl}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-mono focus:outline-hidden select-all"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="py-2.5 px-4 bg-[#0B3022] hover:bg-[#154634] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        {copiedLink ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                      Other Share Channels
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(`Join our verified Àjọ circle "${groupName}" on Àjọṣe!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Telegram</span>
                      </a>

                      <a
                        href={`sms:?body=${encodeURIComponent(`Join our verified Àjọ circle "${groupName}" on Àjọṣe: ${inviteUrl}`)}`}
                        className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        <span>SMS / Text</span>
                      </a>

                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join my verified rotational thrift circle "${groupName}" on @ajose_app! Automated direct debits via Mono Open-Banking: ${inviteUrl}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 rounded-xl border border-zinc-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Twitter / X</span>
                      </a>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#FDFBF7] border border-gray-200 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600 font-medium">
                      <span>Circle Frequency:</span>
                      <strong className="text-[#0B3022] capitalize">{frequency}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600 font-medium">
                      <span>Per Member Contribution:</span>
                      <strong className="text-[#0B3022]">₦{amount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600 font-medium">
                      <span>Capacity:</span>
                      <strong className="text-[#0B3022]">{joinedCount} of {maxMembers} filled</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                Share widely to fill slots &amp; start cycle
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="font-bold text-[#0B3022] hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
