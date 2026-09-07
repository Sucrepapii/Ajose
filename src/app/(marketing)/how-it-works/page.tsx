import { UserPlus, Shield, Users, ArrowRightLeft, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Àjọṣe",
  description: "Learn how to use Àjọṣe to create, join, and manage your cooperative savings groups with complete transparency and security.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <UserPlus className="h-6 w-6 text-white" />,
      title: "1. Create an Account",
      description: "Sign up and create your secure Àjọṣe profile in less than 2 minutes.",
      align: "right"
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: "2. Verify Identity (BVN)",
      description: "We use Mono to securely verify your Bank Verification Number. This ensures everyone on the platform is a real, verified individual, protecting the pool from defaults.",
      align: "left"
    },
    {
      icon: <Users className="h-6 w-6 text-white" />,
      title: "3. Join or Create a Group",
      description: "Start your own 'Ajo' as an Admin and invite friends, or join a public group that matches your savings goals. Groups only start when fully funded.",
      align: "right"
    },
    {
      icon: <ArrowRightLeft className="h-6 w-6 text-white" />,
      title: "4. Automate Contributions",
      description: "Set up a secure direct debit mandate. When it's time to contribute, the funds are automatically swept from your account into the secure Ajo pool.",
      align: "left"
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-white" />,
      title: "5. Get Paid",
      description: "When it's your turn in the cycle, the entire pool is automatically disbursed directly to your verified bank account. No delays, no excuses.",
      align: "right"
    }
  ];

  return (
    <main className="flex-1 bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-[#0B3022] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059]/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-serif">
            How <span className="text-[#C5A059]">Àjọṣe</span> Works
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto font-medium">
            We've digitized the traditional African cooperative savings model, adding bank-grade security and complete automation.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-5xl relative">
          
          {/* Central Line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-1 bg-[#0B3022]/10 -translate-x-1/2 rounded-full"></div>

          <div className="space-y-12 md:space-y-24 relative">
            {steps.map((step, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row items-start md:items-center ${step.align === 'left' ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 w-14 h-14 bg-[#0B3022] rounded-full flex items-center justify-center -translate-x-1/2 border-4 border-[#FDFBF7] shadow-lg z-10">
                  {step.icon}
                </div>

                {/* Content Box */}
                <div className={`ml-20 md:ml-0 w-full md:w-1/2 ${step.align === 'left' ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow relative group overflow-hidden">
                    <div className={`absolute top-0 w-full h-1 bg-[#C5A059] left-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-${step.align}`}></div>
                    <h3 className="text-2xl font-black text-[#0B3022] mb-3">{step.title}</h3>
                    <p className="text-[#1F2937]/80 text-lg font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
