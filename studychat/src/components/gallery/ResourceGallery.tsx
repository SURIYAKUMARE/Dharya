import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaskedFeature } from '../../hooks/useMaskedFeature';
import { FileText, Eye, Upload, Heart, Sparkles, X, Download, ShieldCheck } from 'lucide-react';

interface GalleryItem {
  id: string;
  courseCode: string;
  docTitle: string;
  pages: number;
  date: string;
  // Real private photo details
  realTitle: string;
  realCaption: string;
  realDate: string;
  photoUrl: string;
  likes: number;
}

export const ResourceGallery: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isMasked, title, description, courseCode } = useMaskedFeature('notes');

  const [items, setItems] = useState<GalleryItem[]>([
    {
      id: 'g1',
      courseCode: 'MATH-301',
      docTitle: 'Lecture_04_Eigenvalues_Derivations.pdf',
      pages: 4,
      date: 'Sep 02, 2026',
      realTitle: 'Our Favorite Sunset by the Lake 🌅',
      realCaption: 'Golden hour smiles, holding hands and watching the sky turn rose and gold.',
      realDate: 'August 14',
      photoUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80',
      likes: 12,
    },
    {
      id: 'g2',
      courseCode: 'CS-204',
      docTitle: 'DataStructures_BinaryTree_Notes.pdf',
      pages: 6,
      date: 'Aug 28, 2026',
      realTitle: 'Coffee & Late Night Study Session ☕✨',
      realCaption: 'Two laptops, two warm coffees, and sneaky glances across the library desk.',
      realDate: 'July 22',
      photoUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
      likes: 18,
    },
    {
      id: 'g3',
      courseCode: 'PHY-102',
      docTitle: 'Electromagnetics_Boundary_Conditions.pdf',
      pages: 3,
      date: 'Aug 15, 2026',
      realTitle: 'Weekend Walk in the Botanical Garden 🌿🌸',
      realCaption: 'You stopped to smell every single blooming jasmine flower. Pure happiness.',
      realDate: 'June 30',
      photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
      likes: 24,
    },
    {
      id: 'g4',
      courseCode: 'MECH-201',
      docTitle: 'Thermodynamics_Entropy_Cycles.pdf',
      pages: 5,
      date: 'Aug 04, 2026',
      realTitle: 'Stargazing on the Rooftop ✨🔭',
      realCaption: 'Searching for shooting stars and whispering secrets into the midnight breeze.',
      realDate: 'May 18',
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      likes: 30,
    },
  ]);

  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <FileText className="w-4 h-4" />
            <span>{courseCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            {items.length} Documents Indexed
          </span>
        </div>
      </div>

      {/* Grid of Scanned Lecture Notes / Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setActivePhoto(item)}
            className="group relative rounded-2xl bg-[#0d0a17]/90 border border-white/10 hover:border-emerald-500/40 p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg flex flex-col overflow-hidden"
          >
            {/* Scanned Document Preview Thumbnail */}
            <div className="relative w-full aspect-4/3 rounded-xl bg-slate-900/80 border border-white/10 overflow-hidden flex items-center justify-center mb-3">
              {isMasked ? (
                // Academic Scanned Graph Paper Mock
                <div className="w-full h-full p-3 font-mono text-[9px] text-slate-400 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:12px_12px] flex flex-col justify-between select-none">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>{item.courseCode}</span>
                    <span>PDF • {item.pages}p</span>
                  </div>
                  <div className="space-y-0.5 opacity-80">
                    <div>∫ f(x) dx = F(x) + C</div>
                    <div>det(A - λI) = 0</div>
                    <div>∇ × E = -∂B/∂t</div>
                  </div>
                  <div className="text-[8px] text-slate-500 truncate">{item.docTitle}</div>
                </div>
              ) : (
                // Real Couple Photo Preview
                <img
                  src={item.photoUrl}
                  alt={item.realTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Eye className="w-6 h-6 drop-shadow" />
              </div>
            </div>

            {/* Meta Text */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="text-emerald-400">{item.courseCode}</span>
                <span>{isMasked ? item.date : item.realDate}</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">
                {isMasked ? item.docTitle : item.realTitle}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {isMasked ? `${item.pages} Pages • Scanned OCR` : item.realCaption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal for Real Photo Reveal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="relative max-w-2xl w-full bg-[#0d0a17] border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {isMasked ? (
                // Academic Full PDF Mock
                <div className="w-full h-full p-8 font-mono text-xs text-slate-300 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] space-y-3">
                  <div className="text-emerald-400 font-bold text-sm">
                    {activePhoto.courseCode} — {activePhoto.docTitle}
                  </div>
                  <p>Comprehensive lecture derivations and sample problem set analysis.</p>
                  <div className="p-3 bg-white/5 rounded-xl text-slate-400 text-[11px]">
                    λ² - 7λ + 10 = 0 → (λ - 2)(λ - 5) = 0. Verify orthogonal eigenvectors.
                  </div>
                </div>
              ) : (
                // Authentic Real Photo
                <img
                  src={activePhoto.photoUrl}
                  alt={activePhoto.realTitle}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {isMasked ? activePhoto.docTitle : activePhoto.realTitle}
                </h3>
                {!isMasked && (
                  <span className="flex items-center gap-1 text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    <Heart className="w-3.5 h-3.5 fill-rose-400" />
                    <span>{activePhoto.likes}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isMasked
                  ? 'Official scanned academic document verified by course administration.'
                  : activePhoto.realCaption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
