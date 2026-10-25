import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, Users, AlertTriangle, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Àjọṣe",
  description: "Read the commercial Terms of Service and contractual guidelines governing the use of the Àjọṣe rotational thrift platform.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <main className="flex-1 bg-[#FDFBF7] text-[#1F2937] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">Terms of Service</h1>
        <p className="text-[#C5A059] font-bold tracking-wide uppercase text-sm mb-10 border-b border-gray-200 pb-4">
          Effective Date: October 25, 2026
        </p>

        {/* Core Principles & Important Notice Callout */}
        <div className="bg-white border-2 border-[#C5A059]/40 rounded-2xl p-6 md:p-8 shadow-sm mb-12 space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-[#0B3022]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B3022] tracking-tight">Core Principles &amp; Important Notice</h2>
              <p className="text-xs text-[#1F2937]/70 font-medium">Please read these key terms carefully before creating or joining an Ajo group.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-[#1F2937]">
            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0B3022] text-sm">
                <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
                1. Management Platform Only
              </div>
              <p className="text-[#1F2937]/80">
                Àjọṣe provides technology and software tools to make Ajo management easier, automated, and more transparent. Àjọṣe is <strong>not</strong> a bank, lender, trustee, escrow custodian, or guarantor of group funds.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0B3022] text-sm">
                <Users className="h-4 w-4 text-[#0B3022]" />
                2. Admin Sole Responsibility
              </div>
              <p className="text-[#1F2937]/80">
                The Ajo Admin creates, owns, and manages their group. The Admin takes full responsibility for managing all contributions, vetting participants, tracking collections, and administering circle rules.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0B3022] text-sm">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                3. Know Your Admin First
              </div>
              <p className="text-[#1F2937]/80">
                Anyone joining an Ajo group <strong>must make sure they personally know and trust the Ajo Admin well</strong> before committing funds. Participation in any group is strictly at your own discretion and risk.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0B3022] text-sm">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                4. No Platform Liability
              </div>
              <p className="text-[#1F2937]/80">
                <strong>Àjọṣe will not be responsible or liable for late or unpaid contributions.</strong> We do not absorb peer-to-peer credit risk. Any collection recovery or disputes remain strictly between members and their Ajo Admin.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Legal Contract */}
        <div className="prose prose-lg max-w-none text-[#1F2937]/90 marker:text-[#0B3022]">
          <p className="lead font-medium">
            This Terms of Service Agreement (&quot;Agreement&quot;) constitutes a legally binding commercial contract between you (&quot;User&quot;, &quot;Admin&quot;, &quot;Contributor&quot;, or &quot;Member&quot;) and Ajose Technologies (&quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;), the operator of the Àjọṣe web and mobile application (&quot;Platform&quot;).
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">1. Definitions and Interpretation</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>&quot;Ajo Admin&quot;</strong> or <strong>&quot;Circle Organizer&quot;</strong> means the individual User who creates, initiates, configures, and manages a rotational savings group on the Platform.</li>
            <li><strong>&quot;Member&quot;</strong> or <strong>&quot;Contributor&quot;</strong> means any individual User who accepts an invitation to join an Ajo group and commits to making rotational contributions.</li>
            <li><strong>&quot;Ajo Pot&quot;</strong> means the collective rotational funds contributed by Members of a group for disbursement to the turn collector.</li>
            <li><strong>&quot;Platform&quot;</strong> means the software, website, mobile application, APIs, and automated management services provided by Àjọṣe Technologies.</li>
            <li><strong>&quot;Mono&quot;</strong> refers to our integrated licensed open-banking and direct debit infrastructure partner.</li>
            <li><strong>&quot;NIBSS&quot;</strong> means the Nigeria Inter-Bank Settlement System.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">2. Nature of the Platform &amp; Limited Technological Role</h2>
          <p>
            2.1. <strong>Software Management Platform Only:</strong> Àjọṣe is a digital management platform that provides technological tools—such as open-banking direct debit scheduling, rotational turn tracking, automated reminder messaging, and transaction bookkeeping—to make traditional Ajo / Esusu / Adashe rotational savings easier to administer.
          </p>
          <p>
            2.2. <strong>No Banking or Fiduciary Capacity:</strong> Àjọṣe Technologies is <strong>not</strong> a bank, finance house, mortgage institution, credit bureau, money lender, or deposit-taking institution. We do not solicit public deposits, provide interest on pooled funds, grant loans, or provide financial advisory services.
          </p>
          <p>
            2.3. <strong>Fund Movement Architecture:</strong> Contributions are debited from the contributor&apos;s bank account via Mono on the scheduled cycle date. Once processed through the settlement network into the group settlement structure, funds are routed to the member whose turn it is to collect. Àjọṣe does not hold custody of group funds or act as an escrow agent.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">3. Ajo Admin Authority &amp; Full Management Responsibility</h2>
          <p>
            3.1. <strong>Admin Ownership of Circles:</strong> Each Ajo group formed on the Platform is created, organized, and managed exclusively by its Ajo Admin. The Ajo Admin takes full legal, operational, and managerial responsibility for their circle.
          </p>
          <p>
            3.2. <strong>Admin Obligations:</strong> The Ajo Admin expressly acknowledges and agrees that they are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Setting the circle contribution amount, frequency, number of members, payout order, and circle rules.</li>
            <li>Vetting, inviting, and approving all members joining their circle.</li>
            <li>Actively monitoring member payments, following up on delayed or failed debits, and managing circle communication.</li>
            <li>Providing a valid, compliant settlement account for rotational fund distribution and ensuring turn collectors receive their payouts promptly.</li>
            <li>Resolving any payment disputes, handling replacements for exiting members, and enforcing rotational commitment among group participants.</li>
          </ul>
          <p className="mt-3">
            3.3. <strong>Independent Fiduciary Relationship:</strong> The relationship between an Ajo Admin and the members of their circle is a direct peer-to-peer contractual relationship. Àjọṣe merely supplies the management software enabling that relationship and does not supervise, control, or guarantee the Admin&apos;s conduct or decisions.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">4. Member Due Diligence: &quot;Know Your Admin&quot; Obligation</h2>
          <p>
            4.1. <strong>Mandatory Personal Verification:</strong> <strong>Anyone joining an Ajo group must ensure they personally know, have verified, and trust the Ajo Admin well before committing funds.</strong> You must not join a group organized by a stranger, unverified party, or anonymous online entity.
          </p>
          <p>
            4.2. <strong>Assumption of Risk:</strong> By accepting an invite and joining a group, you acknowledge that you have independently vetted the Ajo Admin and your fellow contributors. You join the circle entirely at your own discretion, choice, and risk.
          </p>
          <p>
            4.3. <strong>Continuous Mandate Commitment:</strong> By linking your primary bank account via Mono, you grant a continuous direct debit mandate authorizing automatic deductions of your agreed contribution on each scheduled turn. You commit to keeping your bank account sufficiently funded prior to each scheduled contribution date.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">5. Disclaimer of Warranties &amp; Platform Non-Liability for Contributions</h2>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 my-6 text-sm text-[#1F2937] leading-relaxed">
            <strong className="text-red-700 block text-base mb-1">IMPORTANT DISCLAIMER OF FINANCIAL LIABILITY</strong>
            Àjọṣe Technologies provides management software on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Àjọṣe does not underwrite, guarantee, insure, or indemnify any member&apos;s contributions, turns, or payouts. 
          </div>
          <p>
            5.1. <strong>No Liability for Late or Unpaid Contributions:</strong> <strong>Àjọṣe will not be responsible or liable under any circumstances for late, delayed, defaulted, failed, or unpaid contributions by any member.</strong>
          </p>
          <p>
            5.2. <strong>Exclusion of Damages:</strong> Without limiting the generality of the foregoing, Àjọṣe shall have zero legal or financial liability for:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Any member defaulting on their rotational obligation, revoking a direct debit mandate, or absconding after receiving a payout.</li>
            <li>Delays or failures in bank sweep transactions resulting from insufficient funds, bank network outages, card expiration, or limits imposed by issuing banks.</li>
            <li>Any act, omission, delay, dishonesty, negligence, or breach of trust committed by an Ajo Admin or turn collector.</li>
            <li>Any financial losses, opportunity costs, reputational injury, or peer-to-peer disputes occurring between members and their Ajo Admin.</li>
          </ul>
          <p className="mt-3">
            5.3. <strong>Comprehensive Indemnification:</strong> You hereby release, indemnify, defend, and hold harmless Àjọṣe Technologies, its directors, officers, employees, agents, and technology infrastructure partners from and against any and all claims, liabilities, losses, costs, expenses, or damages arising out of or related to late or unpaid contributions, member default, or disputes within your Ajo circle.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">6. Member Default, Sanctions &amp; Debt Recovery</h2>
          <p>
            6.1. <strong>Direct Peer Recourse:</strong> Because all group contributions belong to the circle, any failure by a member to pay their contribution constitutes a debt owed directly to the Ajo circle and its members, enforceable by the Ajo Admin under the applicable civil and commercial laws of Nigeria.
          </p>
          <p>
            6.2. <strong>Platform Remedial Actions:</strong> Where a member defaults on a scheduled contribution or revokes a mandate mid-cycle, Àjọṣe reserves the technological right to:
          </p>
          <ul className="list-decimal pl-6 space-y-2 mt-2">
            <li>Immediately suspend the defaulting User&apos;s account and bar them from joining or creating any future circles across the Platform.</li>
            <li>Downgrade the User&apos;s platform Trust Score and record the default in the internal risk register.</li>
            <li>Provide lawful transactional audit logs and mandate history to the Ajo Admin, authorized debt recovery agents, credit bureaus, or law enforcement agencies in connection with formal recovery actions or fraud investigations.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">7. Mid-Cycle Exits, Cancellation, and Agreed Departure Fees</h2>
          <p>
            7.1. <strong>Pre-Activation Phase:</strong> While a group is in &quot;pending&quot; status (before the circle is officially launched), members may freely withdraw or adjust their participation without financial penalty.
          </p>
          <p>
            7.2. <strong>Agreed Administrative Departure Fee (15%):</strong> Once an Ajo circle is launched and active, any member who leaves prematurely, requests early withdrawal, or is removed for non-cooperation disrupts rotational liquidity and agrees to an administrative departure fee of <strong>15% of their scheduled contribution amount</strong>, apportioned as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>10% to Àjọṣe:</strong> Covering platform open-banking ledger reconciliation, mandate re-routing, and infrastructure management.</li>
            <li><strong>5% to the Ajo Admin:</strong> Compensating the Admin trustee for administrative restructuring, managing collection shortfalls, and onboarding a replacement member.</li>
          </ul>
          <p className="mt-3">
            7.3. <strong>Members Awaiting Payout (Must Wait Their Turn):</strong> If an exiting member has not yet received their rotational Ajo Pot payout, <strong>they are strictly required to wait until their originally scheduled payout turn</strong> to collect their past contributions. Under no circumstances will early or accelerated lump-sum cashouts be processed. On their scheduled turn, their accumulated past contributions will be credited minus the mandatory 15% fine.
          </p>
          <p className="mt-3">
            7.4. <strong>Members Who Have Already Collected (Immediate Fine &amp; Enforceability):</strong> A member who has already collected their rotational Ajo Pot has received other members&apos; funds and is legally prohibited from absconding. If such a member attempts to exit or fails scheduled payments, <strong>they must pay the 15% fine immediately</strong> in addition to fulfilling all remaining contribution obligations. Their Mono direct debit mandate remains fully enforceable.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">8. Dispute Resolution and Governing Law</h2>
          <p>
            8.1. <strong>Governing Law:</strong> This Agreement shall be governed by, and construed in accordance with, the laws of the Federal Republic of Nigeria.
          </p>
          <p>
            8.2. <strong>Mandatory Arbitration:</strong> Any dispute, controversy, or claim arising out of or relating to this Agreement, or the breach, termination, or invalidity thereof, shall be settled by mandatory, binding arbitration at the Lagos Multi-Door Courthouse (LMDC) in Lagos, Nigeria, prior to the commencement of any litigation. The arbitration shall be conducted by a single arbitrator appointed in accordance with the LMDC Rules.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">9. Contact and Legal Inquiries</h2>
          <p>
            For any questions, legal notices, or clarifications regarding these Terms of Service, please contact our legal and support team at:
          </p>
          <p className="font-semibold mt-2">
            Ajose Technologies<br />
            Email: <a href="mailto:ajoseapp@gmail.com" className="text-[#C5A059] hover:underline font-bold">ajoseapp@gmail.com</a><br />
            Website: <Link href="/" className="text-[#0B3022] hover:underline">https://ajose.ng</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
