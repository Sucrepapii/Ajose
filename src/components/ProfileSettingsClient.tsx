"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  User, 
  Phone, 
  CheckCircle2, 
  Landmark, 
  ShieldCheck, 
  KeyRound, 
  HeartHandshake, 
  AlertCircle, 
  Lock, 
  X,
  Users,
  ExternalLink
} from "lucide-react";

export function ProfileSettingsClient({ 
  userId, 
  initialProfile 
}: { 
  userId: string;
  initialProfile: any;
}) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPin, setHasPin] = useState(Boolean(initialProfile?.has_pin));
  
  // Profile form state (Personal details and Next of Kin/Guarantor)
  const [formData, setFormData] = useState({
    first_name: initialProfile?.first_name || "",
    last_name: initialProfile?.last_name || "",
    nickname: initialProfile?.nickname || "",
    phone: initialProfile?.phone || "",
    next_of_kin_name: initialProfile?.next_of_kin_name || "",
    next_of_kin_relationship: initialProfile?.next_of_kin_relationship || "Spouse",
    next_of_kin_phone: initialProfile?.next_of_kin_phone || "",
    next_of_kin_email: initialProfile?.next_of_kin_email || "",
    next_of_kin_address: initialProfile?.next_of_kin_address || "",
    guarantor_name: initialProfile?.guarantor_name || "",
    guarantor_phone: initialProfile?.guarantor_phone || "",
    guarantor_relationship: initialProfile?.guarantor_relationship || "Brother"
  });

  // Verified Bank details (Strictly synchronized with Identity & Bank Verification / Mono)
  const isBankVerified = Boolean(initialProfile?.bvn_verified && initialProfile?.bank_name);
  const verifiedBank = {
    bank_name: initialProfile?.bank_name || "Commercial Bank",
    account_number: initialProfile?.account_number || "••••••••••",
    account_name: initialProfile?.account_name || `${initialProfile?.first_name || ''} ${initialProfile?.last_name || ''}`.trim() || "Verified Account"
  };

  // Re-link bank PIN authorization states
  const [isRelinkPinModalOpen, setIsRelinkPinModalOpen] = useState(false);
  const [isRelinkNoticeOpen, setIsRelinkNoticeOpen] = useState(false);
  const [relinkPinInput, setRelinkPinInput] = useState("");
  const [isVerifyingRelink, setIsVerifyingRelink] = useState(false);

  // PIN Management modal & form states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<"set" | "change">("set");
  const [pinInputs, setPinInputs] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: ""
  });
  const [isPinSubmitting, setIsPinSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Initiating bank re-link: Prompt PIN if configured before routing to /dashboard/verify
  const handleInitiateBankRelink = () => {
    if (hasPin) {
      setRelinkPinInput("");
      setIsRelinkPinModalOpen(true);
    } else {
      setIsRelinkNoticeOpen(true);
    }
  };

  // Verify PIN before navigating to Mono verification page
  const handleConfirmRelinkPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (relinkPinInput.length !== 4) {
      toast.error("Please enter a 4-digit numeric PIN.");
      return;
    }

    setIsVerifyingRelink(true);

    try {
      const res = await fetch("/api/user/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          pin: relinkPinInput
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Incorrect 4-digit PIN. Authorization failed.");
      }

      setIsRelinkPinModalOpen(false);
      toast.success("Identity authorized! Redirecting to Identity & Bank Verification...");
      router.push("/dashboard/verify");
    } catch (err: any) {
      toast.error(err.message || "Failed to verify PIN.");
    } finally {
      setIsVerifyingRelink(false);
    }
  };

  // Save personal profile and Next of Kin changes
  const handleSaveProfile = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      toast.success(data.message || "Profile & Next of Kin records saved successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PIN Set / Change form submission
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPinSubmitting(true);

    try {
      if (pinModalMode === "set") {
        if (!/^\d{4}$/.test(pinInputs.newPin)) {
          toast.error("PIN must be exactly 4 numeric digits.");
          return;
        }
        if (pinInputs.newPin !== pinInputs.confirmPin) {
          toast.error("PINs do not match. Please verify.");
          return;
        }

        const res = await fetch("/api/user/pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "set",
            pin: pinInputs.newPin,
            confirmPin: pinInputs.confirmPin
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to set PIN.");

        setHasPin(true);
        toast.success(data.message || "4-Digit Transaction Security PIN created!");
        setIsPinModalOpen(false);
        setPinInputs({ currentPin: "", newPin: "", confirmPin: "" });
        router.refresh();
      } else {
        // Change PIN
        if (!/^\d{4}$/.test(pinInputs.currentPin)) {
          toast.error("Enter your current 4-digit PIN.");
          return;
        }
        if (!/^\d{4}$/.test(pinInputs.newPin)) {
          toast.error("New PIN must be exactly 4 numeric digits.");
          return;
        }
        if (pinInputs.newPin !== pinInputs.confirmPin) {
          toast.error("New PINs do not match.");
          return;
        }

        const res = await fetch("/api/user/pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "change",
            currentPin: pinInputs.currentPin,
            pin: pinInputs.newPin,
            confirmPin: pinInputs.confirmPin
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to change PIN.");

        toast.success(data.message || "Transaction Security PIN updated successfully!");
        setIsPinModalOpen(false);
        setPinInputs({ currentPin: "", newPin: "", confirmPin: "" });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "PIN operation failed.");
    } finally {
      setIsPinSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Personal Identity Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Personal Details</h2>
            <p className="text-zinc-400 text-sm">Your primary identity and contact credentials on Àjọṣe.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-zinc-400 mb-2">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="e.g. Adewale"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-zinc-400 mb-2">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="e.g. Adeyemi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-zinc-400 mb-2">Display Alias (Nickname)</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="e.g. GoldenSaver"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  placeholder="e.g. +234..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Settlement Bank Account Details (Synchronized with Identity & Bank Verification) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Landmark className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Settlement Bank Account</h2>
              <p className="text-zinc-400 text-sm">
                Synchronized directly with your verified identity via Mono Open-Banking.
              </p>
            </div>
          </div>

          <div>
            {isBankVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Account Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">
                <AlertCircle className="h-3.5 w-3.5" /> Verification Pending
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isBankVerified ? (
            <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                  <span className="text-[11px] text-zinc-500 font-medium">Bank Institution</span>
                  <p className="text-sm font-bold text-white mt-1">{verifiedBank.bank_name}</p>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                  <span className="text-[11px] text-zinc-500 font-medium">10-Digit Account Number</span>
                  <p className="text-sm font-mono font-bold text-emerald-400 mt-1">{verifiedBank.account_number}</p>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                  <span className="text-[11px] text-zinc-500 font-medium">Account Name</span>
                  <p className="text-sm font-bold text-white mt-1 truncate">{verifiedBank.account_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  Your settlement account is strictly locked to your verified identity bank. Rotational payout disbursements and auto-debit sweeps are routed only to this account.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Changing settlement bank requires 4-digit PIN authorization &amp; re-verification.</span>
                </div>

                <button
                  type="button"
                  onClick={handleInitiateBankRelink}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl text-xs border border-zinc-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Re-verify &amp; Change Bank
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Landmark className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No Bank Account Connected Yet</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Connect your commercial bank account via Mono on the Identity &amp; Bank Verification page to verify your BVN and activate direct debit mandates for your Ajo cycles.
                </p>
              </div>
              <div>
                <Link
                  href="/dashboard/verify"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Go to Identity &amp; Bank Verification
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Next of Kin & Social Guarantor Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
              <HeartHandshake className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Next of Kin &amp; Social Guarantor</h2>
              <p className="text-zinc-400 text-sm">Designate emergency contacts and social endorsements for Ajo cycles.</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Ajo Risk Mitigation
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-zinc-400 space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Why Next of Kin is required in Àjọṣe:
            </p>
            <p>
              In rotational savings circles where early payout recipients collect funds before full cycle maturity, 
              verified Next of Kin details provide emergency recovery contacts and ensure transparency across peer circles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="next_of_kin_name" className="block text-sm font-medium text-zinc-400 mb-2">Next of Kin Full Name *</label>
              <input
                type="text"
                id="next_of_kin_name"
                name="next_of_kin_name"
                value={formData.next_of_kin_name}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                placeholder="e.g. Folake Adeyemi"
              />
            </div>

            <div>
              <label htmlFor="next_of_kin_relationship" className="block text-sm font-medium text-zinc-400 mb-2">Relationship *</label>
              <select
                id="next_of_kin_relationship"
                name="next_of_kin_relationship"
                value={formData.next_of_kin_relationship}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child</option>
                <option value="Extended Family">Extended Family</option>
                <option value="Business Partner">Business Partner</option>
                <option value="Colleague">Colleague</option>
                <option value="Friend">Friend / Associate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="next_of_kin_phone" className="block text-sm font-medium text-zinc-400 mb-2">Next of Kin Phone Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="tel"
                  id="next_of_kin_phone"
                  name="next_of_kin_phone"
                  value={formData.next_of_kin_phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="e.g. +2348098765432"
                />
              </div>
            </div>

            <div>
              <label htmlFor="next_of_kin_email" className="block text-sm font-medium text-zinc-400 mb-2">Next of Kin Email (Optional)</label>
              <input
                type="email"
                id="next_of_kin_email"
                name="next_of_kin_email"
                value={formData.next_of_kin_email}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                placeholder="e.g. folake@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="next_of_kin_address" className="block text-sm font-medium text-zinc-400 mb-2">Residential Address / City</label>
            <input
              type="text"
              id="next_of_kin_address"
              name="next_of_kin_address"
              value={formData.next_of_kin_address}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
            />
          </div>

          {/* Social Guarantor Section */}
          <div className="pt-6 border-t border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Social Guarantor (Optional)</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Guarantors provide peer endorsement for high-value circles (₦500,000+), unlocking earlier collection turns.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="guarantor_name" className="block text-xs font-medium text-zinc-400 mb-1.5">Guarantor Name</label>
                <input
                  type="text"
                  id="guarantor_name"
                  name="guarantor_name"
                  value={formData.guarantor_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-950 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Babatunde Adeyemi"
                />
              </div>

              <div>
                <label htmlFor="guarantor_phone" className="block text-xs font-medium text-zinc-400 mb-1.5">Guarantor Phone</label>
                <input
                  type="tel"
                  id="guarantor_phone"
                  name="guarantor_phone"
                  value={formData.guarantor_phone}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-950 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. +234..."
                />
              </div>

              <div>
                <label htmlFor="guarantor_relationship" className="block text-xs font-medium text-zinc-400 mb-1.5">Relationship</label>
                <input
                  type="text"
                  id="guarantor_relationship"
                  name="guarantor_relationship"
                  value={formData.guarantor_relationship}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-950 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Elder Brother / Employer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 4-Digit Transaction Security PIN Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
              <KeyRound className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">4-Digit Transaction Security PIN</h2>
              <p className="text-zinc-400 text-sm">Protects lump-sum payout sweeps and authorizes settlement bank changes.</p>
            </div>
          </div>

          <div>
            {hasPin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" /> PIN Protected (Active)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">
                <AlertCircle className="h-3.5 w-3.5" /> No PIN Set (Action Required)
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">
                {hasPin ? "PIN Security Protection Active" : "Set Your 4-Digit Security Code"}
              </p>
              <p className="text-xs text-zinc-400 max-w-xl">
                {hasPin 
                  ? "Your 4-digit PIN is active. It is prompted whenever you initiate a payout withdrawal sweep or re-link your verified settlement bank account."
                  : "We strongly recommend setting a 4-digit numeric PIN now. It prevents unauthorized parties from redirecting your lump-sum savings."
                }
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPinModalMode(hasPin ? "change" : "set");
                setPinInputs({ currentPin: "", newPin: "", confirmPin: "" });
                setIsPinModalOpen(true);
              }}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs border border-zinc-700 transition-all shrink-0 flex items-center gap-2"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              {hasPin ? "Change 4-Digit PIN" : "Set 4-Digit PIN"}
            </button>
          </div>
        </div>
      </div>

      {/* Global Save Button */}
      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handleSaveProfile}
          disabled={isProcessing}
          className="px-8 py-3.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-50 disabled:shadow-none flex items-center gap-2.5 text-sm"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div>
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Save Profile &amp; Next of Kin</span>
            </>
          )}
        </button>
      </div>

      {/* MODAL 1: Authorize Re-linking Bank Account with PIN */}
      {isRelinkPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsRelinkPinModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Authorize Bank Account Change</h3>
              <p className="text-xs text-zinc-400">
                Enter your 4-digit Transaction Security PIN to authorize switching your verified settlement bank account via Mono.
              </p>
            </div>

            <form onSubmit={handleConfirmRelinkPin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                inputMode="numeric"
                pattern="[0-9]*"
                value={relinkPinInput}
                onChange={(e) => setRelinkPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                placeholder="••••"
                required
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRelinkPinModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={relinkPinInput.length !== 4 || isVerifyingRelink}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isVerifyingRelink ? (
                    <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Authorize &amp; Proceed
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Notice if user tries to re-link bank without having set a PIN */}
      {isRelinkNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setIsRelinkNoticeOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <KeyRound className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Security PIN Recommended</h3>
              <p className="text-xs text-zinc-400">
                To protect your lump-sum savings from unauthorized diversion, we recommend configuring a 4-digit PIN before switching your verified payout bank account.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRelinkNoticeOpen(false);
                  setPinModalMode("set");
                  setPinInputs({ currentPin: "", newPin: "", confirmPin: "" });
                  setIsPinModalOpen(true);
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Set 4-Digit PIN First
              </button>
              <Link
                href="/dashboard/verify"
                onClick={() => setIsRelinkNoticeOpen(false)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Proceed to Verification Anyway
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PIN Setup / Change Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {pinModalMode === "set" ? "Create 4-Digit Security PIN" : "Change 4-Digit PIN"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {pinModalMode === "set" 
                    ? "Enter 4 numeric digits for authorizing payouts and bank updates."
                    : "Verify your existing PIN and choose a new 4-digit code."
                  }
                </p>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              {pinModalMode === "change" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Current 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pinInputs.currentPin}
                    onChange={(e) => setPinInputs(p => ({ ...p, currentPin: e.target.value.replace(/\D/g, '') }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-white font-mono focus:outline-none focus:border-amber-500"
                    placeholder="••••"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  {pinModalMode === "change" ? "New 4-Digit PIN" : "Choose 4-Digit PIN"}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pinInputs.newPin}
                  onChange={(e) => setPinInputs(p => ({ ...p, newPin: e.target.value.replace(/\D/g, '') }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Confirm 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pinInputs.confirmPin}
                  onChange={(e) => setPinInputs(p => ({ ...p, confirmPin: e.target.value.replace(/\D/g, '') }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="••••"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPinSubmitting}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPinSubmitting ? (
                    <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {pinModalMode === "set" ? "Save PIN" : "Update PIN"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
