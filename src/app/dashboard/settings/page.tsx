"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Lock, Save, Landmark } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  


  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
  });

  const [securityData, setSecurityData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  
  const [isSavingBank, setIsSavingBank] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('first_name, last_name, nickname, bank_name, account_number, account_name')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setProfileData({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            nickname: profile.nickname || "",
          });
          setBankData({
            bankName: profile.bank_name || "",
            accountNumber: profile.account_number || "",
            accountName: profile.account_name || "",
          });
        }
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          nickname: profileData.nickname,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSecurity(true);

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match.');
      setIsSavingSecurity(false);
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      setIsSavingSecurity(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: securityData.newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      setSecurityData({ newPassword: "", confirmPassword: "" }); // clear fields
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password.');
    } finally {
      setIsSavingSecurity(false);
    }
  };
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from('users')
        .update({
          bank_name: bankData.bankName,
          account_number: bankData.accountNumber,
          account_name: bankData.accountName,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Bank details updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update bank details.');
    } finally {
      setIsSavingBank(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your public profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <User className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Public Profile</h2>
          </div>
          
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  placeholder="John" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  placeholder="Doe" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nickname (Visible to Groups)</label>
              <input 
                type="text" 
                name="nickname"
                value={profileData.nickname}
                onChange={handleProfileChange}
                placeholder="JohnnyCash" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
              />
              <p className="text-xs text-zinc-500">This is what other members will see in the group roster.</p>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSavingProfile}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Lock className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Security</h2>
          </div>
          
          <form onSubmit={handleSaveSecurity} className="p-6 space-y-6">
            


            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={securityData.newPassword}
                  onChange={handleSecurityChange}
                  placeholder="••••••••" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={securityData.confirmPassword}
                  onChange={handleSecurityChange}
                  placeholder="••••••••" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSavingSecurity || !securityData.newPassword}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSavingSecurity ? (
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Bank Details Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden md:col-span-2 max-w-2xl mx-auto w-full">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Landmark className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Bank Details (For Payouts)</h2>
              <p className="text-sm text-zinc-500">Your group admin will use these details to send your payout.</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveBank} className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Bank Name</label>
                <input 
                  type="text" 
                  name="bankName"
                  value={bankData.bankName}
                  onChange={handleBankChange}
                  placeholder="Guaranty Trust Bank" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Account Number</label>
                <input 
                  type="text" 
                  name="accountNumber"
                  value={bankData.accountNumber}
                  onChange={handleBankChange}
                  placeholder="0123456789" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Account Name</label>
              <input 
                type="text" 
                name="accountName"
                value={bankData.accountName}
                onChange={handleBankChange}
                placeholder="John Doe" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSavingBank}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSavingBank ? (
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Bank Details
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
