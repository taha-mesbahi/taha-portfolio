import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from "framer-motion";
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

import { Mail, Phone, MapPin, Linkedin, Download, CheckCircle2, GraduationCap, Languages } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// === CONFIGURABLE DATA ===
const profile = {
  name: "Taha Mesbahi",
  title:
    "Ingénieur Data & Transformation Digitale — Industrie 4.0 • Full‑Stack • Cybersécurité",
  subtitle:
    "Apprenti ingénieur (INSA Rouen). Optimisation de process, analytics temps réel, apps métiers sécurisées et cyber‑résilience.",
  location: "Rouen, Normandie, France",
  email: "tahamesbahi123@gmail.com",
  phone: "+33 6 99 72 31 51",
  linkedin: "https://www.linkedin.com/in/tahamesbahi",
  availability: "Ouvert aux opportunités — alternance / CDI",
};

const stats = [
  { label: "Optimisation rapidité", value: "+37%" },
  { label: "Erreurs en moins", value: "-80%" },
  { label: "Économies annuelles", value: "130–420 k€" },
  { label: "Langues", value: "FR • EN • AR" },
];

const skills = {
  "Data & Analytics": [
    "Excel avancé",
    "SQL (MySQL/PSQL)",
    "BigQuery",
    "GCP",
    "Looker",
    "Spotfire",
    "Power BI",
    "AppSheet",
    "IBM SPSS",
  ],
  "Développement & Full‑Stack": [
    "JavaScript",
    "TypeScript",
    "Node.js",
    "PHP",
    "Vue.js",
    "HTML/CSS",
    "Java",
    "C",
    "Matlab/Scilab",
    "UML",
    "Git",
    "LaTeX",
  ],
  "IoT & Industrie 4.0": [
    "Node‑RED",
    "OPC UA",
    "Arduino",
    "Capteurs Keyence/Schneider",
    "Automatisation de flux",
    "PLC (Siemens/Schneider)",
    "LTspice / Digital Works",
    "Step7, WinCC",
    "Grafana",
  ],
  "Cybersécurité & Réseau": [
    "ISO/IEC 27001",
    "RGPD / GDPR",
    "SOC 2 / NIS",
    "OSINT",
    "Wireshark",
    "GNU/Linux Hardening",
    "Windows Hardening",
    "IPv4/IPv6",
    "Kali Suite (pentest)",
  ],
  "Gestion de projet": [
    "Agile / Scrum",
    "Lean / Six Sigma",
    "DMAIC",
    "GANTT / WBS",
    "AMDEC / 8D / 5S",
    "Kaizen",
    "BSC",
    "ISO 9001:2015",
  ],
  "Design & Outils": ["Figma", "Adobe Illustrator", "Premiere Pro", "WordPress", "Shopify"],
};

const experiences = [
  {
    company: "Ampère (Renault Group)",
    role: "Apprenti ingénieur Data & Développeur Full‑Stack",
    period: "Sept. 2023 — Juin 2025",
    location: "Cléon (hybride)",
    bullets: [
      "Pilotage de l’analyse de données et optimisation des processus sur lignes moteurs électriques (6AM, 5AX, E‑Tech).",
      "Dashboards KPI temps réel (AppSheet, GCP, Looker, Spotfire, BigQuery) : +37% de rapidité, 80% d’erreurs en moins, 130 k€ d’économies/an.",
      "Refonte des workflows Excel → plateforme web WMS sécurisée (Node.js, PHP, MySQL, Vue.js), SSO et gestion fine des accès.",
      "Cybersécurité industrielle : remédiation CVEs critiques, système d’alertes ESD (Python, Selenium, capteurs Keyence) validant l’audit ESD 2024.",
      "Améliorations additionnelles aboutissant à jusqu’à 420 k€ d’économies annuelles cumulées.",
    ],
    tags: ["Data", "Industrie 4.0", "Full‑Stack", "Cyberdéfense", "KPI"],
  },
  {
    company: "IM Discounts",
    role: "Ingénieur Projet Logistique‑IT",
    period: "Juil. 2023 — Nov. 2023",
    location: "Canteleu",
    bullets: [
      "Développement et déploiement de ‘Stock Pro’ (SaaS CRM/WMS/ERP) pour entrepôts agroalimentaires.",
      "+32% d’efficacité opérationnelle (automatisation, contrôle financier, time‑to‑delivery).",
    ],
    tags: ["SaaS", "WMS", "ERP", "Automation"],
  },
  {
    company: "8th Sense Group",
    role: "Sales Representative (Commerce international)",
    period: "Nov. 2022 — Fév. 2024",
    location: "Toronto (remote)",
    bullets: [
      "Négociation et closing de contrats de négoce international (commodities, matières premières).",
    ],
    tags: ["Commerce", "Négociation"],
  },
  {
    company: "Planet Of Morocco",
    role: "Web Marketing Manager / Développeur Web",
    period: "Déc. 2021 — Juin 2022",
    location: "Fès, Maroc",
    bullets: [
      "Site vitrine sous WordPress, automatisation du funnel Instagram et reporting d’engagement.",
    ],
    tags: ["Web", "Marketing", "WordPress"],
  },
  {
    company: "AMA Détergents",
    role: "Ingénieur Qualité Junior",
    period: "Juil. 2021 — Août 2021",
    location: "El Jadida, Maroc",
    bullets: [
      "Supervision ligne poudre, suivi qualité, pilotage PLC Siemens PCS7.",
    ],
    tags: ["Qualité", "PLC"],
  },
];

