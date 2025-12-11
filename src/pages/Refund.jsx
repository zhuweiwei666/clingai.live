export default function Refund() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">Refund Policy</h1>
        
        <div className="text-text-secondary mb-6">
          <p className="text-sm opacity-75">Last updated: {currentDate}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <p>
            ClingAI offers digital AI-based services and subscriptions. Due to the nature of digital products, all purchases are generally non-refundable.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Refund Consideration</h2>
            <p>
              However, we may consider refund requests on a case-by-case basis under reasonable circumstances, such as:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Duplicate payments</li>
              <li>Technical issues preventing service usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How to Request a Refund</h2>
            <p>
              Refund requests must be submitted within 7 days of purchase by contacting: <a href="mailto:support@clingai.live" className="text-accent-pink hover:underline">support@clingai.live</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Refund Processing</h2>
            <p>
              All refunds, if approved, will be processed through our payment partner Paddle according to their policies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
