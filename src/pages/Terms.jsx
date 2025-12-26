export default function Terms() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">Terms of Service</h1>
        
        <div className="text-text-secondary mb-6">
          <p className="text-sm opacity-75">Last updated: {currentDate}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <p>
            Welcome to ClingAI. By accessing or using our website, mobile application, or any services provided by ClingAI ("the Service"), you agree to be bound by these Terms of Service.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Use of Service</h2>
            <p>
              You agree to use the Service only for lawful purposes and in compliance with all applicable laws and regulations. You may not misuse or attempt to interfere with the proper functioning of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account and all activities that occur under your account. You must provide accurate and complete information when creating an account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Subscription & Payments</h2>
            <p>
              Some features of the Service require payment. By subscribing, you authorize us or our payment processors (such as Paddle) to charge your selected payment method. Subscription plans renew automatically unless canceled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Refund Policy</h2>
            <p>
              Refund requests are handled according to our Refund Policy available at <a href="/refund" className="text-accent-pink hover:underline">/refund</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Content and Usage</h2>
            <p>
              ClingAI provides AI-powered image and video generation services. You agree not to use the Service to generate harmful, illegal, abusive, or non-consensual content. All generated content must comply with applicable laws and ethical guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Termination</h2>
            <p>
              We may suspend or terminate your account if you violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>
              ClingAI is provided on an "as is" basis. We are not liable for any damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact</h2>
            <p>
              For questions, please contact support at: <a href="mailto:support@clingai.live" className="text-accent-pink hover:underline">support@clingai.live</a>
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-white font-medium">
              By using ClingAI, you agree to these Terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
