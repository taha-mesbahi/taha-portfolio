import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { Shield, LogOut, Moon, Sun, Mail, Phone, MapPin, Linkedin, Download, CheckCircle2, GraduationCap, Languages, ArrowUpRight, ArrowRight, ExternalLink, Terminal, FileText } from "lucide-react"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from "framer-motion";
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

// === DATA ===
const profile = {
  name: "Taha Mesbahi",
  title: "Ingénieur Data & Transformation Digitale — Industrie 4.0",
  subtitle: "Apprenti ingénieur (INSA Rouen). Optimisation de process, analytics temps réel, apps métiers sécurisées et cyber‑résilience.",
  location: "Rouen, Normandie, France",
  email: "tahamesbahi123@gmail.com",
  phone: "+33 6 99 72 31 51",
  linkedin: "https://www.linkedin.com/in/tahamesbahi",
  availability: "Ouvert aux opportunités — alternance / CDI",
  cvUrl: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/cv%2FCV%20Taha%20MESBAHI%20ATS%20Friendly%20FR.pdf?alt=media&token=7e53f8ef-50d0-461b-864a-2be339ec7232"
};

const stats = [
  { label: "Optimisation rapidité", value: "+37%" },
  { label: "Erreurs en moins", value: "-80%" },
  { label: "Économies annuelles", value: "130–420 k€" },
  { label: "Langues", value: "FR • EN • AR" },
];

const skills = {
  "Data & Analytics": [ "Excel avancé", "SQL (MySQL/PSQL)", "BigQuery", "GCP", "Looker", "Spotfire", "Power BI", "AppSheet", "IBM SPSS", "SAP (S/4HANA, BTP)" ],
  "Développement & Full‑Stack": [ "Node.js", "PHP", "Vue.js", "JavaScript", "TypeScript", "HTML", "CSS", "C", "Java", "Matlab/Scilab", "UML", "Git", "Firebase Storage & Auth", "LaTeX" ],
  "IoT & Industrie 4.0": [ "Node‑RED", "OPC UA", "Arduino", "Capteurs Keyence/Schneider", "Automatisation de flux", "PLC (Siemens/Schneider)", "LTspice / Digital Works", "Step7, WinCC", "Grafana", ],
  "Automatisation & No-Code": [ "n8n", "Zapier", "Automatisation de workflows", "AppSheet" ],
  "IA & Conversationnels": [ "IA prompting", "VAPI", "Twilio", "ElevenLabs", "Agents conversationnels" ],
  "UX & Design": [ "Figma", "Adobe Illustrator", "Adobe Premiere Pro", "WordPress", "Shopify", "Blender" ],
  "Cybersécurité & Réseau": [ "ISO/IEC 27001", "RGPD / GDPR", "SOC 2 / NIS", "OSINT", "Wireshark", "GNU/Linux Hardening", "Kali Suite" ],
  "Gestion de projet": [ "Six Sigma", "Lean", "Scrum", "PMP", "DMAIC", "AMDEC", "ISO 9001:2015" ],
  "Soft skills": [ "Leadership", "Communication", "Médiation", "Gestion du temps", "Adaptabilité" ]
};

