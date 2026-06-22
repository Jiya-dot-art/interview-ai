import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const features = [
  {
    title: "Role and round variety",
    text: "Practice technical, DSA, system design, resume, and behavioral rounds across engineering, data, product, QA, cloud, and design roles.",
    icon: "🎯",
  },
  {
    title: "Resume-based questions",
    text: "Upload or paste resume notes so the interviewer can ask about real projects, skills, and experience.",
    icon: "📄",
  },
  {
    title: "Voice interview mode",
    text: "Answer by speaking in supported browsers, then receive instant scoring, strengths, weak points, and answer hints.",
    icon: "🎤",
  },
  {
    title: "AI-powered feedback",
    text: "Get detailed feedback on every answer with scores, improvement suggestions, and personalized study plans.",
    icon: "🤖",
  },
  {
    title: "Progress tracking",
    text: "Track your improvement over time with detailed analytics, streaks, and performance charts.",
    icon: "📊",
  },
  {
    title: "Multiple difficulty levels",
    text: "Choose from Beginner, Intermediate, or Advanced difficulty to match your experience level.",
    icon: "⚡",
  },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "SDE at Google",
    text: "InterviewX AI helped me crack my Google interview. The AI questions were spot on!",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Frontend Developer at Microsoft",
    text: "The detailed feedback and progress tracking helped me identify my weak areas quickly.",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    role: "Backend Engineer at Amazon",
    text: "Best interview prep tool I've used. Worth every penny for the Pro plan!",
    rating: 5,
  },
];

export default function Landing() {
  return (
    <div className="app-page">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">AI mock interviews for serious candidates</p>
            <h1>Master Your Next Interview with AI</h1>
            <p className="hero-text">
              Practice with realistic AI questions, get instant feedback, track your progress,
              and land your dream job. Join thousands of candidates who've already upgraded their skills.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary btn-large" to="/register">
                Start Free Trial
              </Link>
              <Link className="btn btn-secondary btn-large" to="/login">
                Sign In
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <strong>10K+</strong>
                <span>Users</span>
              </div>
              <div className="stat">
                <strong>50K+</strong>
                <span>Interviews</span>
              </div>
              <div className="stat">
                <strong>4.9★</strong>
                <span>Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-product" aria-label="Product preview">
            <div className="product-topline">
              <span>Live mock session</span>
              <strong>Round 3 / 5</strong>
            </div>
            <div className="interview-preview">
              <p className="ai-line">
                Explain how you would design a notification service for one million daily users.
              </p>
              <p className="user-line">
                I would separate ingestion, preference checks, queueing, delivery workers, and retry handling.
              </p>
            </div>
            <div className="score-strip">
              <span>DSA</span>
              <span>Resume</span>
              <span>Voice</span>
            </div>
          </div>
        </section>

        {/* Trust Band */}
        <section className="trust-band">
          <span>✓ Free: 3 interviews</span>
          <span>✓ Pro: unlimited practice</span>
          <span>✓ Voice answers</span>
          <span>✓ Price: Rs 199/month</span>
        </section>

        {/* Features Section */}
        <section className="section-grid">
          {features.map((feature) => (
            <article className="glass-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <div className="section-header">
            <p className="eyebrow">Simple Process</p>
            <h2>How It Works</h2>
            <p>Get started in minutes and transform your interview skills</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up for free and get 3 practice interviews to start</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Choose Interview</h3>
              <p>Select role, round type, and difficulty level</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Practice & Learn</h3>
              <p>Answer AI questions and get instant feedback</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Get Report</h3>
              <p>Review detailed report with scores and study plan</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="section-header">
            <p className="eyebrow">Testimonials</p>
            <h2>Loved by Candidates</h2>
            <p>See what our users say about their experience</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, idx) => (
              <div className="testimonial-card" key={idx}>
                <div className="testimonial-rating">
                  {"⭐".repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing-section" id="pricing">
          <div>
            <p className="eyebrow">Simple Pricing</p>
            <h2>Invest in Your Career</h2>
            <p>
              Start free, upgrade when you're ready. One price, unlimited possibilities.
            </p>
            <ul className="pricing-features">
              <li>✓ No hidden fees</li>
              <li>✓ Cancel anytime</li>
              <li>✓ Instant activation</li>
              <li>✓ Secure payment</li>
            </ul>
          </div>

          <div className="pricing-card">
            <span className="plan-badge">Pro</span>
            <div className="price">
              <span className="currency">₹</span>
              <span className="amount">199</span>
              <span className="period">/month</span>
            </div>
            <p>Everything you need to ace your interviews</p>
            <ul className="pricing-list">
              <li>✓ Unlimited AI interviews</li>
              <li>✓ All interview modes</li>
              <li>✓ Advanced AI feedback</li>
              <li>✓ Detailed reports</li>
              <li>✓ PDF downloads</li>
              <li>✓ Progress analytics</li>
              <li>✓ Priority support</li>
            </ul>
            <Link className="btn btn-primary btn-large full-width" to="/register">
              Get Started Free
            </Link>
            <p className="pricing-note">3 free interviews • No credit card required</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Ace Your Next Interview?</h2>
            <p>Join thousands of candidates who've already transformed their interview skills</p>
            <Link className="btn btn-primary btn-large" to="/register">
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-mark">IX</span>
              <span>InterviewX AI</span>
            </div>
            <p className="footer-text">
              © 2024 InterviewX AI. All rights reserved. Built with ❤️ for serious candidates.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}