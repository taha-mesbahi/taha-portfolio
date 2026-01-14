import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { 
  
  Shield, LogOut, Mail, Phone, MapPin, Linkedin, Download, 
  CheckCircle2, GraduationCap, Languages, ArrowUpRight, ArrowRight, 
  ExternalLink, Terminal, FileText, Cpu, Briefcase, Layers,
  MessageCircle, Send, Globe, Database, Code, Zap, Award,
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Image as ImageIcon
} from "lucide-react"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import html2canvas from "html2canvas"; // Kept if you need custom capture
import jsPDF from "jspdf"; // Kept if you need custom capture

// ==========================================
// 1. TRANSLATIONS & DATA
// ==========================================

const TRANSLATIONS = {
  fr: {
    role: "Ingénieur Data & Transformation Digitale",
    subtitle: "Apprenti ingénieur (INSA Rouen). Optimisation de process, analytics temps réel, apps métiers sécurisées et cyber‑résilience.",
    availability: "Ouvert aux opportunités",
    viewProjects: "Voir les projets",
    downloadCV: "Télécharger CV",
    impact: "Impact Métrique",
    stack: "Stack Technique",
    experience: "Parcours Pro",
    selectedWork: "Projets Sélectionnés",
    liveDeployed: "En production & Déployé",
    education: "Formation",
    certifications: "Certifications & Accréditations",
    contactTitle: "Initialiser Connexion",
    contactDesc: "Disponible pour de nouveaux projets, missions freelance ou opportunités de carrière.",
    nav: { profile: "Profil", work: "Projets", exp: "Exp", stack: "Stack", contact: "Contact" },
    stats: [
        { label: "Optimisation rapidité", value: "+37%" },
        { label: "Erreurs en moins", value: "-80%" },
        { label: "Économies annuelles", value: "130–420 k€" },
        { label: "Langues", value: "FR • EN • AR" }
    ]
  },
  en: {
    role: "Data Engineer & Digital Transformation",
    subtitle: "Apprentice Engineer (INSA Rouen). Process optimization, real-time analytics, secure business apps, and cyber-resilience.",
    availability: "Open to opportunities",
    viewProjects: "View Projects",
    downloadCV: "Download Resume",
    impact: "Impact Metrics",
    stack: "Technical Stack",
    experience: "Experience",
    selectedWork: "Selected Work",
    liveDeployed: "Live & Deployed",
    education: "Education",
    certifications: "Certifications & Awards",
    contactTitle: "Initialize Connection",
    contactDesc: "Available for new projects, freelance missions, or career opportunities.",
    nav: { profile: "Profile", work: "Work", exp: "Exp", stack: "Stack", contact: "Contact" },
    stats: [
        { label: "Speed Optimization", value: "+37%" },
        { label: "Error Reduction", value: "-80%" },
        { label: "Annual Savings", value: "130–420 k€" },
        { label: "Languages", value: "FR • EN • AR" }
    ]
  }
};

const getProfile = (lang) => ({
  name: "Taha Mesbahi",
  title: TRANSLATIONS[lang].role,
  subtitle: TRANSLATIONS[lang].subtitle,
  location: "Rouen, France",
  email: "tahamesbahi123@gmail.com",
  phone: "+33 6 99 72 31 51",
  whatsapp: "33699723151",
  linkedin: "https://www.linkedin.com/in/tahamesbahi",
  cvUrl: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/cv%2FCV%20Taha%20MESBAHI%20ATS%20Friendly%20FR.pdf?alt=media&token=7e53f8ef-50d0-461b-864a-2be339ec7232"
});

