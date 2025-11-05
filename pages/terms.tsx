export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-serif font-semibold mb-4">Terms & Conditions</h1>

      <section className="text-slate-600 leading-relaxed space-y-6">

        <p>
          These Terms and Conditions (“Terms”) govern the use of the website
          <strong> move2ibiza.com </strong> (the “Website”), operated by
          <strong> Invenio Homes S.L. </strong> (“Move2Ibiza”, “we”, “our”, or “us”),
          with fiscal address at C. San Lorenzo y Molins de Rei, 12, 07840 Santa Eulària des Riu,
          Ibiza, Spain (CIF B16649519).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Purpose</h2>
        <p>
          The purpose of this Website is to provide information about villas, apartments,
          and other real estate properties available for seasonal or annual rental,
          as well as for sale, in the Balearic Islands. Move2Ibiza acts as an intermediary
          between property owners and users, providing verified property information and
          facilitating introductions and inquiries through the platform.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">2. Acceptance of Terms</h2>
        <p>
          By accessing or using this Website, you agree to these Terms, our
          <a href="https://www.iubenda.com/privacy-policy/91895404" target="_blank" rel="noopener noreferrer" className="underline">
            {" "}Privacy Policy
          </a>, and our
          <a href="https://www.iubenda.com/privacy-policy/91895404/cookie-policy" target="_blank" rel="noopener noreferrer" className="underline">
            {" "}Cookie Policy
          </a>. If you do not agree, you must refrain from using the Website.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">3. Services</h2>
        <p>
          Move2Ibiza provides a curated portfolio of properties for short-term and long-term rental,
          as well as for sale, through its network of verified partners and agents. We do not act as
          a direct rental agency unless explicitly stated. Property availability, pricing, and conditions
          are provided by the respective property owners or agents.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">4. Booking and Inquiries</h2>
        <p>
          All property inquiries submitted through this Website are non-binding. Rental agreements,
          booking confirmations, and payments are always handled directly between the client and
          the property owner, agent, or Invenio Homes S.L. (when applicable). Move2Ibiza cannot be held
          responsible for any discrepancies in property descriptions, availability, or contractual arrangements
          outside of its control.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">5. Property Information</h2>
        <p>
          We make every effort to ensure that property descriptions, photos, and details displayed on
          this Website are accurate and up to date. However, minor variations may occur, and Move2Ibiza
          accepts no liability for any temporary inaccuracies, changes made by owners, or errors in data
          provided by third parties.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">6. Intellectual Property</h2>
        <p>
          All content on this Website — including text, images, graphics, logos, and layout — is the
          intellectual property of Move2Ibiza or its licensors. It may not be copied, distributed, or
          reused without prior written consent.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">7. Limitation of Liability</h2>
        <p>
          Move2Ibiza is not responsible for any damages or losses arising from:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>Errors or omissions in property information.</li>
          <li>Availability or condition of properties.</li>
          <li>Actions, negligence, or misrepresentations of property owners or third-party agents.</li>
          <li>Interruptions or technical issues with the Website.</li>
        </ul>

        <p>
          Our liability is limited to the fullest extent permitted by law. Users are responsible for
          verifying the accuracy and suitability of any property before making commitments.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">8. External Links</h2>
        <p>
          This Website may include links to external sites for user convenience. Move2Ibiza does not
          endorse or control these third-party sites and assumes no responsibility for their content,
          accuracy, or privacy practices.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">9. Data Protection</h2>
        <p>
          Personal data collected through the Website is processed in compliance with the EU General Data
          Protection Regulation (GDPR) and applicable Spanish law. For detailed information, please consult our
          <a href="https://www.iubenda.com/privacy-policy/91895404" target="_blank" rel="noopener noreferrer" className="underline">
            {" "}Privacy Policy
          </a>.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">10. Applicable Law and Jurisdiction</h2>
        <p>
          These Terms are governed by Spanish law. Any dispute arising from the use of this Website
          shall be submitted to the exclusive jurisdiction of the courts of Ibiza, Spain.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">11. Contact</h2>
        <p>
          For any inquiries related to these Terms or your use of the Website, you may contact us at:
        </p>
        <p className="text-slate-500">
          INVENIO HOMES S.L. <br />
          C. San Lorenzo y Molins de Rei, 12, 07840 Santa Eulària des Riu, Ibiza, Spain <br />
          CIF B16649519 <br />
          Email: contact@inveniohomes.com <br />
          Phone: +34 664 141 689
        </p>

        <p className="mt-10 text-sm text-slate-400">
          Last updated: {new Date().getFullYear()}
        </p>
      </section>
    </main>
  );
}
