import React, { useState, useEffect } from "react";
import { Check, Shield, Rocket, Zap, MousePointerClick, Settings2, Lock, Stars, ArrowRight, Menu, X, Chrome, CreditCard, Workflow, Github } from "lucide-react";

// Backend API configuration
const API_BASE_URL = 'http://localhost:3001';

// API functions
const api = {
  // Check backend health
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { ok: false };
    }
  },
  
  // Redeem a code for tokens
  redeemCode: async (code, uid = 'anonymous') => {
    try {
      const response = await fetch(`${API_BASE_URL}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, uid })
      });
      return await response.json();
    } catch (error) {
      console.error('Token redemption failed:', error);
      throw error;
    }
  },
  
  // Generate cover letter
  generateCoverLetter: async (title, jd, uid = 'anonymous') => {
    try {
      console.log('🚀 Sending cover letter request:', { title, jd: jd.substring(0, 50) + '...', uid });
      const response = await fetch(`${API_BASE_URL}/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, jd, uid })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.status === 402) {
        throw new Error('No tokens available');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error:', response.status, errorText);
        throw new Error(`API error: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Cover letter generated:', result);
      return result;
    } catch (error) {
      console.error('Cover letter generation failed:', error);
      throw error;
    }
  },
  
  // Redirect to checkout (Stripe)
  redirectToCheckout: () => {
    window.open(`${API_BASE_URL}/checkout`, '_blank');
  }
};

// Mint palette
const mint = {
  bg: "#0f172a", // slate-900 base for contrast
  light: "#e6fff5",
  tint: "#b7fbe3",
  mid: "#7ef5cf",
  brand: "#22D3A9", // mint/teal brand
  deep: "#0ea37a",
};

// Simple logo: centered Mintapply "M" inside rounded square
const Logo = ({ className = "w-8 h-8" }) => (
  <div className={`grid place-items-center rounded-2xl ${className}`} style={{ background: mint.brand }}>
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-label="Mintapply logo">
      <path d="M5 18V6a1 1 0 0 1 1-1h1.6a1 1 0 0 1 .8.4L12 9l3.6-3.6a1 1 0 0 1 .8-.4H18a1 1 0 0 1 1 1v12h-3V10.6l-2.6 2.6a1 1 0 0 1-1.4 0L9.4 10.6V18H5z" fill="white" />
    </svg>
  </div>
);

const TokenRedemption = ({ onTokensUpdated }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await api.redeemCode(code.trim());
      setMessage(`✅ Success! You now have ${result.tokens} tokens.`);
      setCode('');
      if (onTokensUpdated) onTokensUpdated(result.tokens);
    } catch (error) {
      setMessage('❌ Invalid or expired code. Try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h4 className="mb-3 text-sm font-medium text-white">Redeem Code</h4>
      <form onSubmit={handleRedeem} className="space-y-3">
        <input
          type="text"
          placeholder="Enter redemption code (e.g., MINT10)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/30"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
        >
          {loading ? 'Redeeming...' : 'Redeem Code'}
        </button>
      </form>
      {message && (
        <p className="mt-2 text-xs text-white/70">{message}</p>
      )}
    </div>
  );
};

const CoverLetterDemo = () => {
  const [jobTitle, setJobTitle] = useState('Software Engineer Intern');
  const [jobDescription, setJobDescription] = useState('We are looking for a passionate software engineering intern to join our team. You will work on React, Node.js, and AWS technologies while collaborating with senior engineers.');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setMessage('');
    setCoverLetter('');
    
    try {
      console.log('🎯 Starting cover letter generation...');
      const result = await api.generateCoverLetter(jobTitle, jobDescription);
      setCoverLetter(result.text);
      setMessage('✅ Cover letter generated successfully!');
    } catch (error) {
      console.error('❌ Cover letter generation error:', error);
      if (error.message.includes('No tokens')) {
        setMessage('❌ No tokens available. Please purchase or redeem tokens first.');
      } else if (error.message.includes('fetch')) {
        setMessage('❌ Connection error. Please check if the backend is running.');
      } else {
        setMessage(`❌ Failed to generate cover letter: ${error.message}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
      <h4 className="text-sm font-medium text-white">AI Cover Letter Generator</h4>
      
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/30"
        />
        
        <textarea
          placeholder="Job Description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/30 resize-none"
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !jobTitle.trim()}
          className="w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Cover Letter (1 Token)'}
        </button>
      </div>

      {message && (
        <p className="text-xs text-white/70">{message}</p>
      )}

      {coverLetter && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <h5 className="mb-2 text-xs font-medium text-white">Generated Cover Letter:</h5>
          <div className="text-xs text-white/80 whitespace-pre-wrap">{coverLetter}</div>
        </div>
      )}
    </div>
  );
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
    {children}
  </span>
);

