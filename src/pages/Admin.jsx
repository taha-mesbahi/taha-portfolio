
import React, { useEffect, useState } from 'react'
import { auth, db, storage, googleProvider } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore'
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
  const [form,setForm]=useState({name:'',description:'',stack:'',impact:'',featured:true})
  const [mainImage,setMainImage]=useState(null)
  const [gallery,setGallery]=useState([])
  const [pdfs,setPdfs]=useState([])
  const [busy,setBusy]=useState(false)
  const [projects,setProjects]=useState([])

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>{ setUser(u||null); setIsAdmin(u?allowedAdmins.includes(u.email):false) })
    return ()=>unsub()
  },[])

  useEffect(()=>{
    (async()=>{
      const snap=await getDocs(query(collection(db,'projects'),orderBy('createdAt','desc')))
      setProjects(snap.docs.map(d=>({id:d.id,...d.data()})))
    })()
  },[busy])

  const login=async()=>{ await signInWithPopup(auth, googleProvider) }
  const logout=async()=>{ await signOut(auth) }

  const submit=async(e)=>{
    e.preventDefault()
    if(!isAdmin){ alert('Accès refusé'); return }
    setBusy(true)
    try{
      const stamp = Date.now()
      // main image
      let mainImageUrl=''
      if(mainImage){
        const ext = mainImage.name.split('.').pop()
        mainImageUrl = await uploadFile(`projects/${stamp}/main.${ext}`, mainImage)
      }
      // gallery
      const galleryUrls=[]
      for(let i=0;i<(gallery?.length||0);i++){
        const f = gallery[i]; const ext = f.name.split('.').pop()
        const url = await uploadFile(`projects/${stamp}/gallery/${i}.${ext}`, f)
        galleryUrls.push(url)
      }
      // pdfs + thumbs
      const pdfEntries=[]
      for(let i=0;i<(pdfs?.length||0);i++){
        const f = pdfs[i]
        const pdfUrl = await uploadFile(`projects/${stamp}/pdfs/${f.name}`, f)
        const thumbBlob = await pdfToThumb(f)
        const thumbUrl = await uploadFile(`projects/${stamp}/thumbnails/${f.name.replace(/\.pdf$/i,'')}.png`, thumbBlob)
        pdfEntries.push({ name: f.name, url: pdfUrl, thumbUrl })
      }

      await addDoc(collection(db,'projects'),{
        name: form.name,
        description: form.description,
        stack: form.stack? form.stack.split(',').map(s=>s.trim()).filter(Boolean):[],
        impact: form.impact? form.impact.split(',').map(s=>s.trim()).filter(Boolean):[],
        featured: !!form.featured,
        mainImageUrl, galleryUrls, pdfs: pdfEntries,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      })

      setForm({name:'',description:'',stack:'',impact:'',featured:true})
      setMainImage(null); setGallery([]); setPdfs([])
      alert('Projet ajouté ✅')
    }catch(err){
      console.error(err); alert('Erreur: '+err.message)
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
              <button onClick={login} className="rounded-lg bg-slate-900 text-white px-3 py-2">Se connecter (Google)</button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm">{user.email}</span>
                <button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2">Se déconnecter</button>
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
            <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="font-semibold">Nouveau projet</h2>
              <div>
                <label className="block text-sm mb-1">Nom</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2" rows={4}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Stack (virgules)</label>
                  <input value={form.stack} onChange={e=>setForm({...form,stack:e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2"/>
                </div>
                <div>
                  <label className="block text-sm mb-1">Impact (virgules)</label>
                  <input value={form.impact} onChange={e=>setForm({...form,impact:e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2"/>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="featured" type="checkbox" checked={form.featured} onChange={e=>setForm({...form, featured:e.target.checked})}/>
                <label htmlFor="featured">Mettre en avant (homepage)</label>
              </div>
              <div>
                <label className="block text-sm mb-1">Image principale</label>
                <input type="file" accept="image/*" onChange={e=>setMainImage(e.target.files[0])}/>
              </div>
              <div>
                <label className="block text-sm mb-1">Galerie (plusieurs images)</label>
                <input type="file" accept="image/*" multiple onChange={e=>setGallery(e.target.files)}/>
              </div>
              <div>
                <label className="block text-sm mb-1">Pièces justificatives (PDF)</label>
                <input type="file" accept="application/pdf" multiple onChange={e=>setPdfs(e.target.files)}/>
              </div>
              <button disabled={busy} className="rounded-lg bg-slate-900 text-white px-4 py-2">{busy?'Envoi…':'Ajouter le projet'}</button>
            </form>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold mb-3">Projets existants</h2>
              <ul className="space-y-3">
                {projects.map(p => (
                  <li key={p.id} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-slate-600">{p.featured?'⭐':'—'} {(p.stack||[]).join(', ')}</div>
                    </div>
                    <button onClick={async()=>{ if(confirm('Supprimer ?')){ await deleteDoc(doc(db,'projects',p.id)); alert('Supprimé') } }} className="text-red-600">Supprimer</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
