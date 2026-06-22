import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getUser, isPremium } from "../utils/auth";

export default function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (isPremium()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Create order
      const orderRes = await api.post("/payment/create-order");
      const { id, amount, currency } = orderRes.data;

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxxxxxxx",
          amount: amount,
          currency: currency,
          name: "InterviewX AI",
          description: "Pro Plan - Monthly Subscription",
          order_id: id,
          handler: async (response) => {
            try {
              await api.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // Update local storage
              const updatedUser = { ...user, isPremium: true, subscriptionPlan: "pro" };
              localStorage.setItem("user", JSON.stringify(updatedUser));

              alert("Payment successful! Welcome to Pro.");
              navigate("/dashboard");
            } catch (err) {
              console.error("Verification failed:", err);
              alert("Payment verification failed. Please contact support.");
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            email: user?.email || "",
          },
          theme: {
            color: "#6366f1",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

        rzp.on("payment.failed", (response) => {
          console.error("Payment failed:", response);
          alert("Payment failed. Please try again.");
          setProcessing(false);
        });
      };

      script.onerror = () => {
        alert("Failed to load payment gateway. Please try again.");
        setProcessing(false);
      };
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Upgrade to Pro</h1>
          <p>Unlock unlimited interview practice and premium features</p>
        </div>

        <div className="pricing-card">
          <div className="pricing-header">
            <h2>Pro Plan</h2>
            <div className="price">
              <span className="currency">₹</span>
              <span className="amount">199</span>
              <span className="period">/month</span>
            </div>
          </div>

          <ul className="features-list">
            <li>✓ Unlimited AI interviews</li>
            <li>✓ All interview modes (Technical, DSA, System Design, HR, etc.)</li>
            <li>✓ Advanced AI feedback on every answer</li>
            <li>✓ Detailed performance reports</li>
            <li>✓ PDF report downloads</li>
            <li>✓ Progress tracking & analytics</li>
            <li>✓ Weak/strong area identification</li>
            <li>✓ Personalized study plans</li>
            <li>✓ Priority support</li>
          </ul>

          <button
            className="btn btn-primary btn-large full-width"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? "Processing..." : "Subscribe Now - ₹199/month"}
          </button>

          <p className="payment-note">
            Secure payment powered by Razorpay. Cancel anytime.
          </p>
        </div>

        <div className="trust-badges">
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            <span>Instant Activation</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">↩️</span>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}