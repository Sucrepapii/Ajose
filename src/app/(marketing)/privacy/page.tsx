export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-[#FDFBF7] text-[#1F2937] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">Privacy Policy</h1>
        <p className="text-[#C5A059] font-bold tracking-wide uppercase text-sm mb-12 border-b border-gray-200 pb-4">
          Effective Date: August 25, 2026
        </p>

        <div className="prose prose-lg max-w-none text-[#1F2937]/90 marker:text-[#0B3022]">
          <p className="lead font-medium">
            This Privacy Policy sets out the statutory and operational framework under which [Ajo Circle Limited] ("Company", "We", "Us") collects, processes, stores, and transfers your personal and financial data. We are committed to strict compliance with the Nigeria Data Protection Act (NDPA) 2023 and the guidelines established by the Nigeria Data Protection Commission (NDPC).
          </p>
          <p className="font-semibold mt-4">
            Data Protection Officer (DPO): <a href="mailto:[Insert Email]" className="text-[#C5A059] hover:underline">[Insert Email]</a>
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">1. Open Banking Data Flows (Mono Integration)</h2>
          <p>
            1.1. <strong>Integration Nature:</strong> We utilize Mono, a licensed open-banking infrastructure provider, to securely interface with your primary financial institution. 
          </p>
          <p>
            1.2. <strong>Credential Security:</strong> The Company explicitly warrants that we do not view, process, transmit, or store your online banking passwords, personal identification numbers (PINs), or multifactor authentication tokens. Authentication occurs strictly via Mono’s secure API tokenization.
          </p>
          <p>
            1.3. <strong>Data Processed:</strong> Upon your explicit digital mandate, we pull and process the following data streams via Mono: financial account metadata, transactional history, and electronic bank statements. We process this data strictly for the purposes of Know Your Customer (KYC) verification, algorithmic risk scoring, and monitoring the disbursement/contribution lifecycle of your Ajo groups.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">2. NDPA Data Minimization vs. CBN Regulatory Retention</h2>
          <p>
            2.1. <strong>Statutory Conflict Resolution:</strong> The NDPA 2023 mandates the principle of data minimization and the prompt deletion of personal data when the original purpose of collection has been extinguished. However, as a CBN-licensed Payment Solution Service Provider (PSSP), we are concurrently bound by the Central Bank of Nigeria Anti-Money Laundering and Combating the Financing of Terrorism (AML/CFT) Regulations.
          </p>
          <p>
            2.2. <strong>Retention Period:</strong> In resolving this statutory overlap, we rely on the legal obligation basis for processing under the NDPA. Consequently, regardless of account closure or withdrawal of consent, all financial transaction data, identity verification records (BVN/NIN), and mandate logs shall be securely retained in our encrypted archives for a mandatory, non-negotiable period of <strong>five (5) years</strong> post-transaction, in strict accordance with CBN directives.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">3. Lawful Basis and Data Subject Rights</h2>
          <p>
            3.1. <strong>Processing Basis:</strong> We process your data based on: (a) explicit consent, (b) the performance of a contract (facilitating the Ajo cycle), and (c) compliance with a legal obligation (CBN regulations).
          </p>
          <p>
            3.2. <strong>Your Rights:</strong> Subject to the limitations set forth in Section 2.2, you retain the statutory right under the NDPA to request access to, rectification of, or restriction of processing concerning your personal data. Formal requests must be directed to our Data Protection Officer (DPO).
          </p>
        </div>
      </div>
    </main>
  );
}
