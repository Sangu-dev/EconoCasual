import React from 'react';
import { HelpCircle, GitBranch, Cpu, Brain, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <HelpCircle className="text-primary" size={32} />
            Methodology, Causal Logic & Team Architecture
          </h1>
          <p className="page-desc">
            Scientific principles behind EconoCausal: Double Machine Learning (DML), Individual Treatment Effects (ITE),
            and frontend architectural ownership.
          </p>
        </div>

        <div className="badge-role">
          Role C: Sangamesh Ragam • Team Group 25
        </div>
      </div>

      {/* Scientific Logic Section */}
      <div className="card-panel" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header-row">
          <h3 className="card-heading">
            <Brain size={20} color="var(--primary-light)" />
            The Causal Question: Prediction vs Causation
          </h3>
          <span className="badge-role">Core Theory</span>
        </div>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
          Standard machine learning predicts correlation: <code style={{ color: 'var(--cyan)' }}>Pr(Churn | X)</code> or <code style={{ color: 'var(--cyan)' }}>Pr(Buy | X)</code>. 
          For instance, an ML model may estimate a customer has an 85% churn probability, prompting marketing to offer a $20 discount. 
          However, if that customer was going to renew regardless, the $20 discount is wasted.
        </p>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Causal machine learning answers the counterfactual: <strong>"Will the customer purchase if and only if we provide them with the discount?"</strong>
          We quantify this with the <strong>Individual Treatment Effect (ITE)</strong>:
        </p>
        <div style={{ margin: '1rem 0', padding: '1rem 1.5rem', background: 'rgba(8, 12, 20, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--primary-light)' }}>
          ITE_i = Y_i(1) - Y_i(0) &nbsp;&nbsp;|&nbsp;&nbsp; Incremental Revenue = Revenue(Discounted) - Revenue(No Discount)
        </div>
      </div>

      {/* The 4 Customer Segments */}
      <div className="card-panel" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header-row">
          <h3 className="card-heading">
            <Cpu size={20} color="var(--cyan)" />
            The Four Causal Behavioral Segments
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1.2rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--emerald-border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: '#34d399', fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              1. Persuadables (ITE &gt;&gt; 0)
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Purchase <strong>only</strong> if they receive a discount. This is the optimal segment where marketing dollars generate genuine incremental revenue.
            </p>
          </div>

          <div style={{ padding: '1.2rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              2. Sure Things (ITE ≈ 0)
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Purchase regardless of whether they get a discount. Giving them discounts reduces margin without increasing sales volume.
            </p>
          </div>

          <div style={{ padding: '1.2rem', background: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              3. Lost Causes (ITE ≈ 0)
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Will never purchase even when offered substantial discounts. Marketing budget spent here is completely lost.
            </p>
          </div>

          <div style={{ padding: '1.2rem', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid var(--rose-border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: '#fb7185', fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              4. Sleeping Dogs (ITE &lt; 0)
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              React negatively to discounts (e.g. perceiving products as cheapened or spammy). Never offer discounts to this segment.
            </p>
          </div>
        </div>
      </div>

      {/* Role Ownership & Hand-offs */}
      <div className="card-panel">
        <div className="card-header-row">
          <h3 className="card-heading">
            <GitBranch size={20} color="var(--primary-light)" />
            Team Role Division & Ownership (Role C Scope)
          </h3>
          <span className="badge-role">Git Branch: sangamesh-ragam</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1.2rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--primary-light)" />
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Role C (Sangamesh Ragam) — My Scope</strong>
            </div>
            <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.7 }}>
              <li>Application Shell, Header, Navigation tabs, and layout</li>
              <li>CSV Ingestion & Schema Engine with PapaParse & error banners</li>
              <li>Shared DataContext state management</li>
              <li>Plotly Visualizations (Uplift, Qini, ITE Distribution)</li>
              <li>WebGL <code>scattergl</code> scale performance (10k–50k rows)</li>
              <li>FastAPI Async Client (<code>src/api/client.js</code>)</li>
            </ul>
          </div>

          <div style={{ padding: '1.2rem', background: 'rgba(8, 12, 20, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--cyan)" />
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Role D (Shivani Pathak) Scope</strong>
            </div>
            <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.7 }}>
              <li>Customer data table pagination & virtualization</li>
              <li>Filter components (Loyalty score slider, age range)</li>
              <li>Budget input forms & constraints</li>
              <li>Glossary and method documentation text</li>
              <li>Provides <code>frontend/public/mock_ite.json</code> handoff</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
