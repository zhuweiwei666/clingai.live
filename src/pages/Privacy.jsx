export default function Privacy() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">Privacy Policy</h1>
        
        <div className="text-text-secondary mb-6">
          <p className="text-sm opacity-75">Last updated: {currentDate}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <p>
            ClingAI ("we", "our", "us") values your privacy. This Privacy Policy explains how we collect, use, and protect your information.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We may collect:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Account information (email, username)</li>
              <li>Usage data related to AI interactions</li>
              <li>Payment and subscription data handled securely by third-party processors (such as Paddle)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Provide and improve the Service</li>
              <li>Process subscriptions and payments</li>
              <li>Maintain security and prevent misuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cookies</h2>
            <p>
              We may use cookies to improve user experience and analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
            <p>
              We do not sell your personal information. Payment information is processed securely by Paddle or other payment providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Security</h2>
            <p>
              We implement reasonable measures to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p>
              You may request deletion of your account or data by contacting us at <a href="mailto:support@clingai.live" className="text-accent-pink hover:underline">support@clingai.live</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
            <p>
              If you have questions regarding this Privacy Policy, email us at: <a href="mailto:support@clingai.live" className="text-accent-pink hover:underline">support@clingai.live</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