const projects = [
  {
    name: "CLOGIS — Digitalisation des flux inter‑ateliers (Renault Ampère)",
    description:
      "Application web full‑stack sécurisée pour centraliser les mouvements de stock, intégrée ARCA (SSO, rôles, journaux d’accès, KPI, alertes SMTP).",
    stack: ["Node.js", "PHP", "MySQL", "Bootstrap", "AppSheet", "Looker", "Spotfire"],
    impact: ["+37% rapidité", "-80% erreurs", "130–420 k€ économies/an"],
  },
  {
    name: "Stock Pro — SaaS CRM/WMS/ERP",
    description:
      "Solution de gestion (produits, stocks, fournisseurs, clients, livraisons, facturation, taxes, RH) pour grossistes alimentaires.",
    stack: ["AppSheet", "GCP", "Apps Script", "SQL"],
    impact: ["+32% d’efficacité opérationnelle"],
  },
  {
    name: "Alertes ESD & cybersécurité industrielle",
    description:
      "Automatisation horaire des extractions, corrélations et alertes ESD (Python, Selenium) ; remédiation CVEs critiques, audit ESD validé 2024.",
    stack: ["Python", "Selenium", "REST", "SMTP", "Keyence"],
    impact: ["Conformité audit ESD 2024"],
  },
  {
    name: "Bot de signaux de trading guidé par news",
    description:
      "Scraping d’actualités financières, NLP (GPT‑4), indicateurs techniques (RSI, MACD via pandas_ta), scoring et envoi d’alertes e‑mail/Telegram.",
    stack: ["Python", "pandas_ta", "SMTP", "Replit"],
    impact: ["Alertes toutes 5 minutes avec taux de confiance"],
  },
  {
    name: "Foodeo — Suite POS/ERP pour fast‑food",
    description:
      "Système complet (POS, kiosques, HACCP, intégrations UberEats/Deliveroo), saisie offline, conformité visée NF525.",
    stack: ["Node.js", "PHP", "MySQL", "iPad/Windows/iPhone"],
    impact: ["Robustesse back‑office, continuité d’activité"],
  },
  {
    name: "OSINT sécurité — Détection mélange de langues (Maroc)",
    description:
      "Recherche (pondération lexicale) pour alerter les autorités en cas d’élévation de risque pendant un appel.",
    stack: ["Python", "NLP", "OSINT"],
    impact: ["Prototype et scoring de risque"],
  },
  {
    name: "Backup MySQL automatisé + mode maintenance",
    description:
      "Sauvegardes planifiées, envoi par e‑mail, gestion cookies/session et bascule automatique maintenance.",
    stack: ["PHP", "JavaScript", "cron", "SMTP"],
    impact: ["Sécurité et traçabilité des données"],
  },
  {
    name: "EcoFlex Manufacturing — Modélisation RAMI4.0 / ISA‑95",
    description:
      "Article d’ingénierie : modélisation, indicateurs de performance, simulation de chaîne de production.",
    stack: ["LaTeX", "Modèles RAMI4.0", "ISA‑95"],
    impact: ["Cadre méthodologique réutilisable"],
  },
];