const getExperiences = (lang) => {
    const isEn = lang === 'en';
    return [
      {
        company: "Ampère (Renault Group)",
        logo: "logos/ampere-renault.png",
        link: "https://www.ampere.cars/",
        role: isEn ? "Apprentice Data Engineer & Full-Stack" : "Apprenti ingénieur Data & Full-Stack",
        period: "Sept. 2023 — 2025",
        location: "Cléon (Hybrid)",
        bullets: isEn ? [
            "Data analysis & process optimization on EV motor lines.",
            "Real-time KPI Dashboards: +37% speed, -80% errors.",
            "Excel to Web App migration (Node.js, PHP, MySQL).",
            "Industrial Cybersec: CVE remediation, ESD alerts (Python)."
        ] : [
            "Pilotage de l’analyse de données et optimisation des processus.",
            "Dashboards KPI temps réel : +37% de rapidité, -80% d’erreurs.",
            "Refonte Excel → plateforme web WMS sécurisée.",
            "Cybersécurité industrielle : remédiation CVEs, alertes ESD."
        ],
        tags: ["Data", "Industrie 4.0", "Full-Stack", "Cyber"]
      },
      {
        company: "Fnac Darty",
        logo: "logos/fnacdarty.jpeg",
        link: "https://www.fnacdarty.com/",
        role: isEn ? "Network Deployment Engineer" : "Ingénieur Déploiement Réseau",
        period: "Aug. 2025 — Today",
        location: "Rouen (On-site)",
        bullets: isEn ? [
            "Opening DARTY Rouen Docks 76: Cat6A cabling, Fluke cert.",
            "Network Security: Minimal ACLs, VLAN segmentation, 802.1X."
        ] : [
            "Ouverture DARTY Rouen Docks 76 : câblage Cat6A, certif Fluke.",
            "Sécurité réseau : ACL minimales, segmentation VLAN, 802.1X."
        ],
        tags: ["Network", "SysAdmin", "Security"]
      },
      {
        company: "IM Discounts",
        logo: "logos/im-discounts.svg",
        link: "https://www.im-discounts-normandie.fr/",
        role: isEn ? "IT Logistics Project Engineer" : "Ingénieur Projet Logistique-IT",
        period: "Juil. 2023 — Nov. 2023",
        location: "Canteleu",
        bullets: isEn ? [
            "Developed 'Stock Pro' (SaaS CRM/WMS/ERP) for agri-food.",
            "+32% operational efficiency via automation."
        ] : [
            "Développement de ‘Stock Pro’ (SaaS CRM/WMS/ERP).",
            "+32% d’efficacité opérationnelle."
        ],
        tags: ["SaaS", "WMS", "ERP"]
      },
      {
        company: "8th Sense Group",
        logo: "logos/8thsensegrp.png",
        link: "https://8thsensegroup.ca/",
        role: isEn ? "Sales Representative (Commodities)" : "Sales Representative — Commerce",
        period: "Nov. 2022 — Fév. 2024",
        location: "Toronto (Remote)",
        bullets: isEn ? [
            "International trade negotiations, NCNDA, Letters of Credit.",
            "Due diligence (KYC/AML) and risk mitigation."
        ] : [
            "Négoce international, gestion NCNDA, LC/LOC.",
            "Due diligence (KYC/AML) et gestion des risques."
        ],
        tags: ["Commerce", "Compliance", "International"]
      },
      {
        company: "Planet Of Morocco",
        logo: "logos/planetofmorocco.png",
        link: "https://planetofmorocco.com",
        role: isEn ? "Web Marketing Manager / Dev" : "Web Marketing Manager / Dev Web",
        period: "2021 — 2022",
        location: "Fès, Maroc",
        bullets: isEn ? ["WordPress showcase site, Instagram funnel automation."] : ["Site vitrine WordPress, automatisation funnel Instagram."],
        tags: ["Web", "Marketing"]
      },
      {
        company: "AMA Détergents",
        logo: "logos/amadetergent.jpg",
        link: "https://enosis.ma/histoire/",
        role: isEn ? "Junior Quality Engineer" : "Ingénieur Qualité Junior",
        period: "2021",
        location: "El Jadida",
        bullets: isEn ? ["Production line supervision, PLC Siemens PCS7."] : ["Supervision ligne poudre, PLC Siemens PCS7."],
        tags: ["Qualité", "PLC", "Industrie"]
      }
    ];
};

