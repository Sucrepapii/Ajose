const fs = require('fs');
const content = fs.readFileSync('src/app/signup/page.tsx', 'utf8');

let newContent = content.replace(
  /} else if \(step === 2\) \{[\s\S]*?if \(!formData\.password \|\| !formData\.bvn\) \{/,
  `} else if (step === 2) {\n      if (!formData.password || !formData.bvn) {`
);

const handleNextBlockOld = `    } else if (step === 2) {
      if (!formData.password || !formData.bvn) {
        toast.error("Password and BVN are required.");
        return;
      }

      if (formData.bvn.length !== 11) {
        toast.error("BVN must be exactly 11 numeric digits.");
        return;
      }
      
      setIsSubmitting(true);
      const monoToastId = toast.loading("Checking identity uniqueness...");

      try {
        // 1. Pre-flight duplicate check for Phone, Email, and BVN
        const dupRes = await fetch("/api/auth/check-duplicates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            bvn: formData.bvn,
            ...(formData.nin ? { nin: formData.nin } : {})
          })
        });

        const dupData = await dupRes.json();
        if (!dupRes.ok || dupData.exists) {
          toast.error(dupData.error || "An account with these identity details already exists.", { id: monoToastId });
          setIsSubmitting(false);
          return;
        }

        toast.loading("Verifying BVN via Mono Identity API...", { id: monoToastId });

        // 2. Verify BVN with Mono API
        const verifyRes = await fetch("/api/mono/verify-identity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bvn: formData.bvn,
            ...(formData.nin ? { nin: formData.nin } : {}),
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone
          })
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || "Mono identity check failed.");
        }

        toast.success("Identity verified via Mono!", { id: monoToastId });

        // 3. Register user in Supabase

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone
            }
          }
        });

        if (authError) throw authError;
        
        // 4. Update user profile with verified status, phone, and initial credit score
        if (authData.user) {
          const profilePayload = {
            id: authData.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            bvn_verified: true,
            nin_verified: true,
            credit_score: 85,
            auto_sweep_enabled: true
          };

          const { error: upsertError } = await supabase
            .from('users')
            .update(profilePayload)
            .eq('id', authData.user.id);

          if (upsertError) {
            console.warn("User profile update warning:", upsertError.message);
          }

          // 5. Auto-join group if inviteCode or next parameter contains a group ID
          let targetGroupId = formData.inviteCode.trim();
          let nextUrlParams: URLSearchParams | null = null;
          if (!targetGroupId && typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const nextParam = searchParams.get('next');
            if (nextParam && nextParam.includes('/invite/')) {
              const parts = nextParam.split('/invite/');
              if (parts[1]) {
                const subParts = parts[1].split('?');
                targetGroupId = subParts[0];
                if (subParts[1]) {
                  nextUrlParams = new URLSearchParams(subParts[1]);
                }
              }
            }
          }

          if (targetGroupId) {
            try {
              const token = authData?.session?.access_token;
              const headers: Record<string, string> = { "Content-Type": "application/json" };
              if (token) {
                headers["Authorization"] = \`Bearer \${token}\`;
              }
              await fetch('/api/groups/join', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  groupId: targetGroupId,
                  userId: authData.user.id,
                  groupName: nextUrlParams?.get('name') ? decodeURIComponent(nextUrlParams.get('name')!) : undefined,
                  contributionAmount: nextUrlParams?.get('amount') ? parseInt(nextUrlParams.get('amount')!, 10) : undefined,
                  frequency: nextUrlParams?.get('freq') || undefined,
                  maxMembers: nextUrlParams?.get('members') ? parseInt(nextUrlParams.get('members')!, 10) : undefined,
                  minCreditScore: nextUrlParams?.get('score') ? parseInt(nextUrlParams.get('score')!, 10) : undefined
                })
              });
            } catch (joinErr) {
              console.error("Auto group join error on signup:", joinErr);
            }
          }
        }

        setStep(3); // Success Screen
        toast.success("Account created! Please check your email.");
      } catch (err: any) {
        toast.error(err.message || "Failed to create account. Try again.", { id: monoToastId });
      } finally {
        setIsSubmitting(false);
      }
    }`;

const handleNextBlockNew = `    } else if (step === 2) {
      if (!formData.password || !formData.bvn) {
        toast.error("Password and BVN are required.");
        return;
      }

      if (formData.bvn.length !== 11) {
        toast.error("BVN must be exactly 11 numeric digits.");
        return;
      }
      
      setIsSubmitting(true);
      const monoToastId = toast.loading("Checking identity uniqueness...");

      try {
        // 1. Pre-flight duplicate check
        const dupRes = await fetch("/api/auth/check-duplicates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            bvn: formData.bvn
          })
        });

        const dupData = await dupRes.json();
        if (!dupRes.ok || dupData.exists) {
          toast.error(dupData.error || "An account with these details already exists.", { id: monoToastId });
          setIsSubmitting(false);
          return;
        }

        toast.loading("Initiating BVN verification...", { id: monoToastId });

        // 2. Initiate BVN Verification via Mono OTP Flow
        const initRes = await fetch("/api/mono/bvn/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bvn: formData.bvn })
        });
        
        const initData = await initRes.json();
        
        if (!initRes.ok || !initData.success) {
          throw new Error(initData.error || "Failed to initiate BVN lookup.");
        }

        setSessionId(initData.sessionId);
        setMethods(initData.methods || []);
        setBvnStep("SELECT_METHOD");
        toast.success("BVN found. Please select where to receive your OTP.", { id: monoToastId });

      } catch (err: any) {
        toast.error(err.message || "Failed to initiate verification.", { id: monoToastId });
      } finally {
        setIsSubmitting(false);
      }
    }`;

newContent = newContent.replace(handleNextBlockOld, handleNextBlockNew);

const newMethods = `

  const handleRequestOtp = async (method: string) => {
    setIsSubmitting(true);
    const toastId = toast.loading(\`Sending OTP via \${method.replace("_", " ")}...\`);
    setSelectedMethod(method);

    try {
      const res = await fetch("/api/mono/bvn/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, method })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to send OTP.");
      }

      setBvnStep("VERIFY_OTP");
      toast.success(result.message || "OTP sent successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Verifying identity and creating account...");

    try {
      // 1. Verify OTP with Mono
      const res = await fetch("/api/mono/bvn/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId, 
          otp, 
          bvn: formData.bvn,
          phone: formData.phone
        })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to verify OTP.");
      }

      // 2. OTP verified! Now create the Supabase account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          }
        }
      });

      if (authError) throw authError;
      
      if (authData.user) {
        const profilePayload = {
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          bvn_verified: true,
          nin_verified: true,
          credit_score: 85,
          auto_sweep_enabled: true
        };

        const { error: upsertError } = await supabase
          .from('users')
          .update(profilePayload)
          .eq('id', authData.user.id);

        if (upsertError) {
          console.warn("User profile update warning:", upsertError.message);
        }

        let targetGroupId = formData.inviteCode.trim();
        let nextUrlParams: URLSearchParams | null = null;
        if (!targetGroupId && typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          const nextParam = searchParams.get('next');
          if (nextParam && nextParam.includes('/invite/')) {
            const parts = nextParam.split('/invite/');
            if (parts[1]) {
              const subParts = parts[1].split('?');
              targetGroupId = subParts[0];
              if (subParts[1]) {
                nextUrlParams = new URLSearchParams(subParts[1]);
              }
            }
          }
        }

        if (targetGroupId) {
          try {
            const token = authData?.session?.access_token;
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = \`Bearer \${token}\`;
            await fetch('/api/groups/join', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                groupId: targetGroupId,
                userId: authData.user.id,
                groupName: nextUrlParams?.get('name') ? decodeURIComponent(nextUrlParams.get('name')!) : undefined,
                contributionAmount: nextUrlParams?.get('amount') ? parseInt(nextUrlParams.get('amount')!, 10) : undefined,
                frequency: nextUrlParams?.get('freq') || undefined,
                maxMembers: nextUrlParams?.get('members') ? parseInt(nextUrlParams.get('members')!, 10) : undefined,
                minCreditScore: nextUrlParams?.get('score') ? parseInt(nextUrlParams.get('score')!, 10) : undefined
              })
            });
          } catch (joinErr) {
            console.error("Auto group join error on signup:", joinErr);
          }
        }
      }

      setStep(3); // Success Screen
      toast.success("Account created! Please check your email.", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Verification failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };
`;

newContent = newContent.replace('  const handleBack = () => {', newMethods + '  const handleBack = () => {');
newContent = newContent.replace('const [methods, setMethods] = useState<{method: string, hint: string}[]>([]);', 'const [methods, setMethods] = useState<{method: string, hint: string}[]>([]);\\n  const [selectedMethod, setSelectedMethod] = useState("");');

const uiFormOld = `                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Create Password</label>
                    <div className="relative">
                      <input 
                        name="password" value={formData.password} onChange={handleChange} 
                        type={showPassword ? "text" : "password"} placeholder="••••••••" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-bold text-gray-700">Bank Verification Number (BVN)</label>
                      {formData.bvn.length === 11 && (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 11 Digits Ready
                        </span>
                      )}
                    </div>
                    <input 
                      name="bvn" value={formData.bvn} onChange={handleChange} 
                      type="text" placeholder="Enter your 11-digit BVN" maxLength={11}
                      className={\`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors \${formData.bvn.length === 11 ? "border-emerald-400 focus:ring-emerald-600" : "border-gray-200 focus:ring-[#0B402B] focus:border-[#0B402B]"}\`}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      💡 Don&apos;t know your BVN? Dial <strong className="text-[#0B402B] font-mono">*565*0#</strong> on your registered bank phone line.
                    </p>
                  </div>
                </form>

                <div className="flex gap-4 pt-4">
                  <button onClick={handleBack} disabled={isSubmitting} className="px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1 py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-70 flex justify-center items-center"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-[#0B402B] border-t-transparent rounded-full animate-spin"></div> : "Create Your Account"}
                  </button>
                </div>
                
                <p className="mt-4 text-center text-xs text-gray-500">
                  By signing up, you agree to our <Link href="#" className="underline hover:text-gray-800">Terms of Service</Link>.
                </p>`;

const uiFormNew = `                {bvnStep === "INITIATE" && (
                  <>
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Create Password</label>
                        <div className="relative">
                          <input 
                            name="password" value={formData.password} onChange={handleChange} 
                            type={showPassword ? "text" : "password"} placeholder="••••••••" 
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-sm font-bold text-gray-700">Bank Verification Number (BVN)</label>
                          {formData.bvn.length === 11 && (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 11 Digits Ready
                            </span>
                          )}
                        </div>
                        <input 
                          name="bvn" value={formData.bvn} onChange={handleChange} 
                          type="text" placeholder="Enter your 11-digit BVN" maxLength={11}
                          className={\`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors \${formData.bvn.length === 11 ? "border-emerald-400 focus:ring-emerald-600" : "border-gray-200 focus:ring-[#0B402B] focus:border-[#0B402B]"}\`}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                          💡 Don&apos;t know your BVN? Dial <strong className="text-[#0B402B] font-mono">*565*0#</strong> on your registered bank phone line.
                        </p>
                      </div>
                    </form>

                    <div className="flex gap-4 pt-4">
                      <button onClick={handleBack} disabled={isSubmitting} className="px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="flex-1 py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-70 flex justify-center items-center"
                      >
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-[#0B402B] border-t-transparent rounded-full animate-spin"></div> : "Verify BVN"}
                      </button>
                    </div>
                    
                    <p className="mt-4 text-center text-xs text-gray-500">
                      By signing up, you agree to our <Link href="#" className="underline hover:text-gray-800">Terms of Service</Link>.
                    </p>
                  </>
                )}

                {bvnStep === "SELECT_METHOD" && (
                  <div className="space-y-4 animate-in fade-in">
                    <p className="text-sm font-medium text-gray-700 mb-2">Where should we send your OTP?</p>
                    {methods.map((m, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleRequestOtp(m.method)}
                        className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#C5A059] transition-all text-left flex items-start gap-4 disabled:opacity-50"
                      >
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          {m.method.includes("email") ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 capitalize">{m.method.replace("_", " ")}</p>
                          <p className="text-xs text-gray-500 mt-1">{m.hint}</p>
                        </div>
                      </button>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => setBvnStep("INITIATE")}
                      disabled={isSubmitting}
                      className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      Go Back
                    </button>
                  </div>
                )}

                {bvnStep === "VERIFY_OTP" && (
                  <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5 animate-in fade-in">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Enter OTP</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. 123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ""))}
                        className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] font-bold text-gray-900"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-lg rounded-lg transition-colors flex justify-center items-center disabled:opacity-70"
                    >
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-[#0B402B] border-t-transparent rounded-full animate-spin"></div> : "Create Your Account"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setBvnStep("SELECT_METHOD")}
                      disabled={isSubmitting}
                      className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      Choose a different method
                    </button>
                  </form>
                )}`;

newContent = newContent.replace(uiFormOld, uiFormNew);
fs.writeFileSync('src/app/signup/page.tsx', newContent);
