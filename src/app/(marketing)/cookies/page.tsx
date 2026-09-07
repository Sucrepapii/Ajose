export default function CookiePolicyPage() {
  return (
    <main className="flex-1 bg-[#FDFBF7] text-[#1F2937] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">Cookie Policy</h1>
        <p className="text-[#C5A059] font-bold tracking-wide uppercase text-sm mb-12 border-b border-gray-200 pb-4">
          Effective Date: August 25, 2026
        </p>

        <div className="prose prose-lg max-w-none text-[#1F2937]/90 marker:text-[#0B3022]">
          <p className="lead font-medium">
            This Cookie Policy details how [Àjọṣe Limited] ("We", "Us") employs cookies and tracking technologies across our digital infrastructure in compliance with the Nigeria Data Protection Act (NDPA) 2023.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">1. Definition of Cookies</h2>
          <p>
            1.1. Cookies are micro-data files deployed to your device's browser upon accessing the Platform. These files are structurally designed to remember your authentication state, device parameters, and usage telemetry.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">2. Categories of Cookies Deployed</h2>
          <ul className="list-disc pl-6 space-y-4">
            <li>
              <strong>Strictly Necessary Cookies:</strong> These are technically mandatory for the secure operation of the Platform. They govern cryptographic session management, PSSP infrastructure routing, and anti-fraud anomaly detection. Consent is not required for this category.
            </li>
            <li>
              <strong>Analytical/Performance Cookies:</strong> These allow us to quantify and analyze Platform traffic. They process anonymized telemetry to optimize our algorithms and user interfaces.
            </li>
            <li>
              <strong>Functionality Cookies:</strong> These recognize you upon your return to the Platform, enabling personalization of content (e.g., dashboard preferences, active Ajo group states).
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">3. Third-Party Integration and Tracking</h2>
          <p>
            3.1. <strong>Mono Authentication Elements:</strong> While authenticating financial institutions via Mono's open-banking widget, Mono may deploy proprietary strictly necessary cookies to securely maintain the connection bridge and validate the direct debit mandate. These elements are governed concurrently by Mono's regulatory privacy frameworks.
          </p>

          <h2 className="text-2xl font-bold text-[#0B3022] mt-10 mb-4">4. Consent and Management Mechanism</h2>
          <p>
            4.1. By continued utilization of the Platform following explicit acknowledgment of our cookie banner, you furnish statutory consent to the deployment of non-essential cookies.
          </p>
          <p>
            4.2. You reserve the right to revoke consent and manipulate cookie acceptances via your browser architecture. Be advised that systemic rejection of Strictly Necessary Cookies will irreparably degrade Platform functionality and may trigger automated security lockouts due to our PSSP security mandates.
          </p>
        </div>
      </div>
    </main>
  );
}
