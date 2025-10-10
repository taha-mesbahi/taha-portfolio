import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Remplace par ta config Firebase (console -> Project settings -> Web app)
const firebaseConfig = {
  apiKey: "AIzaSyBdF2WF-BL7XGCqLA4YThgoYeEzWBuRuks",
  authDomain: "authentif-portfolio-tm-github.firebaseapp.com",
  projectId: "authentif-portfolio-tm-github",
  storageBucket: "authentif-portfolio-tm-github.firebasestorage.app",
  messagingSenderId: "917643777959",
  appId: "1:917643777959:web:30c005b38d5b3fe4480882",
  measurementId: "G-PY9M1VC7W2"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