const Container = ({ children }) => (
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
);

const Nav = () => {
  const [open, setOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  
  useEffect(() => {
    api.checkHealth().then(result => {
      setBackendStatus(result.ok ? 'online' : 'offline');
    }).catch(() => {
      setBackendStatus('offline');
    });
  }, []);
  
  const link = "text-white/80 hover:text-white transition";
  const statusColors = {
    checking: 'bg-yellow-500',
    online: 'bg-green-500',
    offline: 'bg-red-500'
  };
  
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur bg-slate-900/70">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-semibold text-white">Mintapply</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColors[backendStatus]}`} title={`Backend ${backendStatus}`}/>
              <span className="text-xs text-white/60">API</span>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className={link}>Features</a>
            <a href="#how" className={link}>How it works</a>
            <a href="#pricing" className={link}>Pricing</a>
            <a href="#faq" className={link}>FAQ</a>
            <a href="#install" className="rounded-full bg-white text-slate-900 font-medium px-4 py-2 hover:opacity-90 transition flex items-center gap-2"><Chrome className="w-4 h-4"/>Get Extension</a>
          </nav>
          <button className="md:hidden p-2 text-white" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open? <X/> : <Menu/>}</button>
        </div>
        {open && (
          <div className="md:hidden pb-4 space-y-2">
            {[
              ["#features","Features"],
              ["#how","How it works"],
              ["#pricing","Pricing"],
              ["#faq","FAQ"],
            ].map(([href,label]) => (
              <a key={href} href={href} className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/5" onClick={()=>setOpen(false)}>{label}</a>
            ))}
            <a href="#install" className="block rounded-lg px-3 py-2 bg-white text-slate-900 font-medium" onClick={()=>setOpen(false)}>
              Get Extension
            </a>
          </div>
        )}
      </Container>
    </header>
  );
};

const Hero = () => (
  <section id="home" className="relative overflow-hidden pt-28 pb-20">
    <div className="absolute inset-0 -z-10 opacity-40" aria-hidden>
      <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl" style={{ background: `radial-gradient(closest-side, ${mint.brand}, transparent)`}}/>
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(closest-side, ${mint.mid}, transparent)`}}/>
    </div>
    <Container>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Badge><Stars className="w-4 h-4"/> Job applications, on autopilot</Badge>
          <h1 className="text-4xl/tight sm:text-5xl/tight font-extrabold text-white">Apply smarter with <span style={{ color: mint.mid }}>Mintapply</span>.</h1>
          <p className="text-white/70 text-lg max-w-xl">A mint‑fresh Chrome extension that scrapes job pages, pre‑fills forms, and crafts tailored cover letters using your profile. Faster submissions, fewer typos, more interviews.</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#install" className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-slate-900">
              <Chrome className="w-5 h-5"/>
              Install for Chrome
              <ArrowRight className="w-5 h-5 transition group-hover:translate-x-0.5"/>
            </a>
            <a href="#demo" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-white/90 hover:bg-white/5">
              <MousePointerClick className="w-5 h-5"/> Watch demo
            </a>
          </div>
          <div className="flex items-center gap-6 pt-2 text-white/60">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> Privacy‑first</div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4"/> 10x faster forms</div>
            <div className="flex items-center gap-2"><Lock className="w-4 h-4"/> Secure by design</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30" style={{ background: `linear-gradient(135deg, ${mint.brand}, ${mint.mid})`}}/>
          <div className="relative rounded-3xl border border-white/10 bg-slate-800 p-3 shadow-2xl">
            {/* Browser mock */}
            <div className="flex items-center gap-2 border-b border-white/10 p-2">
              <span className="h-3 w-3 rounded-full bg-red-400"/>
              <span className="h-3 w-3 rounded-full bg-yellow-300"/>
              <span className="h-3 w-3 rounded-full bg-green-400"/>
              <div className="ml-3 flex-1 rounded bg-slate-700 px-3 py-1 text-xs text-white/60">https://careers.example.com/apply</div>
            </div>
            <div className="grid gap-3 p-4 sm:p-6">
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="mb-3 text-sm font-medium text-white">Mintapply autofill</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["First name","Last name","Email","Phone","LinkedIn","Portfolio"].map((label)=> (
                    <label key={label} className="text-xs text-white/60">
                      {label}
                      <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/30" placeholder={label} />
                    </label>
                  ))}
                </div>
                <div className="mt-3 text-right">
                  <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900">Autofill</button>
                </div>
              </div>
              <CoverLetterDemo />
            </div>
          </div>
        </div>
      </div>
    </Container>
  </section>
);

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <div className="mb-4 inline-flex items-center justify-center rounded-xl" style={{ background: mint.brand + "20" }}>
      <Icon className="h-6 w-6" style={{ color: mint.mid }} />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
    <p className="text-white/70">{desc}</p>
  </div>
);