const experiences = [
  {
    company: "Ampère (Renault Group)",
    logo: "logos/ampere-renault.png",
    link: "https://www.ampere.cars/",
    role: "Apprenti ingénieur Data & Développeur Full-Stack",
    period: "Sept. 2023 — Juin 2025",
    location: "Cléon (hybride)",
    bullets: [
      "Pilotage de l’analyse de données et optimisation des processus sur lignes moteurs électriques.",
      "Dashboards KPI temps réel : +37% de rapidité, 80% d’erreurs en moins, 130 k€ d’économies/an.",
      "Refonte des workflows Excel → plateforme web WMS sécurisée (Node.js, PHP, MySQL, Vue.js).",
      "Cybersécurité industrielle : remédiation CVEs critiques, système d’alertes ESD (Python).",
    ],
    tags: ["Data", "Industrie 4.0", "Full-Stack", "Cyberdéfense"],
  },
  {
    company: "Fnac Darty",
    logo: "logos/fnacdarty.jpeg",
    link: "https://www.fnacdarty.com/",
    role: "Ingénieur Déploiement Réseau & Systèmes",
    period: "Août 2025 — Aujourd’hui",
    location: "Rouen (sur site)",
    bullets: [
      "Ouverture DARTY Rouen Docks 76 : câblage structuré Cat6A, certification Fluke DSX.",
      "Sécurité réseau : ACL minimales, politique deny-all, segmentation VLAN, 802.1X.",
    ],
    tags: ["Réseau", "Systèmes", "Sécurité", "Retail"],
  },
  {
    company: "IM Discounts",
    logo: "logos/im-discounts.svg",
    link: "https://www.im-discounts-normandie.fr/",
    role: "Ingénieur Projet Logistique-IT",
    period: "Juil. 2023 — Nov. 2023",
    location: "Canteleu",
    bullets: [
      "Développement de ‘Stock Pro’ (SaaS CRM/WMS/ERP) pour entrepôts agroalimentaires.",
      "+32% d’efficacité opérationnelle.",
    ],
    tags: ["SaaS", "WMS", "ERP", "Automation"],
  },
  {
    company: "8th Sense Group",
    logo: "logos/8thsensegrp.png",
    link: "https://8thsensegroup.ca/",
    role: "Sales Representative — Commerce international",
    period: "Nov. 2022 — Fév. 2024",
    location: "Toronto (remote)",
    bullets: [
      "Négoce matières premières, gestion NCNDA, LC/LOC, Incoterms et due diligence (KYC/AML).",
    ],
    tags: ["Commerce", "Contrats", "Due Diligence"],
  },
  {
    company: "Planet Of Morocco",
    logo: "logos/planetofmorocco.png",
    link: "https://planetofmorocco.com",
    role: "Web Marketing Manager / Dev Web",
    period: "Déc. 2021 — Juin 2022",
    location: "Fès, Maroc",
    bullets: [ "Site vitrine WordPress, automatisation funnel Instagram." ],
    tags: ["Web", "Marketing"],
  },
  {
    company: "AMA Détergents",
    logo: "logos/amadetergent.jpg",
    link: "https://enosis.ma/histoire/",
    role: "Ingénieur Qualité Junior",
    period: "Juil. 2021 — Août 2021",
    location: "El Jadida, Maroc",
    bullets: [ "Supervision ligne poudre, suivi qualité, PLC Siemens PCS7." ],
    tags: ["Qualité", "PLC"],
  },
];

const education = [
  { school: "INSA Rouen Normandie", degree: "Ingénieur — Performance Numérique Industrielle", period: "2022 — 2026", logo: "logos/insarouen.jpg", link: "https://www.insa-rouen.fr/" },
  { school: "INSA Euro-Méditerranée", degree: "Diplôme d’Ingénieur — Informatique", period: "2019 — 2022", logo: "logos/INSA_Euro-Mediterranee_Fes.png", link: "https://www.ueuromed.org/" },
  { school: "Baccalauréat — Sciences Mathématiques", degree: "Mention Très Bien", period: "2019" },
];

const languages = [ { name: "Français", level: "C1 (DALF)" }, { name: "Anglais", level: "C2 (TOEIC 980)" }, { name: "Arabe", level: "B2" } ];

