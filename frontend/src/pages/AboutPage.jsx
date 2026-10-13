import React from 'react';
import { HelpCircle, GitBranch, Cpu, Brain, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--primary-subtle)', 
              color: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
                Methodology, Causal Logic & Team Architecture
              </h1>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Scientific principles behind EconoCausal: Double Machine Learning (DML), Individual Treatment Effects (ITE), and engineering boundaries.
              </p>
            </div>
          </div>
        </div>

        <div className="badge-role">
          <span>Role C: Sangamesh Ragam</span>
          <span style={{ color: 'var(--text-tertiary)' }}>•</span>
          <span>Team Group 25</span>
        </div>
      </div>

      {/* Scientific Logic Section */}
      <div className="card-panel">
        <div className="card-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Brain size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              The Causal Question: Prediction vs. Causation
            </h2>
          </div>
          <span className="status-badge status-badge-blue">Core Theory</span>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.85rem' }}>
          Standard machine learning models predict correlation: <code style={{ color: 'var(--primary)', fontWeight: 600 }}>Pr(Churn | X)</code> or <code style={{ color: 'var(--primary)', fontWeight: 600 }}>Pr(Buy | X)</code>. 
          For instance, a predictive model may identify that a customer has an 85% probability of churn, prompting marketing to issue a $20 discount voucher. 
          However, if that customer was loyal and intended to renew regardless, that $20 discount is wasted margin.
        </p>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Causal machine learning solves the fundamental counterfactual question: <strong>"Will the customer convert if and only if we intervene with the discount?"</strong>
          We quantify this treatment lift using the <strong>Individual Treatment Effect (ITE)</strong>:
        </p>

        {/* Clean Math Formula Callout */}
        <div className="formula-box">
          <div>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>ITE_i = Y_i(1) - Y_i(0)</span>
            <span style={{ margin: '0 1rem', color: 'var(--border-dashed)' }}>│</span>
            <span style={{ color: 'var(--text-secondary)' }}>Incremental Revenue = Revenue(Discounted) - Revenue(No Discount)</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
            Neyman-Rubin Causal Framework
          </span>
        </div>
      </div>

      {/* The 4 Customer Segments */}
      <div className="card-panel">
        <div className="card-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              The Four Causal Behavioral Segments
            </h2>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Targeting Taxonomy</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {/* Segment 1 */}
          <div style={{ 
            padding: '1.2rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderLeft: '4px solid var(--emerald)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <h3 style={{ color: 'var(--emerald)', fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                1. Persuadables (ITE &gt;&gt; 0)
              </h3>
              <span className="status-badge status-badge-green" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Target</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Purchase <strong>only</strong> if they receive a promotional discount. This is the optimal audience where marketing dollars generate net incremental gain.
            </p>
          </div>

          {/* Segment 2 */}
          <div style={{ 
            padding: '1.2rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderLeft: '4px solid var(--cyan)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <h3 style={{ color: 'var(--cyan)', fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                2. Sure Things (ITE ≈ 0)
              </h3>
              <span className="status-badge" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>No Discount</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Purchase regardless of whether they receive incentives. Offering discounts gives away unnecessary margin without increasing conversions.
            </p>
          </div>

          {/* Segment 3 */}
          <div style={{ 
            padding: '1.2rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderLeft: '4px solid var(--text-tertiary)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                3. Lost Causes (ITE ≈ 0)
              </h3>
              <span className="status-badge" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Exclude</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Will not purchase even when offered substantial price reductions. Marketing spend on this cohort is non-recoverable.
            </p>
          </div>

          {/* Segment 4 */}
          <div style={{ 
            padding: '1.2rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderLeft: '4px solid var(--rose)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <h3 style={{ color: 'var(--rose)', fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                4. Sleeping Dogs (ITE &lt; 0)
              </h3>
              <span className="status-badge" style={{ fontSize: '0.68rem', padding: '1px 6px', color: 'var(--rose)' }}>Do Not Touch</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              React negatively to interventions (e.g., unsubscribing or perceiving brand devaluation). Interventions actively destroy revenue.
            </p>
          </div>
        </div>
      </div>

      {/* Role Ownership & Architecture */}
      <div className="card-panel">
        <div className="card-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitBranch size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Team Engineering Ownership & Hand-Offs
            </h2>
          </div>
          <span className="badge-role">Branch: sangamesh-ragam</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Role C */}
          <div style={{ 
            padding: '1.25rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--primary-border)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>Role C (Sangamesh Ragam) — My Responsibilities</strong>
            </div>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
              <li>Executive Application Shell, navigation hierarchy, and layout system</li>
              <li>PapaParse CSV Ingestion engine with column mapping and schema validation</li>
              <li>Centralized DataContext state management and event pipeline</li>
              <li>Interactive Plotly visualizations (Uplift curves, Qini gain, Score distribution)</li>
              <li>GPU-accelerated WebGL <code>scattergl</code> heterogeneity inspector (up to 50k rows)</li>
              <li>Centralized FastAPI asynchronous API client with resilient offline mock fallback</li>
            </ul>
          </div>

          {/* Role D */}
          <div style={{ 
            padding: '1.25rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--emerald)" />
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>Role D (Shivani Pathak) Scope</strong>
            </div>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
              <li>Customer data table pagination and virtualization</li>
              <li>Filter components (Loyalty score range slider, cohort select)</li>
              <li>Campaign budget form controls and business constraints</li>
              <li>Glossary and causal methodology documentation copy</li>
              <li>Provides <code>frontend/public/mock_ite.json</code> handoff contract</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
