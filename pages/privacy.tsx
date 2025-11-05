/* pages/privacy.tsx */
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy • Move2Ibiza by Invenio Homes</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-3xl px-5 py-12 prose prose-slate">
          <h1>Privacy Policy</h1>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString("en-GB")}</p>

          <p>
            This Privacy Policy explains how <strong>Move2Ibiza</strong> (operated by
            <strong> INVENIO HOMES S.L.</strong>) collects and processes personal data when you visit
            our website or contact us. It complements our{" "}
            <a href="/legal">Legal Notice</a> and our Cookie Policy (below).
          </p>

          <h2>1. Data Controller</h2>
          <ul>
            <li><strong>Entity:</strong> INVENIO HOMES S.L. (“Invenio Homes”)</li>
            <li><strong>Trade name:</strong> Move2Ibiza by Invenio Homes</li>
            <li><strong>NIF:</strong> B16649519</li>
            <li>
              <strong>Registered office:</strong> C. San Lorenzo y Molins de Rei, 12, 07840 Santa
              Eulària des Riu, Spain
            </li>
            <li>
              <strong>Mercantile Registry:</strong> Tomo 351, Folio 159, IB-16453, inscripción 1
            </li>
            <li><strong>Email:</strong> contact@inveniohomes.com</li>
            <li><strong>Phone:</strong> +34 664 141 689</li>
            <li>
              <strong>Websites covered:</strong>{" "}
              <code>move2ibiza.com</code> (and staging e.g. <code>m2i-qjvb.vercel.app</code>)
            </li>
          </ul>

          <h2>2. What data we process</h2>
          <ul>
            <li>Identification and contact data (name, email, phone/WhatsApp).</li>
            <li>Property enquiry data (villa of interest, budget, dates, message).</li>
            <li>Technical data (IP, device/browser, basic analytics) and cookie identifiers if consented.</li>
            <li>Business correspondence and booking administration details.</li>
          </ul>

          <h2>3. Purposes & legal bases (GDPR)</h2>
          <ul>
            <li>
              <strong>Responding to enquiries / client service</strong> — performance of pre-contractual
              steps (Art. 6.1.b) and legitimate interest (Art. 6.1.f).
            </li>
            <li>
              <strong>Accountancy, invoicing, compliance</strong> — legal obligation (Art. 6.1.c).
            </li>
            <li>
              <strong>Marketing communications</strong> (e.g., follow-ups to your enquiry) — legitimate
              interest (Art. 6.1.f) or consent where required (Art. 6.1.a). You can opt-out anytime.
            </li>
            <li>
              <strong>Analytics & cookies</strong> — consent (Art. 6.1.a). Non-essential cookies only
              run if you accept them.
            </li>
          </ul>

          <h2>4. Retention</h2>
          <p>
            We keep enquiry records for up to 24 months or the period necessary to handle your request.
            Administrative/accounting records may be retained according to applicable laws
            (typically 5–6 years). Cookies persist for the period stated in the Cookie section.
          </p>

          <h2>5. Recipients & international transfers</h2>
          <p>
            We may share data with service providers that help us operate the website, CRM and
            communications (e.g., hosting, email, analytics, customer support). Where such providers
            are outside the EEA, we rely on adequacy decisions or standard contractual clauses.
            We never sell your personal data.
          </p>

          <h2>6. Your rights</h2>
          <p>
            You may exercise your rights of access, rectification, erasure, restriction, portability
            and objection by emailing <a href="mailto:contact@inveniohomes.com">contact@inveniohomes.com</a>.
            You can also lodge a complaint with the Spanish Data Protection Agency (AEPD).
          </p>

          <h2>7. Security</h2>
          <p>
            We apply appropriate technical and organisational measures to protect your data. However,
            no method of transmission or storage is 100% secure.
          </p>

          <h2>8. Cookies & trackers (summary)</h2>
          <p>
            We use essential cookies to run the site. Optional analytics/marketing cookies only run if
            you consent (see Cookie Policy below for details and management options).
          </p>

          <h2>9. Changes</h2>
          <p>
            We may update this policy to reflect legal or operational changes. Material changes will be
            announced on this page.
          </p>

          <hr />

          <h2 id="cookies">Cookie Policy</h2>
          <p>
            Cookies are small files placed on your device. We use: (i) <strong>essential cookies</strong>
            required for basic functions; and (ii) <strong>optional cookies</strong> (analytics/marketing)
            which only load with your consent.
          </p>

          <h3>Cookie categories</h3>
          <ul>
            <li><strong>Essential</strong> – required for navigation, session, security.</li>
            <li>
              <strong>Analytics (optional)</strong> – e.g., Google Analytics 4 to understand site use.
            </li>
            <li>
              <strong>Marketing (optional)</strong> – e.g., Meta Pixel to measure campaign performance.
            </li>
          </ul>

          <h3>Current cookies on Move2Ibiza</h3>
          <p>
            As of now, we only use essential cookies. If/when we enable GA4 or Meta Pixel, you will be
            asked for consent via a banner, and this section will list those cookies and durations.
          </p>

          <h3>Managing cookies</h3>
          <ul>
            <li>
              You can withdraw/modify consent via the cookie banner (when present) or by clearing cookies
              in your browser settings.
            </li>
            <li>
              You can also use browser settings to block third-party cookies globally.
            </li>
          </ul>

          <p>
            Questions about privacy or cookies? Email{" "}
            <a href="mailto:contact@inveniohomes.com">contact@inveniohomes.com</a>.
          </p>
        </section>
      </main>
    </>
  );
}
