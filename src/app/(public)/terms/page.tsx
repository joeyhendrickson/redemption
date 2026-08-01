import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = { title: "Terms of Service | Redemption Home Services" };

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated: August 1, 2026</p>

      <div className="mt-10 space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Agreement</h2>
          <p className="mt-3">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the {settings.companyName} website,
            service request forms, customer portal, and related services (collectively, the &ldquo;Services&rdquo;).
            By accessing our website, submitting a service request, or creating an account, you agree to these Terms
            and our{" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Our Services</h2>
          <p className="mt-3">
            {settings.companyName} provides handyman, maintenance, repair, and related property services in{" "}
            {settings.serviceArea}. Information on this website is for general purposes and does not guarantee that a
            specific service is available at your location or on a particular timeline until confirmed by us in writing
            or through an accepted estimate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Service Requests &amp; Accounts</h2>
          <p className="mt-3">
            By submitting a service request or creating an account, you agree to provide accurate and complete
            information, grant permission for us to contact you about your project, and accept estimate and scheduling
            terms provided by {settings.companyName}.
          </p>
          <p className="mt-3">
            You are responsible for maintaining the confidentiality of your account credentials and for activity that
            occurs under your account. Notify us promptly if you believe your account has been accessed without
            authorization.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Estimates, Pricing &amp; Payment</h2>
          <p className="mt-3">
            Estimates are based on the information you provide and our initial assessment. Final pricing may change if
            scope, materials, access, or site conditions differ from what was originally described. We will communicate
            material changes before proceeding when possible.
          </p>
          <p className="mt-3">
            Payment terms, accepted methods, and due dates will be provided with your estimate or invoice. Work may be
            paused or rescheduled if agreed payment terms are not met.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Scheduling &amp; Property Access</h2>
          <p className="mt-3">
            Appointment windows, arrival times, and project timelines are estimates unless explicitly confirmed
            otherwise. You agree to provide safe and reasonable access to the work area, including utilities, parking,
            and entry as needed to complete the requested services.
          </p>
          <p className="mt-3">
            If access is unavailable, conditions are unsafe, or undisclosed hazards are present, we may reschedule,
            limit scope, or decline work until the issue is resolved.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Communications</h2>
          <p className="mt-3">
            By submitting a request or creating an account, you consent to receive communications from us about your
            project by phone, email, text message, or through the customer portal. Message and data rates may apply
            depending on your carrier.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Emergency Review Requests</h2>
          <p className="mt-3">
            If you select &ldquo;Emergency Review,&rdquo; your request is flagged for priority review by our team. This
            does not constitute emergency service availability, guaranteed same-day response, or 24/7 on-call service
            unless explicitly confirmed by {settings.companyName} in direct communication with you.
          </p>
          <p className="mt-3">
            For life-threatening emergencies, property damage actively in progress, gas leaks, or other urgent safety
            hazards, contact appropriate emergency services or qualified professionals immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Customer Responsibilities</h2>
          <p className="mt-3">You agree to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Provide accurate property details, contact information, and project descriptions</li>
            <li>Disclose known hazards, restrictions, HOA rules, or permit requirements that may affect the work</li>
            <li>Secure pets, valuables, and sensitive areas as appropriate before our arrival</li>
            <li>Review and approve estimates, change orders, and scheduling confirmations in a timely manner</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Photos, Files &amp; Portal Content</h2>
          <p className="mt-3">
            You may upload photos and documents to help us assess your project. You represent that you have the right
            to share uploaded content and that it does not violate the rights of others. We use uploaded materials to
            evaluate, schedule, and perform services related to your request.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Cancellations &amp; Rescheduling</h2>
          <p className="mt-3">
            If you need to cancel or reschedule, please contact us as soon as possible. Repeated late cancellations,
            missed appointments, or failure to provide access may result in rescheduling fees or declined future
            bookings, as communicated at the time of scheduling.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Warranties &amp; Limitation of Liability</h2>
          <p className="mt-3">
            We stand behind our workmanship as described in your estimate or job documentation. Except where required
            by law, {settings.companyName} is not liable for indirect, incidental, special, or consequential damages
            arising from use of the website or services.
          </p>
          <p className="mt-3">
            To the fullest extent permitted by law, our total liability for any claim related to the Services is limited
            to the amount you paid for the specific service giving rise to the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">12. Website Use</h2>
          <p className="mt-3">
            You agree not to misuse the website or portal, attempt unauthorized access, interfere with site operation,
            or submit false, misleading, or abusive content. We may suspend or terminate access that violates these
            Terms or creates risk for our team or other customers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">13. Changes to These Terms</h2>
          <p className="mt-3">
            We may update these Terms from time to time. The updated version will be posted on this page with a revised
            date. Continued use of the Services after changes are posted constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">14. Contact</h2>
          <p className="mt-3">
            Questions about these Terms may be directed to {settings.companyName} at{" "}
            <a href={`mailto:${settings.email}`} className="text-foreground underline underline-offset-4">
              {settings.email}
            </a>{" "}
            or {settings.phone}.
          </p>
        </section>
      </div>
    </div>
  );
}