const Features = () => (
  <section id="features" className="py-20">
    <Container>
      <div className="mx-auto max-w-3xl text-center">
        <Badge><Rocket className="w-4 h-4"/> Why Mintapply</Badge>
        <h2 className="mt-3 text-3xl font-bold text-white">Polish, speed, and privacy in one extension</h2>
        <p className="mt-3 text-white/70">Built for high‑volume applicants and power users. Mintapply pre‑fills ATS forms, scrapes job descriptions responsibly, and drafts cover letters aligned to your profile tokens.</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Feature icon={Settings2} title="Smart Autofill" desc="Learns your profile once, then maps fields across Workday, Greenhouse, Lever, and more."/>
        <Feature icon={Workflow} title="JD Scraper" desc="Parses role, level, stack, and values to tailor every application in seconds."/>
        <Feature icon={Shield} title="Privacy‑first" desc="Local storage by default, with optional cloud sync. Your data stays yours."/>
        <Feature icon={Lock} title="Secure Tokens" desc="Pay‑as‑you‑go Mint Tokens for AI cover letters; no surprise subscriptions."/>
        <Feature icon={Zap} title="One‑click Apply" desc="Blast through repetitive fields with clean, consistent data."/>
        <Feature icon={Github} title="Open Integrations" desc="CLI and API hooks so you can plug Mintapply into your pipeline."/>
      </div>
    </Container>
  </section>
);

