import React from 'react';
import { Layers, Cpu, Brain, Database, LineChart, PieChart, ShieldCheck } from 'lucide-react';
import brandCrest from '../assets/logo-crest.png';

export default function AboutPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="brand-crest-wrapper" style={{ width: 42, height: 42 }}>
              <img src={brandCrest} alt="EconoCausal Crest" className="brand-logo-crest" style={{ width: 30, height: 30 }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
                Methodology, Causal Logic & System Architecture
              </h1>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Scientific foundations of EconoCausal: Double Machine Learning (DML), Individual Treatment Effects (ITE), and End-to-End Pricing Optimization.
              </p>
            </div>
          </div>
        </div>

        <div className="status-badge status-badge-blue">
          <ShieldCheck size={13} color="var(--primary)" />
          <span>Causal ML Framework</span>
        </div>
      </div>

      {/* Scientific Logic Section */}
      <div className="panel-card">
        <div className="panel-card-header">
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
      <div className="panel-card">
        <div className="panel-card-header">
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

      {/* End-to-End System Pipeline Architecture */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              EconoCausal End-to-End System Pipeline
            </h2>
          </div>
          <span className="status-badge status-badge-green">Engine Architecture</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {/* Stage 1 */}
          <div style={{ 
            padding: '1.2rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Database size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>1. Ingestion & Validation</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Client-side streaming with PapaParse. Validates the 7 required causal features (<code>customer_id</code>, <code>loyalty_score</code>, <code>discount</code>, <code>revenue</code>, etc.) preventing downstream schema mismatches.
            </p>
          </div>

          {/* Stage 2 */}
          <div style={{ 
            padding: '1.2rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Brain size={16} color="var(--cyan)" />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>2. Double ML Residualization</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              EconML Frisch-Waugh-Lovell orthogonalization isolates true treatment elasticity from observational confounders (past orders, customer tenure) via cross-fitting.
            </p>
          </div>

          {/* Stage 3 */}
          <div style={{ 
            padding: '1.2rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <LineChart size={16} color="var(--emerald)" />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>3. Uplift & ITE Scoring</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Scores customer-level counterfactual lift, ranks cohorts by treatment sensitivity, and generates normalized Qini (AUUC) curves benchmarked against random targeting.
            </p>
          </div>

          {/* Stage 4 */}
          <div style={{ 
            padding: '1.2rem', 
            backgroundColor: 'var(--bg-card-subtle)', 
            border: '1px solid var(--border-card)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <PieChart size={16} color="var(--amber)" />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>4. Knapsack Budget Optimizer</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Solves bounded linear optimization allocating finite promotional budget only to customers where expected incremental revenue exceeds discount cost.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Identity & Engine Architecture Footer */}
      <div className="panel-card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)', border: '1px solid var(--border-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: 58, 
              height: 58, 
              borderRadius: 'var(--radius-sm)', 
              background: 'radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.05))',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)',
              flexShrink: 0
            }}>
              <img 
                src={brandCrest} 
                alt="EconoCausal Logo Crest" 
                style={{ width: 44, height: 44, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))' }} 
              />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Econo<span style={{ color: 'var(--primary)' }}>Causal</span>™ Uplift & Budget Allocation Engine
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Double Machine Learning (DML) • Frisch-Waugh-Lovell Orthogonalization • Knapsack Optimization
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: 999, background: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 600, border: '1px solid rgba(14, 165, 233, 0.2)' }}>
              v2.4 Production
            </span>
            <span style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: 999, background: 'var(--bg-app)', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border-card)' }}>
              EconML 0.15+
            </span>
            <span style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: 999, background: 'var(--emerald-subtle)', color: 'var(--emerald)', fontWeight: 600, border: '1px solid var(--emerald-border)' }}>
              ● Causal Pipeline Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
