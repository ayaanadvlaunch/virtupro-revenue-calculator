import { useState, useEffect, useRef } from 'react'
import './App.css'
import virtuproLogo from './assets/virtupro-logo.png'
import ahmedMain     from './assets/ahmed-main.png'
import ahmedLondon   from './assets/ahmed-london.png'
import caseZoom      from './assets/case-zoom.jpeg'

// GHL form config — same location, separate form for revenue calculator
const GHL_FORM_ID   = 'DtSKk7FAqjtiph1IZj3i'
const GHL_LOC_ID    = 'vLiQq0oLjfhklTrtgQUA'

// Benchmark: top-managed UK holiday lets
const TOP_OCCUPANCY   = 0.87   // 87%
const RATE_UPLIFT     = 1.12   // 12% higher nightly rate from professional mgmt

function fmt(n) {
  return '£' + Math.round(n).toLocaleString('en-GB')
}

function scrollToForm() {
  document.getElementById('get-report').scrollIntoView({ behavior: 'smooth' })
}

function SectionCTA({ label = 'Get My Free Revenue Report' }) {
  return (
    <div className="section-cta-wrap">
      <button className="section-cta-btn" onClick={scrollToForm}>{label}</button>
      <p className="cta-subtext">Free. No credit card. Takes 30 seconds.</p>
    </div>
  )
}

function Calculator() {
  const [properties,  setProperties]  = useState(5)
  const [nightlyRate, setNightlyRate] = useState(120)
  const [occupancy,   setOccupancy]   = useState(62)
  const [revealed,    setRevealed]    = useState(false)

  const nightsPerMonth = 30
  const current   = properties * nightlyRate * nightsPerMonth * (occupancy / 100)
  const potential  = properties * (nightlyRate * RATE_UPLIFT) * nightsPerMonth * TOP_OCCUPANCY
  const gap        = Math.max(0, potential - current)
  const annualGap  = gap * 12

  return (
    <div className="calc-shell">
      <div className="calc-inputs">
        <p className="calc-inputs-label">Tell us about your portfolio</p>

        <div className="calc-field">
          <label className="calc-label">
            <span>Number of properties</span>
            <span className="calc-value-badge">{properties}</span>
          </label>
          <input
            type="range" min="1" max="50" step="1"
            value={properties}
            onChange={e => setProperties(+e.target.value)}
            className="calc-slider"
          />
          <div className="calc-range-ends"><span>1</span><span>50+</span></div>
        </div>

        <div className="calc-field">
          <label className="calc-label">
            <span>Average nightly rate</span>
            <span className="calc-value-badge">£{nightlyRate}</span>
          </label>
          <input
            type="range" min="40" max="500" step="5"
            value={nightlyRate}
            onChange={e => setNightlyRate(+e.target.value)}
            className="calc-slider"
          />
          <div className="calc-range-ends"><span>£40</span><span>£500</span></div>
        </div>

        <div className="calc-field">
          <label className="calc-label">
            <span>Current occupancy rate</span>
            <span className="calc-value-badge">{occupancy}%</span>
          </label>
          <input
            type="range" min="10" max="100" step="1"
            value={occupancy}
            onChange={e => setOccupancy(+e.target.value)}
            className="calc-slider"
          />
          <div className="calc-range-ends"><span>10%</span><span>100%</span></div>
        </div>

        <button className="calc-run-btn" onClick={() => setRevealed(true)}>
          Show me what I'm losing
        </button>
        <p className="calc-trust-note">Numbers based on VirtuPro's live portfolio of 2,000+ UK properties, not industry estimates.</p>
      </div>

      <div className={`calc-results ${revealed ? 'calc-results--visible' : ''}`}>
        <div className="calc-result-row calc-result-row--current">
          <p className="calc-result-label">Your current monthly revenue</p>
          <p className="calc-result-num">{fmt(current)}</p>
        </div>
        <div className="calc-result-row calc-result-row--potential">
          <p className="calc-result-label">Same portfolio, professionally managed</p>
          <p className="calc-result-num">{fmt(potential)}</p>
          <p className="calc-result-note">Based on 87% average occupancy and 12% nightly rate uplift across VirtuPro's active UK portfolio (2,000+ units, measured monthly)</p>
        </div>
        <div className="calc-result-gap">
          <p className="calc-gap-label">You're leaving on the table</p>
          <p className="calc-gap-num">{fmt(gap)}<span className="calc-gap-period">/month</span></p>
          <p className="calc-gap-annual">That's {fmt(annualGap)} a year</p>
        </div>
        <button className="calc-cta-btn" onClick={scrollToForm}>
          Get my full revenue breakdown
        </button>
        <p className="calc-cta-note">We'll email your personalised report. Free, no card.</p>
      </div>
    </div>
  )
}

