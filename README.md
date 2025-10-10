# Portfolio — Taha Mesbahi

Vite + React + Tailwind. Génère un PDF propre via html2canvas + jsPDF.

## Démarrer en local
```bash
npm install
npm run dev
```

## Build de production
```bash
npm run build
```

Les fichiers statiques seront dans `dist/`.

## Déployer
- **Netlify** : relier le repo ou glisser-déposer `dist/` après `npm run build`.
- **Vercel** : importer le repo, Framework = Vite, Build = `npm run build`, Output = `dist`.
- **GitHub Pages** : `npm run predeploy:gh && npm run deploy:gh` (pensez à définir `base` dans `vite.config.js` si nécessaire).

---

## Déploiement GitHub Pages (automatique via GitHub Actions)
1. Crée un nouveau repo **public** sur GitHub (ex: `taha-portfolio`).
2. Push le code :
   ```bash
   git init
   git add .
   git commit -m "feat: portfolio initial"
   git branch -M main
   git remote add origin https://github.com/<ton-user>/taha-portfolio.git
   git push -u origin main
   ```
3. Va dans **Settings → Pages** et choisis **GitHub Actions**.  
   Le workflow `Deploy to GitHub Pages` build et publie automatiquement sur la branche **gh-pages** virtuellement (via Pages).  
   L'URL finale sera : `https://<ton-user>.github.io/taha-portfolio/`.

> Pas besoin de modifier `vite.config.js` : la commande de build définit `--base` dynamiquement.

## Déploiement Netlify (drag & drop)
1. `npm run build`
2. Sur Netlify, clique **Add new site → Deploy manually** puis glisse le dossier `dist/`.
3. Option : connecte ton repo, et configure
   - Build: `npm run build`
   - Publish: `dist`
