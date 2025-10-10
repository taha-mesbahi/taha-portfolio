# Portfolio fusionné — UI complète + Admin Firebase

## Contenu
- Portfolio clair + sections (Compétences, Expériences, Certifications…)
- **Projets dynamiques** (Firestore) sur l'accueil
- **/admin** pour ajouter/supprimer des projets (images, galerie, PDFs avec vignettes)

## À configurer
1. `src/firebase.js` → colle ta config Firebase (apiKey, projectId, etc.).
2. Firestore → crée l'index **featured DESC, createdAt DESC**.
3. Auth Google activée + domaines autorisés: `http://localhost:5173`, `https://taha-mesbahi.github.io`.
4. Dans `src/pages/Admin.jsx`, ajuste `allowedAdmins` si besoin.

## Build
```
npm install
npm run build
git add .
git commit -m "merge: portfolio + admin firebase projects"
git push
```
