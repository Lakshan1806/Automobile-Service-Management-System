import Link from "next/link";

const services = [
  {
    title: "Precision Maintenance",
    description:
      "Factory-trained technicians, digital inspections, and predictive reminders keep every NovaDrive vehicle in peak condition.",
  },
  {
    title: "Transparent Scheduling",
    description:
      "See bay availability in real time, pick a valet option, and receive live updates from drop-off to keys back in hand.",
  },
  {
    title: "Connected Roadside",
    description:
      "Tap into 24/7 roadside experts with secure driver verification and GPS-powered technician tracking.",
  },
];

const highlights = [
  { label: "Certified technicians", value: "120+" },
  { label: "Service appointments this month", value: "4,200" },
  { label: "Average roadside ETA", value: "22 min" },
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="container hero-content">
          <div>
            <p className="eyebrow">Welcome to NovaDrive</p>
            <h1>
              Effortless service, proactive care, and roadside rescue—built for
              modern drivers.
            </h1>
            <p>
              Manage your entire ownership experience in one portal. Book
              maintenance, keep your digital garage current, and get help on the
              road with a tap.
            </p>
            <div className="hero-actions">
              <Link href="/appointments" className="button primary">
                Book a Service
              </Link>
              <Link
                href="/roadside-assistance"
                className="button secondary"
              >
                Request Roadside Help
              </Link>
            </div>
            <div className="metrics">
              {highlights.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="hero-card" aria-labelledby="portal-benefits">
            <h2 id="portal-benefits">Why drivers choose NovaDrive</h2>
            <ul>
              <li>
                Live progress tracking for every appointment with secure
                messaging.
              </li>
              <li>
                Digital service history that follows each vehicle in your garage.
              </li>
              <li>
                Seamless roadside verification to keep you and your car safe.
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">Everything in one place</p>
            <h2>Service smarter with tailored workflows</h2>
            <p>
              The NovaDrive portal keeps service, billing, and roadside
              protection connected. Start with the essentials and expand as your
              needs grow.
            </p>
          </div>
          <div className="cards">
            {services.map((service) => (
              <article className="card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link href="/appointments">Schedule now →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container hero-content">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>Your day-of-service playbook</h2>
            <p>
              We combined dealership-grade diagnostics with concierge
              communication. Here is what to expect when you book with NovaDrive.
            </p>
          </div>
          <div className="timeline" aria-label="Service steps">
            <div className="timeline-step">
              <span>01 • Book</span>
              <strong>Tell us where and when</strong>
              <p>
                Choose your favorite service center or mobile technician, select
                transport options, and confirm in under 60 seconds.
              </p>
            </div>
            <div className="timeline-step">
              <span>02 • Track</span>
              <strong>Stay updated every mile</strong>
              <p>
                Status changes, technician notes, and payment approvals stay in
                sync through the NovaDrive app and SMS.
              </p>
            </div>
            <div className="timeline-step">
              <span>03 • Drive</span>
              <strong>Pick up with confidence</strong>
              <p>
                Review your inspection summary, pay securely, and schedule the
                next visit with personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
