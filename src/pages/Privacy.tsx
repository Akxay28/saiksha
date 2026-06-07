const sections = [
  {
    title: "Information we collect",
    text: "We may collect details you submit while ordering, contacting support, joining the newsletter, leaving a review, or creating an account. This can include name, email, phone number, order details, delivery notes, and review content.",
  },
  {
    title: "How we use information",
    text: "We use customer information to process orders, respond to support requests, send order or newsletter communication, improve the website experience, and maintain secure business records.",
  },
  {
    title: "Payments and security",
    text: "Payment processing should be handled through secure payment providers. Saiksha does not need to store full card details on this website.",
  },
  {
    title: "Analytics",
    text: "The website uses Google Analytics to understand visitor traffic and improve pages. Analytics may use cookies or similar technologies depending on user browser settings.",
  },
  {
    title: "Data sharing",
    text: "We only share information with service providers needed to operate the store, such as delivery, email, payment, hosting, and analytics partners. We do not sell customer information.",
  },
  {
    title: "Customer choices",
    text: "You can contact Saiksha to request corrections, deletion where legally possible, or removal from marketing communication.",
  },
];

export default function Privacy() {
  return (
    <div className="bg-white">
      <section className="bg-brand-cream/35">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 lg:py-32 text-center space-y-6">
          <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Privacy Policy</span>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight text-brand-ink">Clear handling of customer information.</h1>
          <p className="text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto">
            This page explains how Saiksha may collect, use, and protect information shared through the website. Last updated: June 7, 2026.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 md:px-10 py-20 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="border-b border-black/5 pb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-3">{section.title}</h2>
            <p className="text-sm text-neutral-600 leading-relaxed font-light">{section.text}</p>
          </div>
        ))}
        <div className="bg-brand-ink text-white p-8 rounded-sm space-y-3">
          <h2 className="text-2xl font-serif">Contact for privacy requests</h2>
          <p className="text-sm text-white/65 leading-relaxed font-light">
            For privacy-related requests, contact Saiksha through the Contact page or official social channels and include the phone/email used with the order or form submission.
          </p>
        </div>
      </section>
    </div>
  );
}