// Liste complète restaurée
const certifications = [
  { title: "ISO/IEC 27001 Information Security Associate™", org: "SkillFront", date: "2025", domain: "Sécurité" },
  { title: "ISO 9001:2015 — QMS", org: "Alison", date: "2024", domain: "Qualité" },
  { title: "ISO 31000:2018 — Enterprise Risk Management", org: "Alison", date: "2024", domain: "Gestion des risques" },
  { title: "Les principes RGPD de la protection des données", org: "CNIL", date: "2023", domain: "Conformité" },
  { title: "Privacy Impact Assessment (PIA)", org: "OAIC", date: "2023", domain: "Conformité" },
  { title: "Défense : La protection du secret", org: "DRSD", date: "2023", domain: "Sécurité" },
  { title: "ANSSI SecNum (Sécurité Numérique)", org: "ANSSI", date: "2023", domain: "Sécurité" },
  { title: "Cybercrime and Electronic Evidence", org: "Conseil de l’Europe", date: "2024", domain: "Droit & Cyber" },
  { title: "AI Masterclass", org: "Renault Group", date: "2024", domain: "Data & AI" },
  { title: "Introduction to LLMs", org: "Google Cloud", date: "2024", domain: "Data & AI" },
  { title: "ChatGPT for Data Analytics", org: "Luke Barousse", date: "2023", domain: "Data & AI" },
  { title: "Data Literacy", org: "DataCamp", date: "2024", domain: "Data & AI" },
  { title: "Building No‑Code Apps with AppSheet", org: "Google Cloud", date: "2024", domain: "No‑Code" },
  { title: "Road Vehicles Cybersecurity (ISO 21434)", org: "Ampère", date: "2024", domain: "Automobile" },
  { title: "Protégez vos systèmes numériques", org: "Groupe INSA", date: "2024", domain: "Sécurité" },
  { title: "Smart Cities", org: "LinkedIn", date: "2024", domain: "Ville & Systèmes" },
  { title: "Project Management Foundations", org: "PMI", date: "2023", domain: "Management" },
  { title: "Guide to Advanced Lean Manufacturing", org: "Alison", date: "2024", domain: "Lean" },
  { title: "Mediation and Conflict Resolution", org: "ESSEC", date: "2023", domain: "Management" },
  { title: "Anti‑Trust Laws", org: "Renault Group", date: "2023", domain: "Droit" },
  { title: "Données et Gouvernance Urbaine", org: "Sciences Po", date: "2024", domain: "Gouvernance" },
  { title: "Human Rights in the Armed Forces", org: "Conseil de l’Europe", date: "2023", domain: "Droit" },
  { title: "Open‑Source Intelligence (OSINT)", org: "Basel Institute", date: "2022", domain: "OSINT" },
  { title: "Visualizing Cases and Flows of Money", org: "Basel Institute", date: "2022", domain: "OSINT" },
  { title: "Financial Analysis (AML)", org: "Basel Institute", date: "2022", domain: "OSINT" },
  { title: "AML/CFT", org: "Egmont Group", date: "2023", domain: "AML/CFT" },
  { title: "International Cooperation", org: "Basel Institute", date: "2022", domain: "Droit" },
  { title: "Introduction to Networking", org: "Hack The Box", date: "2023", domain: "Réseau" },
  { title: "International Trade & eBusiness", org: "eBSI", date: "2023", domain: "Commerce" },
  { title: "International Model United Nations", org: "United Nations", date: "2024", domain: "Diplomatie" },
  { title: "Vigipirate", org: "SGDSN", date: "2024", domain: "Sécurité" },
  { title: "Comprendre la Propriété Intellectuelle", org: "INPI", date: "2023", domain: "Droit" },
  { title: "TOEFL", org: "ETS", date: "2019", domain: "Langues" },
  { title: "DALF C1", org: "France Éducation", date: "2018", domain: "Langues" }
];

// === UI COMPONENTS ===

