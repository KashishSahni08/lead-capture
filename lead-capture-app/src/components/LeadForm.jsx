import { useState } from "react";
import "./LeadForm.css";

// ---- CONFIG: replace these two values ----
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/6583ebb9-cfce-4643-961f-6d0ca507a185";
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // used in index.html, referenced here for events only
// -------------------------------------------

function trackEvent(eventName, params = {}) {
  // gtag is loaded globally via the GA4 snippet in index.html
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export default function LeadForm() {
  const [form, setForm] = useState({ name: "", email: "", source: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [hasStartedForm, setHasStartedForm] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    // Fire "form_start" once, the first time the user touches any field
    if (!hasStartedForm) {
      trackEvent("form_start");
      setHasStartedForm(true);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.source) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          source: form.source,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Webhook request failed");

      // Fire "form_submit" only on confirmed success
      trackEvent("form_submit", { lead_source: form.source });

      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="lead-card lead-card--success">
        <div className="lead-check">✓</div>
        <h2>You're on the list</h2>
        <p>Check your inbox — a welcome email is on its way.</p>
      </div>
    );
  }

  return (
    <div className="lead-card">
      <span className="lead-eyebrow">Free trial</span>
      <h1>Start your 14-day trial</h1>
      <p className="lead-sub">No credit card. Cancel anytime.</p>

      <form onSubmit={handleSubmit} className="lead-form" noValidate>
        <label className="lead-field">
          <span>Name</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jordan Lee"
            autoComplete="name"
          />
        </label>

        <label className="lead-field">
          <span>Work email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </label>

        <label className="lead-field">
          <span>How did you hear about us?</span>
          <select name="source" value={form.source} onChange={handleChange}>
            <option value="" disabled>
              Select one
            </option>
            <option value="Instagram">Instagram</option>
            <option value="Google">Google</option>
            <option value="Referral">Referral</option>
          </select>
        </label>

        {status === "error" && (
          <p className="lead-error">
            Fill in every field, then try again — or refresh if it keeps failing.
          </p>
        )}

        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Starting trial…" : "Start free trial"}
        </button>
      </form>
    </div>
  );
}