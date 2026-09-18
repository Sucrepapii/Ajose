"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Unlock,
  X,
  Users,
  RotateCcw
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
  
  // Profile form state
  const [formData, setFormData] = useState({
    first_name: initialProfile?.first_name || "",
    last_name: initialProfile?.last_name || "",
    nickname: initialProfile?.nickname || "",
    phone: initialProfile?.phone || "",
    bank_name: initialProfile?.bank_name || "",
    account_number: initialProfile?.account_number || "",
    account_name: initialProfile?.account_name || "",
    next_of_kin_name: initialProfile?.next_of_kin_name || "",
    next_of_kin_relationship: initialProfile?.next_of_kin_relationship || "Spouse",
    next_of_kin_phone: initialProfile?.next_of_kin_phone || "",
    next_of_kin_email: initialProfile?.next_of_kin_email || "",
    next_of_kin_address: initialProfile?.next_of_kin_address || "",
    guarantor_name: initialProfile?.guarantor_name || "",
    guarantor_phone: initialProfile?.guarantor_phone || "",
    guarantor_relationship: initialProfile?.guarantor_relationship || "Brother"
  });

  // Track original bank values to detect if changed and allow reverting
  const originalBank = {
    bank_name: initialProfile?.bank_name || "",
    account_number: initialProfile?.account_number || "",
    account_name: initialProfile?.account_name || ""
  };

  // Bank Lock State: If bank account exists, lock it by default until 4-digit PIN is entered
  const [isBankEditingUnlocked, setIsBankEditingUnlocked] = useState(
    !initialProfile?.account_number && !initialProfile?.bank_name
  );
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isPinRequiredNoticeOpen, setIsPinRequiredNoticeOpen] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState("");
  const [isVerifyingUnlock, setIsVerifyingUnlock] = useState(false);

  // PIN modal & auth states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<"set" | "change">("set");
  const [pinInputs, setPinInputs] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: ""
  });
  const [isPinSubmitting, setIsPinSubmitting] = useState(false);

  // Bank change PIN token/cache for saving
  const [bankAuthPin, setBankAuthPin] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Trigger PIN challenge when user clicks to unlock bank editing
  const handleInitiateBankUnlock = () => {
    if (isBankEditingUnlocked) return;
    
    if (hasPin) {
      setUnlockPinInput("");
      setIsUnlockModalOpen(true);
    } else {
      setIsPinRequiredNoticeOpen(true);
    }
  };

  // Verify PIN to unlock bank inputs
  const handleConfirmBankUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockPinInput.length !== 4) {
      toast.error("Please enter a 4-digit numeric PIN.");
      return;
    }

    setIsVerifyingUnlock(true);

    try {
      const res = await fetch("/api/user/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          pin: unlockPinInput
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Incorrect 4-digit PIN. Authorization failed.");
      }

      setIsBankEditingUnlocked(true);
      setBankAuthPin(unlockPinInput);
      setIsUnlockModalOpen(false);
      toast.success("Identity verified! Settlement bank details are unlocked for editing.");
    } catch (err: any) {
      toast.error(err.message || "Failed to verify PIN.");
    } finally {
      setIsVerifyingUnlock(false);
    }
  };

  // Cancel bank edit and re-lock
  const handleRelockBank = () => {
    setFormData(prev => ({
      ...prev,
      bank_name: originalBank.bank_name,
      account_number: originalBank.account_number,
      account_name: originalBank.account_name
    }));
    setIsBankEditingUnlocked(false);
    setBankAuthPin("");
    toast.info("Bank account edits discarded. Payout account re-locked.");
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsProcessing(true);

    try {
      const bankChanged = 
        (formData.bank_name && formData.bank_name !== originalBank.bank_name) ||
        (formData.account_number && formData.account_number !== originalBank.account_number);

      // If bank changed and user has PIN but never unlocked with PIN, prompt now
      if (hasPin && bankChanged && !bankAuthPin) {
        setIsUnlockModalOpen(true);
        setIsProcessing(false);
        return;
      }

      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pin: bankAuthPin || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresPin) {
          setIsUnlockModalOpen(true);
          toast.error(data.error || "Please enter your 4-digit PIN to authorize bank change.");
          return;
        }
        throw new Error(data.error || "Failed to update profile.");
      }

      toast.success(data.message || "Profile & Next of Kin records saved successfully!");
      setIsBankEditingUnlocked(false);
      setBankAuthPin("");
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
      {/* 1. Personal & Bank Settlement Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Personal &amp; Settlement Account</h2>
            <p className="text-zinc-400 text-sm">Your identity and default rotational payout account.</p>
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

          {/* Settlement Account with PIN Gate & Visual Lock */}
          <div className="pt-6 border-t border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Settlement Bank Account Details</h3>
              </div>
              
              {hasPin ? (
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> PIN Protected
                </span>
              ) : (
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> PIN Not Set
                </span>
              )}
            </div>

            {/* Lock / Unlock Banner */}
            {!isBankEditingUnlocked ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Settlement Account Locked for Security</p>
                    <p className="text-[11px] text-zinc-400">
                      Enter your 4-digit PIN to authorize modifying your payout destination bank account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInitiateBankUnlock}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Enter PIN to Unlock
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Unlock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300">Bank Account Unlocked for Editing</p>
                    <p className="text-[11px] text-emerald-400/80">
                      You can now change your bank details. Click Save when finished.
                    </p>
                  </div>
                </div>

                {originalBank.account_number && (
                  <button
                    type="button"
                    onClick={handleRelockBank}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 border border-zinc-700 shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Discard &amp; Re-lock
                  </button>
                )}
              </div>
            )}

            <div className={`space-y-4 transition-all ${!isBankEditingUnlocked ? "opacity-75" : ""}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bank_name" className="block text-sm font-medium text-zinc-400 mb-2">
                    Bank Institution {!isBankEditingUnlocked && <Lock className="inline h-3 w-3 ml-1 text-zinc-500" />}
                  </label>
                  <select
                    id="bank_name"
                    name="bank_name"
                    disabled={!isBankEditingUnlocked}
                    value={formData.bank_name}
                    onChange={handleChange}
                    onClick={() => !isBankEditingUnlocked && handleInitiateBankUnlock()}
                    className={`block w-full px-3 py-3 border rounded-xl bg-zinc-950 text-white transition-colors ${
                      !isBankEditingUnlocked 
                        ? "border-zinc-800/80 bg-zinc-950/60 cursor-not-allowed text-zinc-400" 
                        : "border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    }`}
                  >
                    <option value="">Select Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank (GTB)</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                    <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    <option value="Kuda Bank">Kuda Bank</option>
                    <option value="OPay">OPay</option>
                    <option value="PalmPay">PalmPay</option>
                    <option value="Stanbic IBTC">Stanbic IBTC</option>
                    <option value="Fidelity Bank">Fidelity Bank</option>
                    <option value="Other Bank">Other Bank</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="account_number" className="block text-sm font-medium text-zinc-400 mb-2">
                    10-Digit NUBAN Account {!isBankEditingUnlocked && <Lock className="inline h-3 w-3 ml-1 text-zinc-500" />}
                  </label>
                  <input
                    type="text"
                    id="account_number"
                    name="account_number"
                    maxLength={10}
                    disabled={!isBankEditingUnlocked}
                    value={formData.account_number}
                    onChange={handleChange}
                    onClick={() => !isBankEditingUnlocked && handleInitiateBankUnlock()}
                    className={`block w-full px-3 py-3 border rounded-xl bg-zinc-950 text-emerald-400 font-mono font-bold transition-colors ${
                      !isBankEditingUnlocked 
                        ? "border-zinc-800/80 bg-zinc-950/60 cursor-not-allowed opacity-90" 
                        : "border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    }`}
                    placeholder="e.g. 0123456789"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="account_name" className="block text-sm font-medium text-zinc-400 mb-2">
                  Verified Account Name {!isBankEditingUnlocked && <Lock className="inline h-3 w-3 ml-1 text-zinc-500" />}
                </label>
                <input
                  type="text"
                  id="account_name"
                  name="account_name"
                  disabled={!isBankEditingUnlocked}
                  value={formData.account_name}
                  onChange={handleChange}
                  onClick={() => !isBankEditingUnlocked && handleInitiateBankUnlock()}
                  className={`block w-full px-3 py-3 border rounded-xl bg-zinc-950 text-white transition-colors ${
                    !isBankEditingUnlocked 
                      ? "border-zinc-800/80 bg-zinc-950/60 cursor-not-allowed text-zinc-400" 
                      : "border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  }`}
                  placeholder="e.g. Adewale Adeyemi Settlement"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Next of Kin & Social Guarantor Section */}
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

      {/* 3. 4-Digit Transaction Security PIN Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
              <KeyRound className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">4-Digit Transaction Security PIN</h2>
              <p className="text-zinc-400 text-sm">Protects lump-sum payout sweeps and authorizes settlement bank edits.</p>
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
                  ? "Your 4-digit PIN is active. It is prompted whenever you initiate a payout withdrawal sweep or unlock your linked settlement bank account."
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

      {/* MODAL 1: Enter PIN to Unlock Bank Account Editing */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsUnlockModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Enter 4-Digit Security PIN</h3>
              <p className="text-xs text-zinc-400">
                To protect your Ajo payouts from redirection, please enter your PIN to unlock your bank details.
              </p>
            </div>

            <form onSubmit={handleConfirmBankUnlock} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                inputMode="numeric"
                pattern="[0-9]*"
                value={unlockPinInput}
                onChange={(e) => setUnlockPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                placeholder="••••"
                required
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsUnlockModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlockPinInput.length !== 4 || isVerifyingUnlock}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isVerifyingUnlock ? (
                    <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Unlock className="h-3.5 w-3.5" />
                      Verify &amp; Unlock
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Notice if user tries to edit bank without having set a PIN */}
      {isPinRequiredNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setIsPinRequiredNoticeOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <KeyRound className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Security PIN Required</h3>
              <p className="text-xs text-zinc-400">
                To protect your lump-sum savings from unauthorized diversion, you must set a 4-digit Transaction Security PIN before editing settlement bank details.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPinRequiredNoticeOpen(false);
                  setPinModalMode("set");
                  setPinInputs({ currentPin: "", newPin: "", confirmPin: "" });
                  setIsPinModalOpen(true);
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Set 4-Digit PIN Now
              </button>
              <button
                type="button"
                onClick={() => setIsPinRequiredNoticeOpen(false)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
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
