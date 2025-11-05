/* pages/legal.tsx */
import Head from "next/head";

export default function LegalNotice() {
  return (
    <>
      <Head>
        <title>Legal Notice • Move2Ibiza by Invenio Homes</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-3xl px-5 py-12 prose prose-slate">
          <h1>Legal Notice</h1>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString("en-GB")}</p>

          <p>
            In compliance with Article 10 of Law 34/2002, of July 11, on Information Society Services
            and Electronic Commerce (LSSICE), the following information identifies the owner of this website.
          </p>

          <h2>Owner / Data Controller</h2>
          <ul>
            <li><strong>Company:</strong> INVENIO HOMES S.L.</li>
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
              <strong>Domain:</strong> move2ibiza.com (incl. staging subdomains such as
              m2i-qjvb.vercel.app)
            </li>
          </ul>

          <h2>Purpose of the Website</h2>
          <p>
            The Move2Ibiza website provides information about long-term rentals in Ibiza, including
            properties, prices, availability on request, contact details and general information
            about our services. It may also include editorial content relevant to the sector.
          </p>

          <h2>Terms of Use & Liability</h2>
          <ul>
            <li>
              By accessing this website, the user accepts these terms, without prejudice to more
              specific conditions that may apply to certain services.
            </li>
            <li>
              The content is for information only and does not constitute legal or professional advice.
            </li>
            <li>
              We strive for continuous availability and accuracy; however, we do not guarantee
              uninterrupted, error-free operation and are not responsible for damages arising from
              improper use, outages, force majeure or third-party actions.
            </li>
            <li>
              We reserve the right to modify content or the present notice without prior notice,
              with publication on this site constituting sufficient notice.
            </li>
          </ul>

          <h2>Intellectual and Industrial Property</h2>
          <p>
            Designs, logos, images, text and other content are owned by Invenio Homes or used with
            permission. Any reproduction, distribution, public communication or transformation beyond
            what is permitted by law requires prior written authorization.
          </p>

          <h2>Links to Third-Party Sites</h2>
          <p>
            External links are provided for convenience. Invenio Homes does not commercialize
            third-party products/services referenced through links and assumes no responsibility for
            their content or legality. We will remove any link to unlawful content upon notice.
          </p>

          <h2>Applicable Law and Jurisdiction</h2>
          <p>
            The official language for this notice is Spanish. The relationship between the user and
            Invenio Homes is governed by Spanish law. For any dispute, the parties submit to the
            Courts and Tribunals of Ibiza, Spain, unless mandatory consumer law provides otherwise.
          </p>

          <p>
            For information on personal data processing, please see our{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </section>
      </main>
    </>
  );
}
