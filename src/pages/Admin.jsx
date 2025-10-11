// pages/Admin.jsx
import React, { useEffect, useState } from 'react'
import { auth, db, storage, googleProvider } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import {
  collection, addDoc, serverTimestamp, getDocs, query, orderBy,
  doc, deleteDoc, updateDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

const allowedAdmins = ['tahamesbahi123@gmail.com']

async function uploadFile(path, file){
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return await getDownloadURL(r)
}
async function pdfToThumb(file){
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({data:buf}).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({scale:1})
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const scale=0.8
  canvas.width = viewport.width*scale
  canvas.height= viewport.height*scale
  await page.render({canvasContext:ctx, viewport:page.getViewport({scale})}).promise
  return await new Promise(res=>canvas.toBlob(res,'image/png',0.9))
}

export default function Admin(){
  const [user,setUser]=useState(null)
  const [isAdmin,setIsAdmin]=useState(false)

  // Formulaire (sert pour Création et Édition)
  const [form,setForm]=useState({name:'',description:'',stack:'',impact:'',featured:true})
  const [mainImage,setMainImage]=useState(null)
  const [gallery,setGallery]=useState([])
  const [pdfs,setPdfs]=useState([])

  // Édition
  const [editId, setEditId] = useState(null)
  const [existing, setExisting] = useState({ mainImageUrl:'', galleryUrls:[], pdfs:[] })
  const [removeGalleryIdx, setRemoveGalleryIdx] = useState([])   // indices à retirer
  const [removePdfIdx, setRemovePdfIdx] = useState([])           // indices à retirer

  const [busy,setBusy]=useState(false)
  const [projects,setProjects]=useState([])

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>{
      setUser(u||null)
      setIsAdmin(u?allowedAdmins.includes(u.email):false)
    })
    return ()=>unsub()
  },[])

  async function reload(){
    const snap=await getDocs(query(collection(db,'projects'),orderBy('createdAt','desc')))
    setProjects(snap.docs.map(d=>({id:d.id,...d.data()})))
  }
  useEffect(()=>{ reload() },[])

  const login=async()=>{ await signInWithPopup(auth, googleProvider) }
  const logout=async()=>{ await signOut(auth) }

  // Démarrer l’édition d’un projet
  const startEdit = (p) => {
    setEditId(p.id)
    setForm({
      name: p.name || '',
      description: p.description || '',
      stack: (p.stack||[]).join(', '),
      impact: (p.impact||[]).join(', '),
      featured: !!p.featured
    })
    setExisting({
      mainImageUrl: p.mainImageUrl || '',
      galleryUrls: Array.isArray(p.galleryUrls) ? p.galleryUrls : [],
      pdfs: Array.isArray(p.pdfs) ? p.pdfs : []
    })
    setMainImage(null)
    setGallery([])
    setPdfs([])
    setRemoveGalleryIdx([])
    setRemovePdfIdx([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditId(null)
    setExisting({ mainImageUrl:'', galleryUrls:[], pdfs:[] })
    setForm({name:'',description:'',stack:'',impact:'',featured:true})
    setMainImage(null); setGallery([]); setPdfs([])
    setRemoveGalleryIdx([]); setRemovePdfIdx([])
  }

  // Création OU Mise à jour
  const submit=async(e)=>{
    e.preventDefault()
    if(!isAdmin){ alert('Accès refusé'); return }
    setBusy(true)
    try{
      const stamp = Date.now()

      // 1) Main image
      let finalMainUrl = existing.mainImageUrl || ''
      if(mainImage){
        const ext = mainImage.name.split('.').pop()
        finalMainUrl = await uploadFile(`projects/${stamp}/main.${ext}`, mainImage)
      }

      // 2) Galerie: garder celles existantes (moins celles à retirer) + uploader les nouvelles
      let finalGallery = (existing.galleryUrls||[]).filter((_,i)=>!removeGalleryIdx.includes(i))
      for(let i=0;i<(gallery?.length||0);i++){
        const f = gallery[i]; const ext = f.name.split('.').pop()
        const url = await uploadFile(`projects/${stamp}/gallery/${i}.${ext}`, f)
        finalGallery.push(url)
      }

      // 3) PDFs: idem (conserver/retirer/ajouter)
      let finalPdfs = (existing.pdfs||[]).filter((_,i)=>!removePdfIdx.includes(i))
      for(let i=0;i<(pdfs?.length||0);i++){
        const f = pdfs[i]
        const pdfUrl = await uploadFile(`projects/${stamp}/pdfs/${f.name}`, f)
        const thumbBlob = await pdfToThumb(f)
        const thumbUrl = await uploadFile(`projects/${stamp}/thumbnails/${f.name.replace(/\.pdf$/i,'')}.png`, thumbBlob)
        finalPdfs.push({ name: f.name, url: pdfUrl, thumbUrl })
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        stack: form.stack ? form.stack.split(',').map(s=>s.trim()).filter(Boolean) : [],
        impact: form.impact ? form.impact.split(',').map(s=>s.trim()).filter(Boolean) : [],
        featured: !!form.featured,
        mainImageUrl: finalMainUrl,
        galleryUrls: finalGallery,
        pdfs: finalPdfs,
        updatedAt: serverTimestamp()
      }

      if(editId){
        // UPDATE
        await updateDoc(doc(db,'projects',editId), payload)
        alert('Projet mis à jour ✅')
      }else{
        // CREATE
        await addDoc(collection(db,'projects'),{
          ...payload,
          createdAt: serverTimestamp()
        })
        alert('Projet ajouté ✅')
      }

      // Reset + refresh
      cancelEdit()
      await reload()
    }catch(err){
      console.error(err)
      alert('Erreur: '+err.message)
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin — Portfolio</h1>
          <div>
            {!user ? (
              <button onClick={login} className="rounded-lg bg-slate-900 text-white px-3 py-2">
                Se connecter (Google)
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm">{user.email}</span>
                <button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2">
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>

        {!isAdmin ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p>Accès restreint. Connecte-toi avec un compte autorisé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FORM CREATE/EDIT */}
            <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{editId ? 'Modifier le projet' : 'Nouveau projet'}</h2>
                {editId && (
                  <button type="button" onClick={cancelEdit} className="text-slate-600 hover:underline">
                    Annuler l’édition
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Nom</label>
                <input required value={form.name}
                  onChange={e=>setForm({...form,name:e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"/>
              </div>

              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea required value={form.description}
                  onChange={e=>setForm({...form,description:e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2" rows={4}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Stack (virgules)</label>
                  <input value={form.stack}
                    onChange={e=>setForm({...form,stack:e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"/>
                </div>
                <div>
                  <label className="block text-sm mb-1">Impact (virgules)</label>
                  <input value={form.impact}
                    onChange={e=>setForm({...form,impact:e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"/>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="featured" type="checkbox" checked={form.featured}
                  onChange={e=>setForm({...form, featured:e.target.checked})}/>
                <label htmlFor="featured">Mettre en avant (homepage)</label>
              </div>

              {/* SECTION IMAGES EXISTANTES (en mode édition) */}
              {editId && (
                <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Image principale actuelle</div>
                    {existing.mainImageUrl
                      ? <img src={existing.mainImageUrl} alt="main" className="h-28 rounded border" />
                      : <div className="text-xs text-slate-500">Aucune</div>}
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Galerie actuelle (cocher pour retirer)</div>
                    <div className="flex gap-2 overflow-x-auto">
                      {existing.galleryUrls.map((u, i)=>(
                        <label key={i} className="relative inline-block">
                          <img src={u} alt={'g'+i} className="h-16 w-24 object-cover rounded border"/>
                          <input
                            type="checkbox"
                            className="absolute top-1 left-1"
                            checked={removeGalleryIdx.includes(i)}
                            onChange={(e)=>{
                              setRemoveGalleryIdx(prev=>{
                                const arr = [...prev]
                                if(e.target.checked && !arr.includes(i)) arr.push(i)
                                if(!e.target.checked) return arr.filter(x=>x!==i)
                                return arr
                              })
                            }}
                            title="Retirer de la galerie"
                          />
                        </label>
                      ))}
                      {existing.galleryUrls.length===0 && (
                        <div className="text-xs text-slate-500">Aucune</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">PDFs actuels (cocher pour retirer)</div>
                    <div className="grid grid-cols-2 gap-2">
                      {existing.pdfs.map((p, i)=>(
                        <label key={i} className="flex items-center gap-2 border rounded p-2">
                          {p.thumbUrl
                            ? <img src={p.thumbUrl} alt={p.name} className="h-12 w-9 object-cover rounded"/>
                            : <span className="text-xs">PDF</span>}
                          <span className="text-xs truncate">{p.name}</span>
                          <input
                            type="checkbox"
                            className="ml-auto"
                            checked={removePdfIdx.includes(i)}
                            onChange={(e)=>{
                              setRemovePdfIdx(prev=>{
                                const arr = [...prev]
                                if(e.target.checked && !arr.includes(i)) arr.push(i)
                                if(!e.target.checked) return arr.filter(x=>x!==i)
                                return arr
                              })
                            }}
                            title="Retirer ce PDF"
                          />
                        </label>
                      ))}
                      {existing.pdfs.length===0 && (
                        <div className="text-xs text-slate-500 col-span-2">Aucun PDF</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* NOUVELLE IMAGE PRINCIPALE / GALERIE / PDF À AJOUTER */}
              <div>
                <label className="block text-sm mb-1">
                  {editId ? 'Remplacer l’image principale (optionnel)' : 'Image principale'}
                </label>
                <input type="file" accept="image/*" onChange={e=>setMainImage(e.target.files[0])}/>
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {editId ? 'Ajouter à la galerie (optionnel)' : 'Galerie (plusieurs images)'}
                </label>
                <input type="file" accept="image/*" multiple onChange={e=>setGallery(e.target.files)}/>
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {editId ? 'Ajouter des PDF (optionnel)' : 'Pièces justificatives (PDF)'}
                </label>
                <input type="file" accept="application/pdf" multiple onChange={e=>setPdfs(e.target.files)}/>
              </div>

              <button disabled={busy}
                className="rounded-lg bg-slate-900 text-white px-4 py-2">
                {busy ? (editId ? 'Mise à jour…' : 'Envoi…')
                      : (editId ? 'Enregistrer les modifications' : 'Ajouter le projet')}
              </button>
            </form>

            {/* LISTE PROJETS */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold mb-3">Projets existants</h2>
              <ul className="space-y-3">
                {projects.map(p => (
                  <li key={p.id} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-slate-600 truncate">
                        {p.featured?'⭐':'—'} {(p.stack||[]).join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={()=>startEdit(p)}
                        className="text-blue-600 hover:underline">
                        Modifier
                      </button>
                      <button
                        onClick={async()=>{
                          if(confirm('Supprimer ce projet ?')){
                            await deleteDoc(doc(db,'projects',p.id))
                            alert('Supprimé')
                            await reload()
                          }
                        }}
                        className="text-red-600">
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
                {projects.length===0 && <li className="text-sm text-slate-500">Aucun projet</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
