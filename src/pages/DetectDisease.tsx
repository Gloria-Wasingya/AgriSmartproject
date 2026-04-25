import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, Info, RefreshCw, Sparkles } from 'lucide-react';
import { detectCropDisease } from '../services/geminiService';
import { useAuth } from '../App';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function DetectDisease() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
      const analysis = await detectCropDisease(base64, mimeType);
      
      setResult(analysis);

      // Save to history
      if (user) {
        await addDoc(collection(db, 'diagnoses'), {
          userId: user.uid,
          cropType: analysis.cropType || 'Unknown',
          disease: analysis.diseaseName || 'None',
          cause: analysis.cause || '',
          treatment: analysis.treatment || '',
          confidence: analysis.confidence || 0,
          imageUrl: image,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-4xl font-display italic">Crop Clinic</h2>
        <p className="secondary-label mt-1">AI Diagnostic & Treatment Plan</p>
      </section>

      {!image ? (
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-brand-primary/20 rounded-[2.5rem] h-80 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-brand-accent/10 transition-all bg-white shadow-sm"
        >
          <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center shadow-inner">
            <Camera className="w-10 h-10 text-brand-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-brand-primary">Capture Plant Image</p>
            <p className="text-[10px] uppercase tracking-widest text-black/30 font-bold mt-1">Maize • Coffee • Banana • Beans</p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-square bg-brand-accent/20">
            <img src={image} alt="Crop" className="w-full h-full object-cover" />
            {loading && (
              <div className="absolute inset-0 bg-brand-primary/60 backdrop-blur-md flex flex-col items-center justify-center text-white gap-6">
                <Loader2 className="w-12 h-12 animate-spin text-white/50" />
                <div className="text-center">
                  <p className="font-display text-2xl italic">Consulting Gemini...</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">Scanning for pathogens</p>
                </div>
              </div>
            )}
            <button 
              onClick={reset}
              className="absolute top-6 right-6 p-3 bg-white/40 backdrop-blur-lg rounded-full text-brand-primary hover:bg-white transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {!loading && !result && (
            <button
              onClick={analyzeImage}
              className="w-full py-5 bg-brand-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-brand-primary/20 active:scale-95 transition-all text-sm"
            >
              Start AI Diagnosis
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-5 rounded-[2rem] flex items-center gap-4 text-red-700 border border-red-100 shadow-sm">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            <div className={cn(
              "organic-card !p-8 flex flex-col gap-6 relative overflow-hidden",
              result.isDiseased ? "border-red-100 bg-white" : "border-brand-primary/10 bg-white"
            )}>
              <div className="flex justify-between items-start">
                <div className={cn(
                  "px-3 py-1 rounded font-black text-[10px] uppercase tracking-[0.2em]",
                  result.isDiseased ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600 font-editorial"
                )}>
                  {result.isDiseased ? "Alert: High Risk" : "Status: Optimal"}
                </div>
                <p className="text-[10px] text-black/30 font-black uppercase tracking-widest">
                  Score: {(result.confidence * 100).toFixed(0)}%
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                  result.isDiseased ? "bg-red-50 text-red-600" : "bg-brand-accent text-brand-primary"
                )}>
                  {result.isDiseased ? (
                    <AlertCircle className="w-8 h-8" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-display italic leading-tight">
                    {result.isDiseased ? result.diseaseName : "Healthy Crop Profile"}
                  </h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-brand-secondary mt-1">
                    Subject: {result.cropType}
                  </p>
                </div>
              </div>

              {result.isDiseased && (
                <div className="space-y-6 pt-6 border-t border-black/5">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-black tracking-widest text-brand-secondary italic">The Cause</p>
                    <p className="text-sm font-medium text-black/70 leading-relaxed italic border-l-2 border-brand-secondary/30 pl-4">
                      "{result.cause}"
                    </p>
                  </div>
                  <div className="bg-brand-accent/40 p-6 rounded-2xl border border-brand-primary/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-brand-primary mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Recommended Protocol
                    </p>
                    <p className="text-sm font-bold text-brand-primary leading-relaxed">
                      {result.treatment}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-center text-black/20 font-bold uppercase tracking-[0.2em]">
              Diagnostic provided by Gemini AI Vision
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