// 1. Dark Glass Card (Theming)
const DarkGlassCard = ({ className = "", children, hoverEffect = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={hoverEffect ? { y: -4 } : {}}
    transition={{ type: "spring", stiffness: 50, damping: 20 }}
    className={`
      relative rounded-[24px] border border-white/5 bg-[#121212]/60 backdrop-blur-xl p-6 
      shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden group
      ${hoverEffect ? 'hover:bg-white/5 transition-all duration-300' : ''} 
      ${className}
    `}
  >
    {hoverEffect && (
        <div className="absolute -inset-px rounded-[24px] border border-transparent group-hover:border-[#81D8D0]/20 transition-colors pointer-events-none" />
    )}
    {hoverEffect && (
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#81D8D0] rounded-full opacity-0 blur-[60px] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
    )}
    <div className="relative z-10">{children}</div>
  </motion.div>
);

// 2. Badges
const Badge = ({ children, variant = "default" }) => {
    const styles = {
        default: "bg-white/5 border-white/10 text-zinc-300 hover:border-[#81D8D0]/30 hover:text-[#81D8D0]",
        cyan: "bg-[#81D8D0]/10 border-[#81D8D0]/20 text-[#81D8D0]",
        outline: "bg-transparent border-white/20 text-white/60"
    }
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase transition-colors ${styles[variant]}`}>
      {children}
    </span>
  );
}

// 3. Background
const CyberBackground = () => (
    <>
      <div className="fixed inset-0 bg-[#050505] z-[-2]"></div>
      <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none"
           style={{
               backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                                 linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
           }}
      />
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-repeat"
           style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
           }}
      />
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#81D8D0] rounded-full blur-[150px] opacity-[0.08] z-[-1] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900 rounded-full blur-[150px] opacity-[0.1] z-[-1] pointer-events-none"></div>
    </>
);

const CompanyAvatar = ({ name, logo, link }) => {
    const [failed, setFailed] = React.useState(false);
    
    // Fallback pour les chemins relatifs si besoin
    const base = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
    const resolved = logo?.startsWith("http") ? logo : base + logo?.replace(/^\/+/, "");

    const Wrapper = link ? "a" : "div";
    const wrapperProps = link ? { href: link, target: "_blank", rel: "noopener noreferrer", title: name } : { title: name };
  
    return (
      <Wrapper {...wrapperProps} className="shrink-0 group relative z-10">
        <div className="h-12 w-12 rounded-xl overflow-hidden bg-white p-1 border border-white/10 grid place-items-center group-hover:border-[#81D8D0]/50 transition-colors shadow-sm">
          {logo && !failed ? (
            <img src={resolved} alt={name} loading="lazy" className="h-full w-full object-contain" onError={() => setFailed(true)} />
          ) : (
            <span className="text-xs font-bold text-black/50">{name.slice(0,2)}</span>
          )}
        </div>
      </Wrapper>
    );
};

// === MAIN APP ===
export default function App() {
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [user, setUser] = useState(null);
  const [lightbox, setLightbox] = useState({ open:false, images:[], index:0 });
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [domain, setDomain] = useState("Tous");

  useEffect(() => {
    const q = query(collection(db,'projects'), orderBy('featured','desc'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, (snap)=>{
      setProjects(snap.docs.map(d=>({ id:d.id, ...d.data() })));
      setLoadingProjects(false);
    });
    const authUnsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => { unsub(); authUnsub(); }
  }, []);

  const scrollToId = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAdminClick = async () => {
    try {
      if (!user) await signInWithPopup(auth, googleProvider)
      window.location.hash = '#/admin'
    } catch (e) { alert("Connexion annulée.") }
  };

  // Lightbox Logic
  const openLightbox = (images, index=0) => setLightbox({ open:true, images, index });
  const closeLightbox = () => setLightbox(l => ({ ...l, open:false }));
  const nextImage = () => setLightbox(l => ({ ...l, index:(l.index + 1) % l.images.length }));
  
  useEffect(() => {
    if(lightbox.open) setZoom(1);
    const onKey = (e) => { if(e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  // Filtering Certs
  const filteredCerts = useMemo(() => {
    return certifications.filter((c) => (domain === "Tous" ? true : c.domain === domain))
      .filter((c) => searchTerm.trim() ? (c.title + c.org).toLowerCase().includes(searchTerm.toLowerCase()) : true);
  }, [searchTerm, domain]);
  const domains = ["Tous", ...Array.from(new Set(certifications.map((c) => c.domain)))];


  return (
    <div className="min-h-screen w-full text-zinc-300 font-sans selection:bg-[#81D8D0] selection:text-black overflow-x-hidden">
      <CyberBackground />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center animate-fade-in print:hidden">
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl">
           <a href="#about" onClick={scrollToId('about')} className="px-4 py-2 rounded-full text-xs font-medium hover:bg-white/10 hover:text-white transition-all">Profile</a>
           <a href="#projects" onClick={scrollToId('projects')} className="px-4 py-2 rounded-full text-xs font-medium hover:bg-white/10 hover:text-white transition-all">Work</a>
           <a href="#skills" onClick={scrollToId('skills')} className="px-4 py-2 rounded-full text-xs font-medium hover:bg-white/10 hover:text-white transition-all">Skills</a>
           <div className="h-4 w-px bg-white/10 mx-1"></div>
           <a href={profile.linkedin} target="_blank" className="p-2 rounded-full hover:bg-white/10 hover:text-[#0077b5] transition-colors"><Linkedin size={14} /></a>
           <button onClick={handleAdminClick} className="p-2 rounded-full hover:bg-white/10 hover:text-red-400 transition-colors"><Shield size={14} /></button>
           <a href="#contact" onClick={scrollToId('contact')} className="ml-1 px-5 py-2 rounded-full bg-[#81D8D0] text-black text-xs font-bold hover:brightness-110 shadow-[0_0_15px_-3px_rgba(129,216,208,0.4)] transition-all">
             Contact
           </a>
        </div>
      </nav>

      {/* --- CONTENT --- */}
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20 print:bg-white print:text-black print:pt-0">
        
        {/* HERO */}
        <section id="about" className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
           <div className="lg:col-span-7 order-2 lg:order-1">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#81D8D0]/20 bg-[#81D8D0]/5 text-[#81D8D0] text-[10px] font-mono mb-6 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81D8D0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#81D8D0]"></span>
                </span>
                {profile.availability}
             </div>
             <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white leading-[1.1] mb-6">
               <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">{profile.name}</span>
               <span className="text-2xl md:text-3xl text-zinc-500 font-light block mt-2">{profile.title}</span>
             </h1>
             <p className="text-lg text-zinc-400 font-light max-w-xl leading-relaxed mb-8">{profile.subtitle}</p>
             <div className="flex flex-wrap gap-4">
                <a href="#projects" className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium text-sm hover:scale-105 transition-transform">
                  <span>Voir les projets</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-sm">
                  <Download className="w-4 h-4" />
                  <span>CV.pdf</span>
                </a>
             </div>
           </div>
           <div className="lg:col-span-5 order-1 lg:order-2">
              <DarkGlassCard className="tiffany-glow">
                 <h3 className="text-white font-medium flex items-center gap-2 mb-4"><Terminal size={16} className="text-[#81D8D0]"/> Impact Metrics</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {stats.map(s => (
                        <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-2xl font-medium text-white tracking-tight">{s.value}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{s.label}</div>
                        </div>
                    ))}
                 </div>
              </DarkGlassCard>
           </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="mb-24 pt-10 border-t border-white/5">
            <h2 className="text-3xl text-white font-medium mb-8 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#81D8D0]"></span> Technical Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(skills).map(([group, items]) => (
                    <DarkGlassCard key={group} className="hover:border-[#81D8D0]/30 transition-colors">
                        <h3 className="text-zinc-100 font-medium mb-4 text-sm uppercase tracking-wider text-[#81D8D0]">{group}</h3>
                        <div className="flex flex-wrap gap-2">
                            {items.map(it => <Badge key={it} variant="default">{it}</Badge>)}
                        </div>
                    </DarkGlassCard>
                ))}
            </div>
        </section>

        {/* EXPERIENCE (With Company Icons) */}
        <section id="experience" className="mb-24 pt-10 border-t border-white/5">
            <h2 className="text-3xl text-white font-medium mb-12">Experience Timeline</h2>
            <div className="relative border-l border-white/10 ml-6 space-y-12">
                {experiences.map((exp, idx) => (
                    <div key={idx} className="relative pl-12">
                        <span className="absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full bg-[#81D8D0] shadow-[0_0_10px_#81D8D0]"></span>
                        
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                           <div className="flex items-center gap-4 mb-2 md:mb-0">
                               {/* Company Icon Rendered Here */}
                               <CompanyAvatar name={exp.company} logo={exp.logo} link={exp.link} />
                               <div>
                                   <h3 className="text-xl text-white font-medium">{exp.role}</h3>
                                   <a href={exp.link} target="_blank" className="text-sm text-[#81D8D0] hover:underline flex items-center gap-1 mt-1">
                                      {exp.company} <ExternalLink size={12}/>
                                   </a>
                               </div>
                           </div>
                           <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5 w-fit h-fit self-start">{exp.period}</span>
                        </div>
                        
                        <p className="text-sm text-zinc-500 mb-4 pl-[4.5rem] md:pl-0">{exp.location}</p>
                        <ul className="text-zinc-400 text-sm leading-relaxed space-y-2 list-disc ml-4 marker:text-zinc-600">
                           {exp.bullets.map((b,i) => <li key={i}>{b}</li>)}
                        </ul>
                        <div className="flex gap-2 mt-4 flex-wrap">
                            {exp.tags.map(t => <Badge key={t} variant="cyan">{t}</Badge>)}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* PROJECTS (With Impact & Thumbnails) */}
        <section id="projects" className="mb-24 pt-10 border-t border-white/5">
            <div className="flex items-end justify-between mb-10">
                <h2 className="text-3xl text-white font-medium">Selected Work</h2>
                <div className="text-sm text-zinc-500">Live & Deployed</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingProjects ? (
                    <div className="text-zinc-500">Loading database...</div>
                ) : projects.map((p) => (
                    <DarkGlassCard key={p.id} className="group p-0 overflow-hidden h-full flex flex-col">
                        {p.mainImageUrl && (
                            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-white/5">
                                <img src={p.mainImageUrl} alt={p.name} onClick={() => openLightbox([p.mainImageUrl, ...(p.galleryUrls || [])], 0)}
                                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer opacity-80 group-hover:opacity-100" />
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight size={16} className="text-white"/>
                                </div>
                            </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-medium text-white mb-2 group-hover:text-[#81D8D0] transition-colors">{p.name}</h3>
                            <p className="text-sm text-zinc-400 font-light leading-relaxed mb-4 flex-1">{p.description}</p>
                            
                            {/* Stack */}
                            {p.stack && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {p.stack.slice(0,4).map((s,i) => <span key={i} className="text-[10px] px-2 py-1 bg-white/5 rounded text-zinc-500 border border-white/5">{s}</span>)}
                                </div>
                            )}

                            {/* Impact Section Restored */}
                            {Array.isArray(p.impact) && p.impact.length > 0 && (
                                <div className="mb-4 pt-3 border-t border-white/5">
                                    <div className="text-[10px] uppercase tracking-wider text-[#81D8D0] font-medium mb-1">Impact</div>
                                    <div className="text-xs text-zinc-300 font-mono">
                                        {p.impact.join(" • ")}
                                    </div>
                                </div>
                            )}

                            {/* PDF Thumbnails Restored */}
                            {Array.isArray(p.pdfs) && p.pdfs.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                                    {p.pdfs.map((pdf, i) => (
                                        <a key={i} href={pdf.url} target="_blank" className="group/pdf flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                            {pdf.thumbUrl ? (
                                                <img src={pdf.thumbUrl} className="w-6 h-8 object-cover rounded shadow-sm opacity-80 group-hover/pdf:opacity-100"/>
                                            ) : (
                                                <FileText className="w-6 h-6 text-zinc-500 group-hover/pdf:text-[#81D8D0]"/>
                                            )}
                                            <div className="overflow-hidden">
                                                <div className="text-[10px] text-zinc-400 truncate group-hover/pdf:text-white transition-colors">{pdf.name}</div>
                                                <div className="text-[9px] text-[#81D8D0] opacity-0 group-hover/pdf:opacity-100 transition-opacity">Télécharger</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Gallery Link */}
                            {p.galleryUrls?.length > 0 && (
                                <div className="mt-4">
                                    <button onClick={() => openLightbox([p.mainImageUrl, ...(p.galleryUrls || [])], 0)} className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                                        + {p.galleryUrls.length} images
                                    </button>
                                </div>
                            )}
                        </div>
                    </DarkGlassCard>
                ))}
            </div>
        </section>

        {/* EDUCATION & CERTS (All Certs Restored) */}
        <section id="education" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
            <div>
                 <h2 className="text-2xl text-white font-medium mb-6 flex items-center gap-2"><GraduationCap className="text-[#81D8D0]"/> Education</h2>
                 <div className="space-y-4">
                    {education.map((edu, i) => (
                        <DarkGlassCard key={i} hoverEffect={false}>
                            <div className="flex items-start gap-4">
                                {edu.logo && <div className="w-10 h-10 rounded bg-white p-1"><img src={edu.logo} className="w-full h-full object-contain"/></div>}
                                <div>
                                    <h3 className="text-white font-medium">{edu.school}</h3>
                                    <div className="text-sm text-zinc-400">{edu.degree}</div>
                                    <div className="text-xs text-zinc-600 mt-1 font-mono">{edu.period}</div>
                                </div>
                            </div>
                        </DarkGlassCard>
                    ))}
                 </div>
            </div>

            <div>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl text-white font-medium flex items-center gap-2"><CheckCircle2 className="text-[#81D8D0]"/> Certifications</h2>
                    <select value={domain} onChange={(e) => setDomain(e.target.value)} className="bg-black border border-white/10 text-xs rounded-lg px-2 py-1 outline-none focus:border-[#81D8D0]">
                        {domains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 {/* Scrollable list for extensive certificates */}
                 <div className="space-y-2 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCerts.map((c, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors group">
                            <div>
                                <div className="text-sm text-zinc-200 font-medium group-hover:text-[#81D8D0] transition-colors">{c.title}</div>
                                <div className="text-xs text-zinc-500">{c.org} • {c.date}</div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5 whitespace-nowrap ml-2">{c.domain}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-24 pt-10 border-t border-white/5 text-center pb-24">
             <div className="flex justify-center gap-6 mb-6">
                 <a href={`mailto:${profile.email}`} className="text-zinc-500 hover:text-white transition-colors"><Mail size={18}/></a>
                 <a href={profile.linkedin} target="_blank" className="text-zinc-500 hover:text-white transition-colors"><Linkedin size={18}/></a>
                 <a href={`tel:${profile.phone}`} className="text-zinc-500 hover:text-white transition-colors"><Phone size={18}/></a>
             </div>
             <p className="text-xs text-zinc-700 uppercase tracking-widest">Designed by T. Mesbahi • {new Date().getFullYear()}</p>
        </footer>
      </main>

      {/* --- LIGHTBOX --- */}
      {lightbox.open && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={closeLightbox}>
           <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/50 hover:text-white"><div className="text-4xl">&times;</div></button>
           <img 
             src={lightbox.images[lightbox.index]} 
             className="max-h-[90vh] max-w-full object-contain rounded-md shadow-2xl"
             style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
             onClick={(e) => { e.stopPropagation(); setZoom(z => z === 1 ? 1.5 : 1); }}
           />
           {lightbox.images.length > 1 && (
               <div className="absolute bottom-8 flex gap-4">
                  <button onClick={(e) => {e.stopPropagation(); setZoom(1); nextImage();}} className="text-white bg-white/10 px-4 py-2 rounded-full hover:bg-white/20">Next Image</button>
               </div>
           )}
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #81D8D0; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media print {
            .print\\:hidden { display: none !important; }
            .print\\:bg-white { background-color: white !important; color: black !important; }
            body { background-color: white !important; }
            .fixed { position: static !important; }
        }
      `}</style>
    </div>
  );
}