// FULL CERTIFICATIONS LIST PRESERVED
const certifications = [
  { title: "ISO/IEC 27001 Information Security Associate™", org: "SkillFront", date: "2025", domain: "Sécurité" },
  { title: "ISO 9001:2015 — Quality Management System (QMS)", org: "Alison", date: "2024", domain: "Qualité" },
  { title: "ISO 31000:2018 — Enterprise Risk Management", org: "Alison", date: "2024", domain: "Gestion des risques" },
  { title: "Les principes RGPD de la protection des données", org: "CNIL", date: "2023", domain: "Conformité" },
  { title: "Privacy Impact Assessment (PIA — dev‑oriented)", org: "OAIC (Australie)", date: "2023", domain: "Conformité" },
  { title: "Défense : La protection du secret", org: "DRSD", date: "2023", domain: "Sécurité" },
  { title: "ANSSI SecNum (Sécurité Numérique)", org: "ANSSI", date: "2023", domain: "Sécurité" },
  { title: "Cybercrime and Electronic Evidence", org: "Conseil de l’Europe", date: "2024", domain: "Droit & Cyber" },
  { title: "AI Masterclass", org: "Renault Group", date: "2024", domain: "Data & AI" },
  { title: "Introduction to Large Language Models", org: "Google Cloud Skills Boost", date: "2024", domain: "Data & AI" },
  { title: "ChatGPT for Data Analytics", org: "Luke Barousse", date: "2023", domain: "Data & AI" },
  { title: "Introduction to SQL", org: "DataCamp", date: "—", domain: "Data & AI" },
  { title: "Data Literacy", org: "DataCamp", date: "2024", domain: "Data & AI" },
  { title: "Building No‑Code Apps with AppSheet: Foundations", org: "Google Cloud Skills Boost", date: "2024", domain: "No‑Code" },
  { title: "Introduction to ISO/SAE 21434 — Road Vehicles Cybersecurity", org: "Ampère", date: "2024", domain: "Automobile" },
  { title: "Protégez vos systèmes numériques connectés", org: "Groupe INSA", date: "2024", domain: "Sécurité" },
  { title: "Smart Cities — Solving Urban Problems Using Technology", org: "LinkedIn", date: "2024", domain: "Ville & Systèmes" },
  { title: "Project Management Foundations", org: "PMI", date: "2023", domain: "Management" },
  { title: "Guide to Advanced Lean Manufacturing Using Innovation and AI", org: "Alison", date: "2024", domain: "Lean" },
  { title: "Mediation and Conflict Resolution", org: "ESSEC", date: "2023", domain: "Management" },
  { title: "Anti‑Trust Laws", org: "Renault Group", date: "2023", domain: "Droit" },
  { title: "Données et Gouvernance Urbaine", org: "Sciences Po", date: "2024", domain: "Gouvernance" },
  { title: "Human Rights in the Armed Forces", org: "Conseil de l’Europe", date: "2023", domain: "Droit" },
  { title: "Open‑Source Intelligence (OSINT)", org: "Basel Institute on Governance", date: "2022", domain: "OSINT" },
  { title: "Visualizing Cases and Flows of Money", org: "Basel Institute on Governance", date: "2022", domain: "OSINT" },
  { title: "Source and Application of Funds Analysis", org: "Basel Institute on Governance", date: "2022", domain: "OSINT" },
  { title: "Operational Analysis of Suspicious Transaction Reports", org: "Basel Institute on Governance", date: "2022", domain: "AML/CFT" },
  { title: "Anti‑Money Laundering & Counter Financing of Terrorism (AML/CFT)", org: "Egmont Group", date: "2023", domain: "AML/CFT" },
  { title: "International Cooperation and Mutual Legal Assistance", org: "Basel Institute on Governance", date: "2022", domain: "Droit" },
  { title: "Introduction to Networking", org: "Hack The Box", date: "2023", domain: "Réseau" },
  { title: "Introduction to International Trade & eBusiness", org: "eBSI Export Academy", date: "2023", domain: "Commerce" },
  { title: "Introduction to International Trade", org: "eBSI Export Academy", date: "2023", domain: "Commerce" },
  { title: "International Model United Nations", org: "United Nations", date: "2024", domain: "Diplomatie" },
  { title: "Agir pour contribuer à la sécurité numérique", org: "Cybermalveillance.gouv.fr", date: "2024", domain: "Sécurité" },
  { title: "Vigipirate : Faire face ensemble à la menace terroriste", org: "SGDSN", date: "2024", domain: "Sécurité" },
  { title: "Comprendre la Propriété Intellectuelle (PI)", org: "INPI France", date: "2023", domain: "Droit" },
  { title: "TOEFL (score certifiant)", org: "ETS", date: "2019", domain: "Langues" },
  { title: "DALF C1 (Diplôme de français avancé)", org: "France Éducation international", date: "2018", domain: "Langues" },
  { title: "Certificat de dactylographie", org: "Ratatype", date: "—", domain: "Divers" },
  { title: "Honor award in Music Theory", org: "MJCC Maroc", date: "2016", domain: "Divers" },
];

const education = [
  { school: "INSA Rouen Normandie", degree: "Ingénieur — Performance Numérique Industrielle", period: "2022 — 2026", logo: "logos/insarouen.jpg" },
  { school: "INSA Euro-Méditerranée", degree: "Diplôme d’Ingénieur — Informatique", period: "2019 — 2022", logo: "logos/INSA_Euro-Mediterranee_Fes.png" },
  { school: "Baccalauréat — Sciences Mathématiques", degree: "Mention Très Bien", period: "2019", logo: null },
];

