import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl animate-fade-in-up px-4 py-12 motion-reduce:animate-none sm:py-16">
        <Link
          href="/help"
          className="text-sm font-medium text-maple underline-offset-2 hover:underline"
        >
          ← Help center
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-charcoal">
          Terms &amp; privacy
        </h1>
        <p className="mt-2 text-sm text-charcoal/65">
          Plain-language summary. This is not a substitute for professional
          legal advice.
        </p>

        <article className="mt-10 max-w-none text-charcoal/85">
          <h2 className="text-lg font-semibold text-charcoal">Terms of use</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              The marketplace, reviews, and economic reports are provided “as
              is” for informational purposes.
            </li>
            <li>
              AI-generated reports may be wrong or incomplete. Always verify
              important decisions with your own advisors.
            </li>
            <li>
              You are responsible for the accuracy of information you enter in
              your business profile and product listings.
            </li>
            <li>
              We may change or discontinue features to improve safety,
              reliability, or compliance.
            </li>
          </ul>

          <h2 className="mt-10 text-lg font-semibold text-charcoal">
            Privacy (summary)
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              We store account credentials and business data in the application
              database to provide the service.
            </li>
            <li>
              When you use AI report generation, article text and your profile
              context are sent to the configured AI provider to produce a
              response.
            </li>
            <li>
              We do not sell your personal data. Use a strong password and
              protect access to your account.
            </li>
            <li>
              For regional privacy rights (e.g. GDPR, PIPEDA), contact your
              deployment operator or administrator.
            </li>
          </ul>

          <h2 className="mt-10 text-lg font-semibold text-charcoal">
            Disclaimers
          </h2>
          <p className="mt-3 leading-relaxed">
            Economic alerts and reports are informational signals only and do
            not constitute financial, investment, tax, or legal advice.
          </p>
        </article>
      </div>
    </div>
  );
}
