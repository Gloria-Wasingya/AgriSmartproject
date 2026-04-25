import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Phone, User, Calendar, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const docRef = doc(db, 'listings', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setListing(snap.data());
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!listing) return (
    <div className="p-8 text-center">
      <p>Listing not found.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-brand-primary">Go Back</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 -mx-6 -mt-6">
      <div className="relative h-96 w-full">
        <img 
          src={listing.imageUrl} 
          alt={listing.cropType} 
          className="w-full h-full object-cover" 
        />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-10 left-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F9F7F2] to-transparent" />
      </div>

      <div className="px-6 flex flex-col gap-6 relative -mt-16">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="organic-card !p-8 shadow-2xl shadow-brand-primary/5"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/5 px-2 py-1 rounded-full">
                {listing.quantity} Available
              </span>
              <h2 className="text-4xl font-black mt-2 uppercase tracking-tighter">{listing.cropType}</h2>
              <p className="flex items-center gap-1 text-black/40 text-sm mt-1">
                <MapPin className="w-4 h-4" /> {listing.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-black/20 uppercase tracking-widest">Price</p>
              <p className="text-3xl font-black text-brand-primary leading-none mt-1">
                {listing.price.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase font-bold text-black/40">UGX</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-black/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/30 mb-4">Description</h3>
            <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <div className="flex items-center gap-3 flex-1 bg-black/5 p-4 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Posted By</p>
                <p className="text-sm font-bold">{listing.farmerName}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="flex gap-4">
          <button className="flex-1 bg-brand-primary text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
            <Phone className="w-5 h-5" /> Call Farmer
          </button>
          <button className="w-20 aspect-square bg-white border border-black/5 rounded-[2rem] flex items-center justify-center text-brand-primary shadow-xl shadow-black/5 active:scale-95 transition-all">
            <MessageCircle className="w-6 h-6" />
          </button>
        </section>
      </div>
    </div>
  );
}