const education = [
  {
    school: "INSA Rouen Normandie (ITII)",
    degree:
      "Ingénieur — Performance Numérique Industrielle (Industrie 4.0, cybersécurité)",
    period: "2022 — 2026",
  },
  {
    school: "INSA Euro‑Méditerranée, Fès (Maroc)",
    degree: "Diplôme d’Ingénieur — Informatique",
    period: "2019 — 2022",
  },
  {
    school: "Baccalauréat — Sciences Mathématiques (Option Française)",
    degree: "Mention Très Bien (Maroc)",
    period: "2019",
  },
];

const languages = [
  { name: "Français", level: "C1 (DALF 89/100)" },
  { name: "Anglais", level: "C2 (TOEIC 980/990)" },
  { name: "Arabe", level: "B2" },
];

// Certifications — regroupées par domaines (liste fournie)
const certifications = [
  // Sécurité / Conformité
  { title: "ISO/IEC 27001 Information Security Associate™", org: "SkillFront", date: "2025", domain: "Sécurité" },
  { title: "ISO 9001:2015 — Quality Management System (QMS)", org: "Alison", date: "2024", domain: "Qualité" },
  { title: "ISO 31000:2018 — Enterprise Risk Management", org: "Alison", date: "2024", domain: "Gestion des risques" },
  { title: "Les principes RGPD de la protection des données", org: "CNIL", date: "2023", domain: "Conformité" },
  { title: "Privacy Impact Assessment (PIA — dev‑oriented)", org: "OAIC (Australie)", date: "2023", domain: "Conformité" },
  { title: "Défense : La protection du secret", org: "DRSD", date: "2023", domain: "Sécurité" },
  { title: "ANSSI SecNum (Sécurité Numérique)", org: "ANSSI", date: "2023", domain: "Sécurité" },
  { title: "Cybercrime and Electronic Evidence", org: "Conseil de l’Europe", date: "2024", domain: "Droit & Cyber" },
  // Data / AI / Dev
  { title: "AI Masterclass", org: "Renault Group", date: "2024", domain: "Data & AI" },
  { title: "Introduction to Large Language Models", org: "Google Cloud Skills Boost", date: "2024", domain: "Data & AI" },
  { title: "ChatGPT for Data Analytics", org: "Luke Barousse", date: "2023", domain: "Data & AI" },
  { title: "Introduction to SQL", org: "DataCamp", date: "—", domain: "Data & AI" },
  { title: "Data Literacy", org: "DataCamp", date: "2024", domain: "Data & AI" },
  { title: "Building No‑Code Apps with AppSheet: Foundations", org: "Google Cloud Skills Boost", date: "2024", domain: "No‑Code" },
  // Industrie / Automobile / Systèmes
  { title: "Introduction to ISO/SAE 21434 — Road Vehicles Cybersecurity Engineering", org: "Ampère", date: "2024", domain: "Automobile" },
  { title: "Protégez vos systèmes numériques connectés — 12 bonnes pratiques de l’ANSSI", org: "Groupe INSA", date: "2024", domain: "Sécurité" },
  { title: "Smart Cities — Solving Urban Problems Using Technology", org: "LinkedIn", date: "2024", domain: "Ville & Systèmes" },
  // Gestion / Management
  { title: "Project Management Foundations", org: "PMI", date: "2023", domain: "Management" },
  { title: "Guide to Advanced Lean Manufacturing Using Innovation and AI", org: "Alison", date: "2024", domain: "Lean" },
  { title: "Mediation and Conflict Resolution", org: "ESSEC", date: "2023", domain: "Management" },
  // Droit / Gouvernance / Société
  { title: "Anti‑Trust Laws", org: "Renault Group", date: "2023", domain: "Droit" },
  { title: "Données et Gouvernance Urbaine", org: "Sciences Po", date: "2024", domain: "Gouvernance" },
  { title: "Human Rights in the Armed Forces", org: "Conseil de l’Europe", date: "2023", domain: "Droit" },
  // OSINT / Finance illicite / Coopération
  { title: "Open‑Source Intelligence (OSINT)", org: "Basel Institute on Governance", date: "2022", domain: "OSINT" },
  { title: "Visualizing Cases and Flows of Money", org: "Basel Institute on Governance", date: "2022", domain: "OSINT" },
  { title: "Source and Application of Funds Analysis", org: "Basel Institute on Governance", date: "2022", domain: "OSINT" },
  { title: "Operational Analysis of Suspicious Transaction Reports", org: "Basel Institute on Governance", date: "2022", domain: "AML/CFT" },
  { title: "Anti‑Money Laundering & Counter Financing of Terrorism (AML/CFT)", org: "Egmont Group", date: "2023", domain: "AML/CFT" },
  { title: "International Cooperation and Mutual Legal Assistance in Criminal Matters", org: "Basel Institute on Governance", date: "2022", domain: "Droit" },
  // Réseau / Technique
  { title: "Introduction to Networking", org: "Hack The Box", date: "2023", domain: "Réseau" },
  // Commerce & International
  { title: "Introduction to International Trade & eBusiness", org: "eBSI Export Academy", date: "2023", domain: "Commerce" },
  { title: "Introduction to International Trade", org: "eBSI Export Academy", date: "2023", domain: "Commerce" },
  { title: "International Model United Nations", org: "United Nations", date: "2024", domain: "Diplomatie" },
  // Sécurité citoyenne / Sensibilisation
  { title: "Agir pour contribuer à la sécurité numérique de mon environnement", org: "Cybermalveillance.gouv.fr", date: "2024", domain: "Sécurité" },
  { title: "Vigipirate : Faire face ensemble à la menace terroriste", org: "SGDSN", date: "2024", domain: "Sécurité" },
  // Propriété intellectuelle
  { title: "Comprendre la Propriété Intellectuelle (PI)", org: "INPI France", date: "2023", domain: "Droit" },
  // Divers académiques / langues
  { title: "TOEFL (score certifiant)", org: "ETS", date: "2019", domain: "Langues" },
  { title: "DALF C1 (Diplôme de français avancé)", org: "France Éducation international", date: "2018", domain: "Langues" },
  { title: "Certificat de dactylographie", org: "Ratatype", date: "—", domain: "Divers" },
  { title: "Honor award in Music Theory", org: "MJCC Maroc", date: "2016", domain: "Divers" },
];