const skills = {
  "Data & Analytics": [ "Excel avancé", "SQL (MySQL/PSQL)", "BigQuery", "GCP", "Looker", "Spotfire", "Power BI", "AppSheet", "IBM SPSS", "SAP (S/4HANA, BTP)" ],
  "Développement": [ "Node.js", "PHP", "Vue.js", "JavaScript", "TypeScript", "HTML", "CSS", "C", "Java", "Matlab/Scilab", "UML", "Git", "Firebase", "LaTeX" ],
  "IoT & Industrie 4.0": [ "Node‑RED", "OPC UA", "Arduino", "Capteurs Keyence", "Automatisation", "PLC (Siemens/Schneider)", "Step7, WinCC", "Grafana" ],
  "Automatisation": [ "n8n", "Zapier", "Workflows", "AppSheet" ],
  "IA & Chatbots": [ "IA prompting", "VAPI", "Twilio", "ElevenLabs", "Agents conversationnels" ],
  "UX & Design": [ "Figma", "Adobe Illustrator", "Adobe Premiere Pro", "WordPress", "Shopify", "Blender" ],
  "Cybersécurité": [ "ISO/IEC 27001", "RGPD", "SOC 2", "OSINT", "Wireshark", "GNU/Linux Hardening", "Windows Hardening", "Kali Suite" ],
  "Gestion de projet": [ "Six Sigma", "Lean", "Agile/Scrum", "PMP", "DMAIC", "AMDEC", "5S", "Kaizen", "ISO 9001" ],
  "Soft skills": [ "Leadership", "Communication", "Médiation", "Gestion du temps", "Adaptabilité", "Pédagogie" ]
};

// ==========================================
// 2. SEO & UTILS
// ==========================================

const SchemaMarkup = ({ profile }) => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": profile.name,
        "jobTitle": profile.title,
        "url": "https://tahamesbahi.com",
        "sameAs": [ profile.linkedin, "https://github.com/tahamesbahi" ],
        "email": profile.email,
        "address": { "@type": "PostalAddress", "addressLocality": "Rouen", "addressCountry": "France" }
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
};

const SEOHead = ({ lang, profile }) => {
    useEffect(() => {
        document.title = `${profile.name} | ${profile.title}`;
        document.documentElement.lang = lang;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = lang === 'fr' 
                ? `Portfolio de ${profile.name}. Expert en Industrie 4.0, Data et Cybersécurité.`
                : `Portfolio of ${profile.name}. Expert in Industry 4.0, Data, and Cybersecurity.`;
        }
    }, [lang, profile]);
    return null;
};

// ==========================================
// 3. UI COMPONENTS
// ==========================================

// 5 Seconds Loading Screen

// Replace your existing LoadingScreen component with this one:

