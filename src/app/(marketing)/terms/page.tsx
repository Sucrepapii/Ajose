export default function TermsOfServicePage() {
  return (
    <main className="flex-1 bg-[#FDFBF7] text-[#1F2937] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">Terms of Service</h1>
        <p className="text-[#C5A059] font-bold tracking-wide uppercase text-sm mb-12 border-b border-gray-200 pb-4">
          Effective Date: August 25, 2026
        </p>

        <div className="prose prose-lg max-w-none text-[#1F2937]/90 marker:text-[#0B3022]">
          <p className="lead font-medium">
            This Terms of Service Agreement ("Agreement") constitutes a legally binding commercial contract between you ("User", "Customer", or "Member") and [Àjọṣe Limited / RC Number] ("Company", "We", "Us", or "Our"), the operator of the Àjọṣe application ("Platform").
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">1. Definitions and Interpretation</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>"Ajo Pot"</strong> means the collective funds contributed by a group of Users for cyclical disbursement.</li>
            <li><strong>"CBN"</strong> means the Central Bank of Nigeria.</li>
            <li><strong>"Paylode"</strong> refers to Paylode Services Limited, the licensed Payment Solution Service Provider (PSSP) powering payment gateways, card debits, switching, and settlement infrastructure for the Platform.</li>
            <li><strong>"Mono"</strong> refers to our integrated open-banking and direct debit infrastructure partner.</li>
            <li><strong>"PSSP"</strong> means Payment Solution Service Provider licensed and regulated by the Central Bank of Nigeria (CBN).</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">2. Licensing Framework and Operational Capacity</h2>
          <p>
            2.1. <strong>Payment Infrastructure &amp; Licensing:</strong> Payment processing, debit switching, card transactions, and automated settlement infrastructure on Àjọṣe are powered by <strong>Paylode Services Limited</strong>, operating under a Payment Solution Service Provider (PSSP) license issued and regulated by the Central Bank of Nigeria (CBN). Àjọṣe Technologies Ltd. provides non-custodial rotating credit software. We are <strong>not</strong> a licensed commercial bank, nor are we a deposit-taking Mobile Money Operator (MMO).
          </p>
          <p>
            2.2. <strong>Fund Escrow:</strong> We do not hold, absorb, or leverage User deposits. All customer funds ("Ajo Pots") are securely routed, settled, and escrowed exclusively via regulated commercial partner banks in strict compliance with CBN client-fund segregation guidelines.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">3. Mono Direct Debit and Mandate Authorization</h2>
          <p>
            3.1. <strong>Continuous Mandate:</strong> By linking your primary bank account to the Platform via Mono, you hereby grant an irrevocable, continuous direct debit mandate authorizing Us to automatically deduct your scheduled Ajo contributions on the agreed dates.
          </p>
          <p>
            3.2. <strong>User Liability:</strong> You bear absolute legal and financial liability for any revoked mandates, deliberately emptied bank accounts, or otherwise willfully failed automated debits. The revocation of a Mono mandate while you have an outstanding obligation to an active Ajo cycle constitutes a material breach of this Agreement and prima facie evidence of intent to defraud the group.
          </p>
          <p>
            3.3. <strong>Failed Auto-Debit Protocol & Non-Custodial Direct Settlement:</strong> In the event that a scheduled automated Mono direct debit sweep fails or is declined by your issuing bank (due to insufficient funds, temporary network downtime, or bank limits), <strong>you must NOT attempt to remit payment to Àjọṣe corporate or central accounts</strong>. Àjọṣe operates strictly as a non-custodial technology platform and does not accept, custody, or escrow group pool deposits. To prevent default penalties and protect your credit score, you must immediately settle the outstanding contribution by initiating a direct bank transfer to the <strong>Circle Admin's Tendered Settlement Account</strong> citing your unique circle Narration Code. Once the deposit matches on the Admin's bank statement via Mono or is confirmed by the Admin, the contribution ledger will be credited.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">4. Default, Indemnity, and Recovery Mechanisms</h2>
          <p>
            4.1. <strong>Platform Indemnity:</strong> We process transactions but do not absorb peer-to-peer credit risk. You hereby indemnify and hold harmless the Company against any losses arising from the failure of fellow group members to fulfill their financial obligations. 
          </p>
          <p>
            4.2. <strong>Default Remedies:</strong> In the event that a User receives an Ajo Pot disbursement and subsequently fails a scheduled Mono direct debit or attempts to evade repayment, We reserve the right to immediately execute the following legal remedies without further recourse:
          </p>
          <ul className="list-decimal pl-6 space-y-2 mt-2">
            <li>Immediate and permanent blacklisting from the Platform and affiliated PSSP networks.</li>
            <li>Reporting of the default and the User's BVN/NIN to the National Credit Identity database and licensed Credit Bureaus in Nigeria.</li>
            <li>Sharing of the User's identity, transactional data, and mandate records with lawful, licensed debt collection agencies and law enforcement for the purpose of asset recovery and criminal prosecution.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">5. Mid-Cycle Exits, Cancellation, and 15% Early Departure Fine</h2>
          <p>
            5.1. <strong>Pre-Cycle Modifications:</strong> Prior to the formal activation of an Ajo cycle (status: "pending"), the Group Admin may add or remove participants at will, and members may freely opt out without penalty, fine, or credit impact.
          </p>
          <p>
            5.2. <strong>Mandatory 15% Exit Fine:</strong> Once an Ajo cycle is launched and active, any member who leaves, requests premature withdrawal, or is removed for non-cooperation disrupts the collective rotational liquidity and is legally subject to an early departure fine of <strong>15% of their scheduled contribution amount</strong>. This fine is strictly apportioned as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>10% to the Group Admin:</strong> Compensating the Admin trustee for administrative restructuring, managing collection shortfalls, and onboarding a replacement member.</li>
            <li><strong>5% to Àjọṣe:</strong> Covering platform open-banking ledger reconciliation, mandate re-routing, and infrastructure management.</li>
          </ul>
          <p className="mt-3">
            5.3. <strong>Members Awaiting Payout (Must Wait Their Turn):</strong> If an exiting member has not yet received their Ajo Pot disbursement, <strong>they are strictly required to wait until their originally scheduled payout turn</strong> to collect their past contributions. Under no circumstances will early or accelerated disbursements be made. On their scheduled turn, their accumulated past contributions will be credited minus the mandatory 15% fine (10% to Admin, 5% to Àjọṣe).
          </p>
          <p>
            5.4. <strong>Members Who Have Already Collected (Immediate Fine & Mandate Enforcement):</strong> A member who has already collected their rotational Ajo Pot has received other members' funds and is legally prohibited from absconding. If such a member attempts to exit or fails scheduled payments, <strong>they must pay the 15% fine immediately</strong> in addition to their full remaining contribution obligations. Their continuous Mono Direct Debit mandate remains fully enforceable, and failure to fulfill remaining debits constitutes an immediate default event subject to credit bureau reporting and debt recovery under Section 4.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">6. Dispute Resolution and Governing Law</h2>
          <p>
            6.1. <strong>Governing Law:</strong> This Agreement, and any non-contractual obligations arising out of or in connection with it, shall be governed by, and construed in accordance with, the laws of the Federal Republic of Nigeria.
          </p>
          <p>
            6.2. <strong>Mandatory Arbitration:</strong> Any dispute, controversy, or claim arising out of or relating to this Agreement, including the breach, termination, or invalidity thereof, shall be settled by mandatory, binding arbitration at the Lagos Multi-Door Courthouse (LMDC) in Lagos, Nigeria, prior to the commencement of any litigation. The arbitration shall be conducted by a single arbitrator appointed in accordance with the LMDC Rules.
          </p>
        </div>
      </div>
    </main>
  );
}