const Steps = () => (
  <section id="how" className="py-20">
    <Container>
      <div className="mx-auto max-w-3xl text-center">
        <Badge>Getting started</Badge>
        <h2 className="mt-3 text-3xl font-bold text-white">Three steps to mint‑clean applications</h2>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[{
          title: "Install & import",
          desc: "Add Mintapply to Chrome. Import LinkedIn/Resume once.",
          icon: Chrome
        },{
          title: "Map & verify",
          desc: "We map fields across ATS. You review and tweak.",
          icon: Settings2
        },{
          title: "Apply & refine",
          desc: "Autofill forms and generate tailored cover letters using Mint Tokens.",
          icon: MousePointerClick
        }].map((s,i)=> (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-3 text-sm text-white/60">Step {i+1}</div>
            <s.icon className="mb-4 h-6 w-6" style={{ color: mint.mid }} />
            <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
            <p className="text-white/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </Container>
  </section>
);

const Pricing = () => {
  const [tokens, setTokens] = useState(0);

  return (
    <section id="pricing" className="py-20">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Badge><CreditCard className="w-4 h-4"/> Pricing</Badge>
          <h2 className="mt-3 text-3xl font-bold text-white">Start free. Scale with tokens.</h2>
          <p className="mt-3 text-white/70">Great for students, power applicants, and pros. Only pay when you need AI cover letters.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[{
            name: "Free",
            price: "£0",
            note: "No credit card",
            features: ["Unlimited autofill","Basic scraping","Local storage"],
            cta: "Get started",
            highlight: false,
            action: () => window.open('https://chrome.google.com/webstore', '_blank')
          },{
            name: "Mint Tokens",
            price: "£5",
            note: "per 50 tokens",
            features: ["AI cover letters","Tone presets","Role‑aware tailoring"],
            cta: "Buy tokens",
            highlight: true,
            action: () => api.redirectToCheckout()
          },{
            name: "Pro",
            price: "£9/mo",
            note: "Optional subscription",
            features: ["Cloud sync","Custom templates","Priority support"],
            cta: "Go Pro",
            highlight: false,
            action: () => api.redirectToCheckout()
          }].map((tier)=> (
            <div key={tier.name} className={`rounded-2xl border p-6 ${tier.highlight? "border-white/40 bg-white/10" : "border-white/10 bg-white/5"}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <span className="text-sm text-white/60">{tier.note}</span>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <div className="text-3xl font-extrabold text-white">{tier.price}</div>
              </div>
              <ul className="mt-6 space-y-2 text-white/80">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" style={{ color: mint.mid }} /><span>{f}</span></li>
                ))}
              </ul>
              <button
                onClick={tier.action}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium ${tier.highlight? "bg-white text-slate-900" : "border border-white/20 text-white hover:bg-white/5"}`}
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4"/>
              </button>
            </div>
          ))}
        </div>
        
        {/* Token Redemption Section */}
        <div className="mt-10 mx-auto max-w-md">
          <TokenRedemption onTokensUpdated={setTokens} />
          {tokens > 0 && (
            <div className="mt-3 text-center text-sm text-white/70">
              Current balance: <span className="font-medium text-white">{tokens} tokens</span>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

const FAQ = () => (
  <section id="faq" className="py-20">
    <Container>
      <div className="mx-auto max-w-3xl text-center">
        <Badge>FAQ</Badge>
        <h2 className="mt-3 text-3xl font-bold text-white">Answers before you install</h2>
      </div>
      <div className="mx-auto mt-8 max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {[
          ["How does the cover letter generation work?","When you click 'Generate', Mintapply extracts publicly visible job data from the current tab, merges it with your saved profile, and spends a token to craft a tailored draft. You can edit before inserting."],
          ["Is my data private?","Yes. By default, your profile lives locally in your browser. Optional cloud sync encrypts at rest and in transit."],
          ["Which ATS are supported?","We support common systems like Workday, Greenhouse, and Lever. More can be added via the community mapping hub."],
          ["What are Mint Tokens?","A pay‑as‑you‑go balance used for AI features like cover‑letter drafts. Autofill remains free."],
        ].map(([q,a]) => (
          <details key={q} className="group p-6">
            <summary className="cursor-pointer list-none text-left text-white">
              <div className="flex items-center justify-between">
                <span className="font-medium">{q}</span>
                <span className="text-white/50 transition group-open:rotate-90">›</span>
              </div>
            </summary>
            <p className="mt-2 text-white/70">{a}</p>
          </details>
        ))}
      </div>
    </Container>
  </section>
);

const CTA = () => (
  <section id="install" className="pb-24 pt-12">
    <Container>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-12">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full blur-3xl" style={{ background: mint.brand }}/>
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"><Logo className="w-6 h-6"/> Mintapply</div>
            <h3 className="text-2xl font-bold text-white">Make every application mint‑clean.</h3>
            <p className="mt-1 text-white/70">Install the extension and breeze through forms in minutes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-slate-900" href="#">
              <Chrome className="h-5 w-5"/> Add to Chrome
            </a>
            <a className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-white" href="#demo">
              Watch demo
            </a>
          </div>
        </div>
      </div>
    </Container>
  </section>
);

const Footer = () => (
  <footer className="border-t border-white/10 py-10">
    <Container>
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <div className="font-semibold text-white">Mintapply</div>
            <div className="text-sm text-white/60">Mint‑themed job applier extension</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <a className="text-white/70 hover:text-white" href="#features">Features</a>
          <a className="text-white/70 hover:text-white" href="#pricing">Pricing</a>
          <a className="text-white/70 hover:text-white" href="#faq">FAQ</a>
          <a className="text-white/70 hover:text-white" href="#">Privacy</a>
          <a className="text-white/70 hover:text-white" href="#">Terms</a>
        </div>
      </div>
      <div className="mt-6 text-xs text-white/50">© {new Date().getFullYear()} Mintapply. Built with ❤️ for applicants.</div>
    </Container>
  </footer>
);

export default function MintapplyLanding() {
  return (
    <div className="min-h-screen bg-slate-900" style={{ background: `radial-gradient(1200px 600px at 10% -10%, ${mint.brand}15, transparent), radial-gradient(1000px 500px at 110% 0%, ${mint.mid}10, transparent), ${mint.bg}` }}>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Steps />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