const LoadingScreen = () => {
    return (
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden w-screen h-screen" // Added w-screen h-screen
        >
            <div className="absolute top-0 left-0 w-full h-full">
                <iframe 
                    src="https://my.spline.design/nexbotrobotcharacterconcept-FDt7cww2KDcL0RxmRfz1cZG7/" 
                    frameBorder="0" 
                    width="100%" 
                    height="100%" 
                    title="Loading Robot"
                    style={{ 
                        pointerEvents: 'auto', // Ensures touch/mouse events work
                        width: '100vw',        // Force viewport width
                        height: '100vh',       // Force viewport height
                        border: 'none',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }} 
                />
            </div>
            
            {/* Loading Bar & Text - positioned above the iframe */}
            <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none px-4 z-10">
                <div className="inline-flex flex-col items-center gap-3">
                    <div className="text-[#81D8D0] font-mono text-xs md:text-sm tracking-[0.2em] animate-pulse">
                        SYSTEM INITIALIZATION...
                    </div>
                    {/* Progress Bar: 5 Seconds Duration */}
                    <div className="w-48 md:w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            className="h-full bg-[#81D8D0]"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const DarkGlassCard = ({ className = "", children, hoverEffect = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={hoverEffect ? { y: -4 } : {}}
    transition={{ type: "spring", stiffness: 50, damping: 20 }}
    className={`relative rounded-[24px] border border-white/5 bg-[#121212]/60 backdrop-blur-xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden group ${hoverEffect ? 'hover:bg-white/5 transition-all duration-300' : ''} ${className}`}
  >
    {hoverEffect && <div className="absolute -inset-px rounded-[24px] border border-transparent group-hover:border-[#81D8D0]/20 transition-colors pointer-events-none" />}
    {hoverEffect && <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#81D8D0] rounded-full opacity-0 blur-[60px] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />}
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const Badge = ({ children, variant = "default" }) => {
    const styles = {
        default: "bg-white/5 border-white/10 text-zinc-300 hover:border-[#81D8D0]/30 hover:text-[#81D8D0]",
        cyan: "bg-[#81D8D0]/10 border-[#81D8D0]/20 text-[#81D8D0]",
        outline: "bg-transparent border-white/20 text-white/60"
    }
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase transition-colors whitespace-nowrap ${styles[variant]}`}>
      {children}
    </span>
  );
}

const CyberBackground = () => (
    <>
      <div className="fixed inset-0 bg-[#050505] z-[-2]"></div>
      <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none bg-grid" />
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-noise" />
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#81D8D0] rounded-full blur-[150px] opacity-[0.08] z-[-1] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900 rounded-full blur-[150px] opacity-[0.1] z-[-1] pointer-events-none"></div>
    </>
);

const CompanyAvatar = ({ name, logo, link }) => {
    const [failed, setFailed] = React.useState(false);
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

// ==========================================
// 4. MAIN APP
// ==========================================
export default function App() {
  
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [user, setUser] = useState(null);
  const [lightbox, setLightbox] = useState({ open:false, images:[], index:0 });
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [domain, setDomain] = useState("Tous");
  const cvRef = useRef(null);

  const t = TRANSLATIONS[lang];
  const profileData = getProfile(lang);
  const experiencesData = getExperiences(lang);
  const displayStats = t.stats;

  useEffect(() => {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('fr')) setLang('fr');

    // Timer set to exactly 5000ms (5s)
    const timer = setTimeout(() => setLoading(false), 5000);

    const q = query(collection(db,'projects'), orderBy('featured','desc'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, (snap)=>{
      setProjects(snap.docs.map(d=>({ id:d.id, ...d.data() })));
      setLoadingProjects(false);
    });
    const authUnsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    
    return () => { clearTimeout(timer); unsub(); authUnsub(); }
  }, []);

  const toggleLang = () => setLang(prev => prev === 'fr' ? 'en' : 'fr');
  
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

  // ==========================================
// LIGHTBOX STATE & LOGIC
// ==========================================
const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
const [zoom, setZoom] = useState(1); // 1 = fit, >1 = zoomed

// Reset zoom when sliding to a new image
useEffect(() => {
    setZoom(1);
}, [lightbox.index]);

// Keyboard Navigation
useEffect(() => {
    if (!lightbox.open) return;

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Disable body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
    };
}, [lightbox.open, lightbox.images.length]); // Dependencies for closure freshness

const openLightbox = (images, index = 0) => {
    // Ensure we are passing an array, even if it's a single string
    const imageArray = Array.isArray(images) ? images : [images];
    setLightbox({ open: true, images: imageArray, index });
    setZoom(1);
};

const closeLightbox = () => {
    setLightbox(prev => ({ ...prev, open: false }));
    setZoom(1);
};

const nextImage = (e) => {
    if (e) e.stopPropagation();
    setLightbox(prev => ({
        ...prev,
        index: (prev.index + 1) % prev.images.length
    }));
};

const prevImage = (e) => {
    if (e) e.stopPropagation();
    setLightbox(prev => ({
        ...prev,
        index: (prev.index - 1 + prev.images.length) % prev.images.length
    }));
};

const toggleZoom = (e) => {
    if (e) e.stopPropagation();
    setZoom(prev => (prev === 1 ? 2.5 : 1));
};
  // Filters
  const filteredCerts = useMemo(() => {
    return certifications.filter((c) => (domain === "Tous" ? true : c.domain === domain))
      .filter((c) => searchTerm.trim() ? (c.title + c.org).toLowerCase().includes(searchTerm.toLowerCase()) : true);
  }, [searchTerm, domain]);
  const domains = ["Tous", ...Array.from(new Set(certifications.map((c) => c.domain)))];

  return (
    <div className="min-h-screen w-full text-zinc-300 font-sans selection:bg-[#81D8D0] selection:text-black overflow-x-hidden">
      
      <SEOHead lang={lang} profile={profileData} />
      <SchemaMarkup profile={profileData} />

      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>

      <CyberBackground />

      {/* --- RESPONSIVE SCROLLABLE NAVBAR --- */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center animate-fade-in print:hidden px-4">
        <div className="bg-[#121212]/85 backdrop-blur-xl border border-white/10 rounded-full px-1.5 py-1.5 flex items-center gap-1 shadow-2xl max-w-full overflow-x-auto no-scrollbar">
           
           <a href="#about" onClick={scrollToId('about')} className="px-3 md:px-4 py-2 rounded-full text-[10px] md:text-xs font-medium hover:bg-white/10 hover:text-white transition-all flex items-center gap-1 whitespace-nowrap">
             <Terminal size={12} className="opacity-50"/> {t.nav.profile}
           </a>
           <a href="#projects" onClick={scrollToId('projects')} className="px-3 md:px-4 py-2 rounded-full text-[10px] md:text-xs font-medium hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">
             {t.nav.work}
           </a>
           <a href="#experience" onClick={scrollToId('experience')} className="px-3 md:px-4 py-2 rounded-full text-[10px] md:text-xs font-medium hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">
             {t.nav.exp}
           </a>
           <a href="#skills" onClick={scrollToId('skills')} className="px-3 md:px-4 py-2 rounded-full text-[10px] md:text-xs font-medium hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">
             {t.nav.stack}
           </a>
           
           <div className="h-4 w-px bg-white/10 mx-1 shrink-0"></div>

           <button onClick={toggleLang} className="p-2 rounded-full hover:bg-white/10 hover:text-[#81D8D0] transition-colors shrink-0" title="Switch Language">
              <Languages size={14} />
           </button>

           <a href={profileData.linkedin} target="_blank" className="p-2 rounded-full hover:bg-white/10 hover:text-[#0077b5] transition-colors shrink-0">
             <Linkedin size={14} />
           </a>
           <button onClick={handleAdminClick} className="p-2 rounded-full hover:bg-white/10 hover:text-red-400 transition-colors shrink-0">
             <Shield size={14} />
           </button>
           
           <a href="#contact" onClick={scrollToId('contact')} className="ml-1 px-4 md:px-5 py-2 rounded-full bg-[#81D8D0] text-black text-[10px] md:text-xs font-bold hover:brightness-110 shadow-[0_0_15px_-3px_rgba(129,216,208,0.4)] transition-all flex items-center gap-2 whitespace-nowrap shrink-0">
             <Send size={12} /> {t.nav.contact}
           </a>
        </div>
      </nav>

      {/* --- FLOATING WHATSAPP BUTTON --- */}
      <a 
        href={`https://wa.me/${profileData.whatsapp}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300 print:hidden flex items-center justify-center"
        title="Chat sur WhatsApp"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7" fill="white" />
      </a>

      {/* --- CONTENT WRAPPER --- */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 pt-28 md:pt-32 pb-20 print:bg-white print:text-black print:pt-0">
        
        {/* HERO SECTION */}
        <section id="about" className="mb-20 md:mb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
           <div className="lg:col-span-7 order-2 lg:order-1">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#81D8D0]/20 bg-[#81D8D0]/5 text-[#81D8D0] text-[10px] font-mono mb-6 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81D8D0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#81D8D0]"></span>
                </span>
                {t.availability}
             </div>
             
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1] mb-6">
               <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">{profileData.name}</span>
               <span className="text-xl md:text-2xl lg:text-3xl text-zinc-500 font-light block mt-3">{profileData.title}</span>
             </h1>
             
             <p className="text-base md:text-lg text-zinc-400 font-light max-w-xl leading-relaxed mb-8">{profileData.subtitle}</p>
             
             <div className="flex flex-wrap gap-4">
                <a href="#projects" onClick={scrollToId('projects')} className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium text-sm hover:scale-105 transition-transform">
                  <span>{t.viewProjects}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href={profileData.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-sm">
                  <Download className="w-4 h-4" />
                  <span>{t.downloadCV}</span>
                </a>
             </div>
           </div>
           
           <div className="lg:col-span-5 order-1 lg:order-2">
              <DarkGlassCard className="tiffany-glow">
                 <h3 className="text-white font-medium flex items-center gap-2 mb-4"><Zap size={16} className="text-[#81D8D0]"/> {t.impact}</h3>
                 <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {displayStats.map(s => (
                        <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-xl md:text-2xl font-medium text-white tracking-tight">{s.value}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{s.label}</div>
                        </div>
                    ))}
                 </div>
              </DarkGlassCard>
           </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="mb-24 pt-10 border-t border-white/5">
            <h2 className="text-2xl md:text-3xl text-white font-medium mb-8 flex items-center gap-3">
                <Cpu size={24} className="text-[#81D8D0]"/> {t.stack}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(skills).map(([group, items]) => (
                    <DarkGlassCard key={group} className="hover:border-[#81D8D0]/30 transition-colors">
                        <h3 className="text-zinc-100 font-medium mb-4 text-sm uppercase tracking-wider text-[#81D8D0] flex items-center gap-2">
                            {group.includes('Data') ? <Database size={14}/> : group.includes('Full') ? <Code size={14}/> : <Layers size={14}/>} 
                            {group}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {items.map(it => <Badge key={it} variant="default">{it}</Badge>)}
                        </div>
                    </DarkGlassCard>
                ))}
            </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className="mb-24 pt-10 border-t border-white/5">
            <h2 className="text-2xl md:text-3xl text-white font-medium mb-12 flex items-center gap-3">
                <Briefcase size={24} className="text-[#81D8D0]"/> {t.experience}
            </h2>
            <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-12">
                {experiencesData.map((exp, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-12">
                        <span className="absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full bg-[#81D8D0] shadow-[0_0_10px_#81D8D0]"></span>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                           <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-0">
                               <CompanyAvatar name={exp.company} logo={exp.logo} link={exp.link} />
                               <div>
                                   <h3 className="text-lg md:text-xl text-white font-medium">{exp.role}</h3>
                                   <a href={exp.link} target="_blank" className="text-sm text-[#81D8D0] hover:underline flex items-center gap-1 mt-1">
                                      {exp.company} <ExternalLink size={12}/>
                                   </a>
                               </div>
                           </div>
                           <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5 w-fit h-fit self-start ml-[3.5rem] md:ml-0">{exp.period}</span>
                        </div>
                        <p className="text-sm text-zinc-500 mb-4 pl-[3.5rem] md:pl-0">{exp.location}</p>
                        <ul className="text-zinc-400 text-sm leading-relaxed space-y-2 list-disc ml-4 md:ml-4 marker:text-zinc-600 pl-[3.5rem] md:pl-0">
                           {exp.bullets.map((b,i) => <li key={i}>{b}</li>)}
                        </ul>
                        <div className="flex gap-2 mt-4 flex-wrap pl-[3.5rem] md:pl-0">
                            {exp.tags.map(t => <Badge key={t} variant="cyan">{t}</Badge>)}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="mb-24 pt-10 border-t border-white/5">
            <div className="flex items-end justify-between mb-10">
                <h2 className="text-2xl md:text-3xl text-white font-medium flex items-center gap-3">
                    <Globe size={24} className="text-[#81D8D0]"/> {t.selectedWork}
                </h2>
                <div className="text-xs md:text-sm text-zinc-500">{t.liveDeployed}</div>
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
                            {p.stack && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {p.stack.slice(0,4).map((s,i) => <span key={i} className="text-[10px] px-2 py-1 bg-white/5 rounded text-zinc-500 border border-white/5">{s}</span>)}
                                </div>
                            )}
                            {/* Impact */}
                            {Array.isArray(p.impact) && p.impact.length > 0 && (
                                <div className="mb-4 pt-3 border-t border-white/5">
                                    <div className="text-[10px] uppercase tracking-wider text-[#81D8D0] font-medium mb-1">Impact</div>
                                    <div className="text-xs text-zinc-300 font-mono">{p.impact.join(" • ")}</div>
                                </div>
                            )}
                            {/* PDFs */}
                            {Array.isArray(p.pdfs) && p.pdfs.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                                    {p.pdfs.map((pdf, i) => (
                                        <a key={i} href={pdf.url} target="_blank" className="group/pdf flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                            {pdf.thumbUrl ? (
                                                <img src={pdf.thumbUrl} className="w-6 h-8 object-cover rounded shadow-sm opacity-80 group-hover/pdf:opacity-100" alt="PDF Thumb"/>
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

        {/* EDUCATION & CERTS */}
        <section id="education" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
            <div>
                 <h2 className="text-2xl text-white font-medium mb-6 flex items-center gap-2"><GraduationCap className="text-[#81D8D0]"/> {t.education}</h2>
                 <div className="space-y-4">
                    {education.map((edu, i) => (
                        <DarkGlassCard key={i} hoverEffect={false}>
                            <div className="flex items-start gap-4">
                                {edu.logo && <div className="w-10 h-10 rounded bg-white p-1"><img src={edu.logo} className="w-full h-full object-contain" alt={edu.school}/></div>}
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
                    <h2 className="text-2xl text-white font-medium flex items-center gap-2"><Award className="text-[#81D8D0]"/> {t.certifications}</h2>
                    <select value={domain} onChange={(e) => setDomain(e.target.value)} className="bg-black border border-white/10 text-xs rounded-lg px-2 py-1 outline-none focus:border-[#81D8D0]">
                        {domains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 {/* Scrollable container for certificates */}
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

        {/* CONTACT */}
        <section id="contact" className="mt-24 pt-10 border-t border-white/5 pb-24">
             <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl text-white font-medium mb-4">{t.contactTitle}</h2>
                    <p className="text-zinc-400 mb-8 font-light">{t.contactDesc}</p>
                    
                    <div className="space-y-4">
                        <a href={`mailto:${profileData.email}`} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#81D8D0]/30 hover:bg-white/10 transition-all group">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-[#81D8D0] group-hover:bg-[#81D8D0]/10 transition-colors">
                                <Mail size={18}/>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Email</div>
                                <div className="text-zinc-200 font-mono text-sm">{profileData.email}</div>
                            </div>
                        </a>
                        
                        <a href={`https://wa.me/${profileData.whatsapp}`} target="_blank" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#25D366]/30 hover:bg-white/10 transition-all group">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-[#25D366] group-hover:bg-[#25D366]/10 transition-colors">
                                <MessageCircle size={18}/>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">WhatsApp</div>
                                <div className="text-zinc-200 font-mono text-sm">+33 6 99 72 31 51</div>
                            </div>
                        </a>

                        <a href={profileData.linkedin} target="_blank" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#0077b5]/30 hover:bg-white/10 transition-all group">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-[#0077b5] group-hover:bg-[#0077b5]/10 transition-colors">
                                <Linkedin size={18}/>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">LinkedIn</div>
                                <div className="text-zinc-200 font-mono text-sm">/in/tahamesbahi</div>
                            </div>
                        </a>
                    </div>
                </div>
                
                <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#81D8D0] via-transparent to-transparent"></div>
                    <div className="text-center z-10">
                        <MapPin size={40} className="text-[#81D8D0] mx-auto mb-4 animate-bounce"/>
                        <h3 className="text-white text-xl font-medium">Rouen, France</h3>
                        <p className="text-zinc-500 text-sm">Normandie • Paris • Remote</p>
                    </div>
                </div>
             </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 text-center py-10">
             <p className="text-xs text-zinc-700 uppercase tracking-widest">System Online • Designed by T. Mesbahi • {new Date().getFullYear()}</p>
        </footer>
      </main>

      {/* ==========================================
    FULL FEATURED LIGHTBOX COMPONENT
   ========================================== */}
<AnimatePresence>
    {lightbox.open && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox} // Click background to close
        >
            {/* --- TOP CONTROLS --- */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
                {/* Counter */}
                <div className="pointer-events-auto bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono text-zinc-300">
                    {lightbox.index + 1} / {lightbox.images.length}
                </div>

                {/* Toolbar */}
                <div className="pointer-events-auto flex items-center gap-2">
                    <button 
                        onClick={toggleZoom} 
                        className="p-2.5 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors"
                        title="Toggle Zoom"
                    >
                        {zoom > 1 ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); closeLightbox(); }} 
                        className="p-2.5 rounded-full bg-white/10 border border-white/10 text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
                        title="Close (Esc)"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* --- NAVIGATION ARROWS (Only if > 1 image) --- */}
            {lightbox.images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 hover:scale-110 transition-all hidden md:flex items-center justify-center group"
                        title="Previous (Left Arrow)"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 hover:scale-110 transition-all hidden md:flex items-center justify-center group"
                        title="Next (Right Arrow)"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    >
                        <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </>
            )}

            {/* --- MAIN IMAGE CONTAINER --- */}
            <div 
                className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 md:p-10"
                onClick={(e) => e.stopPropagation()} // Clicking container shouldn't close
            >
                <motion.img
                    key={lightbox.index} // Triggers animation on change
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: zoom }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                    src={lightbox.images[lightbox.index]}
                    alt="Project Preview"
                    className={`
                        max-w-full max-h-full object-contain shadow-2xl rounded-sm
                        ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}
                    `}
                    onClick={toggleZoom}
                    draggable={zoom > 1} // Allows native dragging if zoomed in
                    onDragStart={(e) => { if(zoom === 1) e.preventDefault() }}
                />
            </div>

            {/* --- CAPTION / HINT (Mobile only) --- */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none md:hidden">
                <span className="text-[10px] text-white/50 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    Tap to zoom • Swipe not supported
                </span>
            </div>
        </motion.div>
    )}
</AnimatePresence>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #81D8D0; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        
        /* Hide scrollbar for nav but allow scrolling */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .bg-grid {
             background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
             background-size: 40px 40px;
        }
        .bg-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
        }
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