// === UI HELPERS (LIGHT / MINIMAL) ===
const GlassCard = ({ className = "", children }) => (
  <div
    className={
      "relative rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-xl backdrop-blur-xl " +
      className
    }
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/70 via-white/40 to-transparent pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-800">
    {children}
  </span>
);

// === MAIN COMPONENT ===
export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  useEffect(() => {
    const q = query(collection(db,'projects'), orderBy('featured','desc'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, (snap)=>{
      setProjects(snap.docs.map(d=>({ id:d.id, ...d.data() })));
      setLoadingProjects(false);
    });
    return ()=>unsub();
  }, []);

  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("Tous");
  const cvRef = useRef(null);

  const filteredCerts = useMemo(() => {
    return certifications
      .filter((c) => (domain === "Tous" ? true : c.domain === domain))
      .filter((c) =>
        query.trim()
          ? (c.title + c.org + c.domain).toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => (a.domain > b.domain ? 1 : -1));
  }, [query, domain]);

  const domains = ["Tous", ...Array.from(new Set(certifications.map((c) => c.domain)))];

  const downloadPDF = async () => {
    if (!cvRef.current) return;
    const canvas = await html2canvas(cvRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: document.body.scrollWidth,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8; // mm
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgHeight - heightLeft);
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save("Taha_Mesbahi_Portfolio.pdf");
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 text-slate-900 print:bg-white">
      {/* Decorative light dots grid */}
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(2,6,23,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.04)_1px,transparent_1px)] bg-[size:24px_24px]"
        aria-hidden
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200 print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-400" />
            <span className="font-semibold tracking-wide">{profile.name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            <a href="#about" className="hover:text-slate-900">À propos</a>
            <a href="#skills" className="hover:text-slate-900">Compétences</a>
            <a href="#experience" className="hover:text-slate-900">Expériences</a>
            <a href="#projects" className="hover:text-slate-900">Projets</a>
            <a href="#certs" className="hover:text-slate-900">Certifications</a>
            <a href="#education" className="hover:text-slate-900">Éducation</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={profile.linkedin}
              target="_blank"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-800"
            >
              <Download className="h-4 w-4" /> Télécharger PDF
            </button>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT WRAPPER (for PDF capture) */}
      <main ref={cvRef} className="mx-auto max-w-7xl px-4">
        {/* HERO */}
        <section id="about" className="pt-10 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-7"
            >
              <GlassCard>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
                  {profile.title}
                </h1>
                <p className="mt-3 text-slate-700">{profile.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>
                    <MapPin className="mr-2 h-3 w-3" /> {profile.location}
                  </Badge>
                  <Badge>
                    <Mail className="mr-2 h-3 w-3" /> {profile.email}
                  </Badge>
                  <Badge>
                    <Phone className="mr-2 h-3 w-3" /> {profile.phone}
                  </Badge>
                  <Badge>{profile.availability}</Badge>
                </div>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                      <div className="text-xl font-extrabold tracking-tight text-slate-900">{s.value}</div>
                      <div className="text-xs text-slate-600">{s.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="md:col-span-5"
            >
              <GlassCard className="h-full">
                <h3 className="text-lg font-semibold mb-3 text-slate-900">Proposition de valeur</h3>
                <ul className="space-y-2 text-slate-800">
                  <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-indigo-500" /> Accélérer l’exploitation des données industrielles et fiabiliser les décisions opérationnelles.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-indigo-500" /> Concevoir des apps métiers sécurisées (SSO, journalisation, rôles) et des KPI en temps réel.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-indigo-500" /> Renforcer la cyber‑résilience (remédiation CVE, conformité RGPD/SOC2, alertes ESD).</li>
                </ul>
                <div className="mt-4 flex gap-3">
                  <a href="#projects" className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50">Voir les projets</a>
                  <a href="#experience" className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50">Parcours pro</a>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="py-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Compétences clés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(skills).map(([group, items]) => (
              <GlassCard key={group}>
                <h3 className="font-semibold mb-2 text-slate-900">{group}</h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((it) => (
                    <Badge key={it}>{it}</Badge>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className="py-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Expériences professionnelles</h2>
          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <GlassCard key={idx}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{exp.role} — <span className="text-slate-700">{exp.company}</span></h3>
                    <div className="text-sm text-slate-600">{exp.period} • {exp.location}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {exp.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </div>
                <ul className="mt-3 list-disc list-inside space-y-1 text-slate-800">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="py-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Projets sélectionnés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p, idx) => (
              <GlassCard key={idx}>
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                <p className="mt-2 text-slate-800">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
                {p.impact?.length ? (
                  <div className="mt-3 text-sm text-slate-700">
                    <span className="font-semibold">Impact :</span> {p.impact.join(" • ")}
                  </div>
                ) : null}
              </GlassCard>
            ))}
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section id="certs" className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Certifications</h2>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <svg className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none"><path d="M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/></svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher une certification..."
                  className="rounded-xl bg-white pl-8 pr-3 py-2 text-sm outline-none placeholder:text-slate-400 border border-slate-200 focus:border-slate-400"
                />
              </div>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="rounded-xl bg-white px-3 py-2 text-sm border border-slate-200 focus:border-slate-400"
                title="Filtrer par domaine"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCerts.map((c, i) => (
              <GlassCard key={`${c.title}-${i}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold leading-snug text-slate-900">{c.title}</h3>
                    <div className="text-sm text-slate-600">{c.org} • {c.date}</div>
                  </div>
                  <Badge>{c.domain}</Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* EDUCATION & LANGUAGES */}
        <section id="education" className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard>
              <div className="flex items-center gap-2 mb-2"><GraduationCap className="h-5 w-5 text-slate-700" /><h2 className="text-2xl font-bold text-slate-900">Éducation</h2></div>
              <ul className="mt-2 space-y-2">
                {education.map((e, i) => (
                  <li key={i}>
                    <div className="font-semibold text-slate-900">{e.school}</div>
                    <div className="text-slate-800">{e.degree}</div>
                    <div className="text-sm text-slate-600">{e.period}</div>
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 mb-2"><Languages className="h-5 w-5 text-slate-700" /><h2 className="text-2xl font-bold text-slate-900">Langues</h2></div>
              <ul className="mt-2 space-y-2">
                {languages.map((l) => (
                  <li key={l.name} className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{l.name}</span>
                    <span className="text-slate-700">{l.level}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-10">
          <GlassCard>
            <h2 className="text-2xl font-bold mb-3 text-slate-900">Contact</h2>
            <div className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50">
                <Mail className="h-4 w-4" /> {profile.email}
              </a>
              <a href={profile.linkedin} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Phone className="h-4 w-4" /> {profile.phone}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <MapPin className="h-4 w-4" /> {profile.location}
              </span>
            </div>
          </GlassCard>
          <p className="mt-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} {profile.name} — Portfolio. Thème glassmorphism clair, Tailwind + Framer Motion.</p>
        </section>
      </main>

      {/* PRINT STYLES */}
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          header, .print:hidden { display: none !important; }
          main { padding: 0 !important; }
          a { color: inherit; text-decoration: none; }
          .shadow-xl, .shadow-sm { box-shadow: none !important; }
          .bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] { background: white !important; }
        }
      `}</style>
    </div>
  );
}