function LeadForm({ onSuccess }) {
  const [values, setValues] = useState({
    full_name: '', email: '', number_whats_app: '', CG6GeFiqxFrpb5m9YVMl: '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('failed')
      if (window.fbq) window.fbq('track', 'Lead')
      onSuccess(values)
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <input
        type="text" name="full_name" placeholder="Full name"
        value={values.full_name} onChange={handleChange} required
      />
      <input
        type="email" name="email" placeholder="Email address"
        value={values.email} onChange={handleChange} required
      />
      <input
        type="tel" name="number_whats_app" placeholder="WhatsApp number"
        value={values.number_whats_app} onChange={handleChange} required
      />
      <select
        name="CG6GeFiqxFrpb5m9YVMl"
        value={values.CG6GeFiqxFrpb5m9YVMl}
        onChange={handleChange}
        required
      >
        <option value="" disabled>How many properties do you manage?</option>
        <option value="1–10 properties">1–10 properties</option>
        <option value="10–20 properties">10–20 properties</option>
        <option value="20–50 properties">20–50 properties</option>
        <option value="50+ properties">50+ properties</option>
      </select>
      <button className="submit-btn" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send Me the Report'}
      </button>
      {status === 'error' && (
        <p className="form-error">Something went wrong. Please try again.</p>
      )}
      <p className="form-note">No credit card. No sales call. Report straight to your inbox.</p>
    </form>
  )
}

function ThankYouPage({ data }) {
  const firstName = data.full_name.trim().split(' ')[0]
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="ty-page">
      <header className="site-header">
        <div className="container header-inner">
          <img src={virtuproLogo} alt="VirtuPro" className="site-logo-img" />
        </div>
      </header>

      <section className="ty-hero">
        <div className="container ty-hero-inner">
          <p className="eyebrow">Your report is on its way, {firstName}</p>
          <h1 className="ty-heading">Check {data.email}.</h1>
          <p className="ty-sub">Your personalised revenue breakdown will be there in a few minutes.</p>
          <div className="ty-stars" aria-hidden="true">★★★★★</div>
        </div>
      </section>

      <section className="ty-pitch">
        <div className="container ty-pitch-single">
          <p className="eyebrow">One more thing</p>
          <h2 className="ty-pitch-heading">
            Someone from Ahmed's team will reach out shortly.
          </h2>
          <p className="ty-pitch-body">
            A 30-minute call, usually reserved for VirtuPro's existing clients. Free for qualified UK holiday let owners.
          </p>
          <p className="ty-pitch-body ty-pitch-body-strong">
            No obligation. No sales pitch. Just answers.
          </p>
          <ul className="ty-list">
            <li>Revenue report in your inbox now</li>
            <li>We'll WhatsApp you within 24 hours</li>
            <li>We ask questions first. Every time.</li>
          </ul>
          <div className="ty-qualify-box">
            <p className="ty-qualify-title">You've been added to the priority list.</p>
            <p className="ty-qualify-body">
              Ahmed only allows a handful of calls each week.
              Expect to hear from us on <strong>{data.number_whats_app}</strong> within 24 hours to lock in a time.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <img src={virtuproLogo} alt="VirtuPro" className="footer-logo" />
          <p className="footer-copy">
            &copy; 2025 VirtuPro. Full-service Airbnb co-hosting for UK &amp; UAE holiday let owners.
          </p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  const [submitted, setSubmitted] = useState(null)

  useEffect(() => {
    if (window.fbq) window.fbq('track', 'PageView')
  }, [])

  if (submitted) return <ThankYouPage data={submitted} />

  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="container header-inner">
          <img src={virtuproLogo} alt="VirtuPro" className="site-logo-img" />
          <button className="header-cta" onClick={scrollToForm}>Get Free Report</button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <p className="eyebrow">Free for UK Holiday Let Owners</p>
            <h1>How Much Is Your<br />Holiday Let Losing?</h1>
            <p className="subline">
              Most UK property owners don't know the number. Move the sliders and find out yours in 30 seconds.
            </p>
            <div className="hero-trust">
              <span className="hero-trust-item">2,000+ properties managed</span>
              <span className="hero-trust-item">87% average occupancy</span>
              <span className="hero-trust-item">9/10 damage claims won</span>
            </div>
          </div>
          <Calculator />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar">
        <div className="container stats-grid">
          {[
            { num: '£12,000',  label: 'Avg annual loss per owner' },
            { num: '87%',      label: 'Occupancy, top managed hosts' },
            { num: '2,000+',   label: 'Properties managed by VirtuPro' },
            { num: '3 min',    label: 'Average guest reply time' },
          ].map(s => (
            <div key={s.num}>
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHY OWNERS LOSE MONEY */}
      <section className="pain">
        <div className="container">
          <div className="pain-inner">
            <div className="pain-content">
              <div className="pain-heading-row">
                <p className="eyebrow">What self-managing is actually costing you</p>
                <h2>Three things VirtuPro handles for clients that most owners are doing themselves.</h2>
              </div>
              <div className="pain-rows">
                {[
                  {
                    i: '01',
                    heading: 'Guest replies handled in under 3 minutes, around the clock.',
                    body: 'Airbnb\'s algorithm measures response time. Every hour without a reply is an hour your listing drops. Our team maintains a 3-minute average response time, 24 hours a day, across every property we manage.',
                  },
                  {
                    i: '02',
                    heading: 'Pricing adjusted weekly. Not set once and left.',
                    body: 'VirtuPro adjusts nightly rates weekly against local demand, competitor occupancy, and seasonal trends — for every property in your portfolio. That\'s the difference behind the 12% average rate uplift our clients see.',
                  },
                  {
                    i: '03',
                    heading: 'Every damage claim filed. 9 out of 10 won.',
                    body: 'The average UK host loses £12,000 a year in abandoned damage claims. Our team files every single one, manages the Airbnb process end to end, and wins 9 out of 10. You do not write anything off.',
                  },
                ].map(row => (
                  <div className="pain-row" key={row.i}>
                    <span className="pain-index">{row.i}</span>
                    <div>
                      <h3>{row.heading}</h3>
                      <p>{row.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <SectionCTA label="Get My Free Revenue Report" />
            </div>
            <div className="pain-photo-wrap">
              <img src={ahmedLondon} alt="Ahmed Khilji, VirtuPro Founder" className="pain-photo" />
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <section className="client-result-section">
        <div className="container">
          <div className="client-result-heading">
            <p className="eyebrow">What the numbers look like in practice.</p>
            <h2>55 to 130+. After Ahmed stepped in.</h2>
          </div>
          <div className="ahmed-case">
            <div className="ahmed-case-img">
              <img src={caseZoom} alt="55 to 130+ properties" />
            </div>
            <div className="ahmed-case-copy">
              <p className="eyebrow">Client result</p>
              <p className="case-result">55 to 130+ in 3 months.</p>
              <p>One portfolio. Same properties. Ahmed audited the gaps, fixed the systems, and rebuilt operations from scratch. The occupancy numbers and claim recovery rates in your calculator are based on what his team delivers across 2,000+ active units.</p>
              <p className="case-quote">"I didn't believe the numbers until I saw my own statement. VirtuPro's system isn't theory. The calculator gave me the number. The call made it real."</p>
              <p className="case-attribution">James R., UK Holiday Let Owner</p>
            </div>
          </div>
          <SectionCTA label="Get My Free Revenue Report" />
        </div>
      </section>

      {/* WHAT'S IN THE REPORT */}
      <section className="inside">
        <div className="container">
          <div className="inside-heading-row">
            <p className="eyebrow">Your free personalised report includes</p>
            <h2>Five numbers every UK holiday let owner needs to know</h2>
          </div>
          {[
            { n: '01', title: 'Your exact revenue gap', body: 'The pound figure between what your portfolio earns now and what it earns under VirtuPro management. Based on your inputs against our live portfolio benchmarks.' },
            { n: '02', title: 'Your occupancy gap', body: 'How far your current occupancy sits from the 87% our team maintains across 2,000+ units — and what closing that gap would add to your monthly income.' },
            { n: '03', title: 'Your rate uplift potential', body: 'The revenue available from dynamic pricing alone. Our team adjusts every listing weekly. The 12% average uplift in the calculator is what clients see in practice.' },
            { n: '04', title: 'Your unclaimed damage recovery', body: 'Based on your portfolio size, the estimated annual amount sitting in unfiled Airbnb claims. Our team files every one. Most owners have never filed a single claim.' },
            { n: '05', title: 'What VirtuPro does first', body: 'When we take on a portfolio, three things change in the first 30 days. Your report includes exactly what those are for a portfolio your size — and the results clients see after.' },
          ].map(item => (
            <div className="inside-item" key={item.n}>
              <span className="inside-n">{item.n}</span>
              <div>
                <p className="inside-title">{item.title}</p>
                <p className="inside-body">{item.body}</p>
              </div>
            </div>
          ))}
          <SectionCTA label="Get the Free Report" />
        </div>
      </section>

      {/* AHMED */}
      <section className="ahmed">
        <div className="container">
          <div className="ahmed-intro">
            <div className="ahmed-photo-wrap">
              <img src={ahmedMain} alt="Ahmed Khilji, VirtuPro Founder" className="ahmed-photo" />
            </div>
            <div className="ahmed-bio">
              <p className="eyebrow">The numbers behind the calculator</p>
              <h2>Ahmed Khilji manages 2,000+ UK properties. These benchmarks are what his team delivers every month.</h2>
              <p>The 87% occupancy figure and 12% rate uplift in the calculator aren't targets. They're the live averages across VirtuPro's active portfolio, measured monthly. Ahmed built the system from scratch after burning out at 40 units trying to manage everything himself.</p>
              <p>The gap your calculator showed you is real. It's the difference between your current setup and what a trained team delivering 3-minute replies, dynamic pricing, and 24/7 coverage actually produces.</p>
              <div className="ahmed-badges">
                <div className="ahmed-badge"><span className="badge-num">2,000+</span><span className="badge-label">Units managed</span></div>
                <div className="ahmed-badge"><span className="badge-num">87%</span><span className="badge-label">Average occupancy</span></div>
                <div className="ahmed-badge"><span className="badge-num">9/10</span><span className="badge-label">Claims won</span></div>
                <div className="ahmed-badge"><span className="badge-num">3 min</span><span className="badge-label">Guest reply time</span></div>
              </div>
            </div>
          </div>
          <SectionCTA label="Get My Free Revenue Report" />
        </div>
      </section>

      {/* FINAL CTA + FORM */}
      <section className="final-cta" id="get-report">
        <div className="container final-cta-grid">
          <div className="final-copy">
            <p className="eyebrow">Free revenue report</p>
            <h2>The gap your calculator showed you is recoverable. Find out how.</h2>
            <p className="desc">
              Enter your details. We'll send your personalised revenue report, free, instantly.
            </p>
            <ul className="final-list">
              <li>Your exact monthly revenue gap, by the pound</li>
              <li>Your occupancy gap vs. the UK managed benchmark</li>
              <li>Your rate optimisation potential</li>
              <li>Your unclaimed damage recovery estimate</li>
              <li>Your portfolio's next step, specific to your size</li>
            </ul>
          </div>

          <div>
            <div className="form-card">
              <p className="form-card-heading">Get Your Free Report</p>
              <p className="form-card-sub">Free. No credit card. No sales call.</p>
              <LeadForm onSuccess={setSubmitted} />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-inner">
          <img src={virtuproLogo} alt="VirtuPro" className="footer-logo" />
          <p className="footer-copy">
            &copy; 2025 VirtuPro. Full-service Airbnb co-hosting for UK &amp; UAE holiday let owners.
          </p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
