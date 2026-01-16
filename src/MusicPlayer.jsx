import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X, Disc, Music } from 'lucide-react';

// --- VOTRE PLAYLIST "SUBURBAN VIBES TM" ---
const PLAYLIST = [
  {
    title: "Sigue",
    artist: "Beny Jr, Morad",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=150&auto=format&fit=crop",
    // ✅ CELUI-CI EST COMPLET ET MARCHE IMMEDIATEMENT
    url: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/music%2FBENY%20JR%20FT%20MORAD%20-%20SIGUE%20(K%20y%20B%20Cap%C3%ADtulo%201)%20%5BVIDEO%20OFICIAL%5D.mp3?alt=media&token=f0f658c1-3e5d-4893-9315-75ad0ba746b4"
  },
  {
    title: "Mantra",
    artist: "Diego Power",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop", 
    // ⚠️ Remplace REMPLACER_PAR_LE_TOKEN par le jeton de Mantra.mp3
    url: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/music%2FMantra.mp3?alt=media&token=REMPLACER_PAR_LE_TOKEN" 
  },
  {
    title: "Tel Aviv To Casablanca",
    artist: "Pablo Fierro",
    cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=150&auto=format&fit=crop",
    // ⚠️ Remplace REMPLACER_PAR_LE_TOKEN par le jeton de ce fichier
    url: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/music%2FPablo%20Fierro%20-%20Tel%20Aviv%20To%20Casablanca.mp3?alt=media&token=REMPLACER_PAR_LE_TOKEN"
  },
  {
    title: "Belma Belma",
    artist: "Boddhi Satva",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=150&auto=format&fit=crop",
    // ⚠️ Remplace REMPLACER_PAR_LE_TOKEN
    url: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/music%2FBoddhi%20Satva%20feat.%20Maalem%20Hammam%20-%20Belma%20Belma%20(Cuebur%20%26%20Vanco%20Remix).mp3?alt=media&token=REMPLACER_PAR_LE_TOKEN"
  },
  {
    title: "Gelato",
    artist: "Tagne",
    cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=150&auto=format&fit=crop",
    // ⚠️ Remplace REMPLACER_PAR_LE_TOKEN
    url: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/music%2FTAGNE%20-%20GELATO%20(Official%20Music%20Video).mp3?alt=media&token=REMPLACER_PAR_LE_TOKEN"
  },
  {
    title: "Messiah",
    artist: "DJ Tomer",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=150&auto=format&fit=crop",
    // ⚠️ Remplace REMPLACER_PAR_LE_TOKEN
    url: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/music%2FDj%20Tomer%20%26%20Ricardo%20%26%20Cisco%20De%20Sol%20feat.Zipho%20Thusi%20-%20Messiah%20(Extended%20Mix).mp3?alt=media&token=REMPLACER_PAR_LE_TOKEN"
  },
  {
    title: "7 Seconds",
    artist: "Joezi, Coco",
    cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=150&auto=format&fit=crop",
    // ⚠️ Remplace REMPLACER_PAR_LE_TOKEN
    url: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/music%2FJoezi%20feat.%20Coco%20%26%20Pape%20Diouf%20-%207%20Seconds%20(MIDH%20050).mp3?alt=media&token=REMPLACER_PAR_LE_TOKEN"
  },
  {
    title: "Flight's Booked",
    artist: "Drake",
    cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=150&auto=format&fit=crop",
    // ⚠️ Remplace REMPLACER_PAR_LE_TOKEN
    url: "https://firebasestorage.googleapis.com/v0/b/authentif-portfolio-tm-github.firebasestorage.app/o/music%2FDrake%20-%20Flight's%20Booked%20(Audio)%20%5Bhb24kZ0fiEA%5D.mp3?alt=media&token=REMPLACER_PAR_LE_TOKEN"
  }
];

const MusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(false); // Fermé au départ
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(new Audio(PLAYLIST[0].url));

  // --- LOGIQUE D'AUTOPLAY ROBUSTE ---
  useEffect(() => {
    audioRef.current.volume = 0.4; // Volume pas trop fort

    // Fonction pour lancer la musique
    const startAudio = () => {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsOpen(true); // Ouvre le lecteur pour montrer que ça joue
        })
        .catch((e) => {
          console.log("Autoplay bloqué par le navigateur (normal). Attente d'interaction.");
        });
    };

    // 1. Tenter immédiatement
    startAudio();

    // 2. Si ça a échoué (silence), on attend le PREMIER CLIC ou TOUCHE sur le site
    const handleInteraction = () => {
      if (audioRef.current.paused) {
        startAudio();
      }
      // On nettoie les écouteurs une fois que c'est lancé
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    // Gestion fin de piste -> Suivant aléatoire
    audioRef.current.onended = () => {
      playRandomTrack();
    };

    return () => {
      audioRef.current.pause();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // --- Changement de piste ---
  useEffect(() => {
    audioRef.current.src = PLAYLIST[currentTrack].url;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error(e));
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playRandomTrack = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } while (nextIndex === currentTrack && PLAYLIST.length > 1);
    
    setCurrentTrack(nextIndex);
    setIsPlaying(true);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-end gap-2 font-sans print:hidden">
      
      {/* --- Lecteur Déplié --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0, x: -20 }}
            animate={{ opacity: 1, width: "auto", x: 0 }}
            exit={{ opacity: 0, width: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] min-w-[280px]">
              
              {/* Cover Art qui tourne */}
              <div className="relative w-12 h-12 shrink-0">
                <motion.img 
                  key={currentTrack}
                  src={PLAYLIST[currentTrack].cover} 
                  alt="Cover"
                  className="w-full h-full rounded-md object-cover shadow-lg border border-white/5"
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 m-auto w-3 h-3 bg-[#18181b] rounded-full border border-[#27272a]"></div>
              </div>

              {/* Info Titre & Artiste */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold text-white truncate max-w-[140px]">
                    {PLAYLIST[currentTrack].title}
                  </p>
                  {/* Visualizer animé */}
                  {isPlaying && (
                    <div className="flex items-end gap-[2px] h-3">
                      {[1,2,3].map(i => (
                        <motion.div 
                          key={i}
                          className="w-[2px] bg-[#81D8D0] rounded-full"
                          animate={{ height: ["20%", "80%", "20%"] }}
                          transition={{ 
                            duration: 0.5 + (i * 0.1), 
                            repeat: Infinity, 
                            repeatType: "mirror" 
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                  {PLAYLIST[currentTrack].artist}
                </p>
              </div>

              {/* Boutons Play/Next */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={togglePlay} 
                  className="p-1.5 rounded-full bg-white text-black hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5"/>}
                </button>
                <button 
                  onClick={playRandomTrack} 
                  className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <SkipForward size={16} />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Bouton Rond Principal (Toggle) --- */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] z-50
          ${isOpen 
            ? "bg-[#121212]/90 border-[#81D8D0]/50 text-[#81D8D0]" 
            : "bg-[#121212]/50 backdrop-blur-md border-white/10 text-white hover:border-[#81D8D0] hover:text-[#81D8D0]"
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <div className="relative">
            <Disc size={24} className={isPlaying ? "animate-spin-slow opacity-100" : "opacity-80"} />
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#81D8D0] rounded-full border-2 border-[#121212] animate-pulse" />
            )}
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default MusicPlayer;