import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Plus, MapPin, Tag, Sparkles, Loader2, X, Image as ImageIcon, Camera } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { getMarketplaceSuggestions, extractHarvestInfo } from '../services/geminiService';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Marketplace() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    cropType: '',
    price: '',
    quantity: '',
    location: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300&auto=format&fit=crop'
  });
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'listings');
    });
    return unsubscribe;
  }, []);

  const handleScanHarvest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const mimeType = (reader.result as string).split(',')[0].split(':')[1].split(';')[0];
        setScanning(true);
        try {
          const info = await extractHarvestInfo(base64, mimeType);
          setFormData(prev => ({
            ...prev,
            cropType: info.cropType || prev.cropType,
            quantity: info.quantity || prev.quantity,
            description: info.suggestedDescription || prev.description,
            imageUrl: reader.result as string
          }));
        } catch (error) {
          console.error(error);
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIHelp = async () => {
    if (!formData.cropType || !formData.quantity || !formData.location) {
      alert("Please enter crop type, quantity, and location first.");
      return;
    }
    setSuggesting(true);
    try {
      const suggestions = await getMarketplaceSuggestions(formData.cropType, formData.quantity, formData.location);
      setFormData(prev => ({
        ...prev,
        price: suggestions.suggestedPrice.toString(),
        description: suggestions.suggestedDescription + "\n\nInsights: " + suggestions.marketInsight
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'listings'), {
        ...formData,
        price: parseFloat(formData.price),
        farmerId: user.uid,
        farmerName: profile?.displayName || 'Unknown Farmer',
        status: 'active',
        createdAt: new Date().toISOString()
      });
      setShowAdd(false);
      setFormData({ cropType: '', price: '', quantity: '', location: '', description: '', imageUrl: formData.imageUrl });
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = listings.filter(l => 
    l.cropType.toLowerCase().includes(search.toLowerCase()) || 
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end bg-white/40 p-4 -m-4 rounded-3xl mb-2">
        <div>
          <h2 className="text-4xl font-display italic">Market Link</h2>
          <p className="secondary-label mt-1">Direct Ugandan Trade</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/20 active:scale-95 transition-all"
        >
          <Plus className="w-7 h-7" />
        </button>
      </header>

      <div className="relative">
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by crop or region..."
          className="w-full bg-white border border-brand-primary/5 rounded-2xl p-5 pl-14 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 shadow-xl shadow-black/[0.02] text-sm font-medium"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-primary/20" />
      </div>

      <div className="grid grid-cols-1 gap-5">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 opacity-20">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="secondary-label">Querying Market...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <ShoppingBag className="w-12 h-12 text-black/10" />
            <p className="font-display text-xl italic opacity-30">No listings found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <Link key={item.id} to={`/listing/${item.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="organic-card !p-4 flex gap-5 hover:bg-brand-accent/20 transition-all cursor-pointer group"
              >
                <div className="w-28 h-28 rounded-3xl overflow-hidden shrink-0 bg-brand-accent shadow-sm ring-4 ring-white">
                  <img src={item.imageUrl} alt={item.cropType} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <h3 className="font-display text-xl italic leading-none">{item.cropType}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <MapPin className="w-3 h-3 text-brand-secondary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-black/30">{item.location}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-t border-black/5 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-black/20 tracking-widest">Price Point</span>
                      <span className="text-xl font-display italic text-brand-primary leading-none mt-1">
                        {item.price.toLocaleString()} <span className="text-[10px] font-sans font-bold opacity-40 italic">UGX</span>
                      </span>
                    </div>
                    <span className="text-[9px] bg-white border border-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm">
                      {item.quantity}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))
        )}
      </div>

      {/* Add Listing Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-[#F9F7F2] rounded-t-[3rem] p-8 pb-12 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowAdd(false)}
                className="absolute top-6 right-6 p-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-brand-primary flex items-center gap-3">
                List Product
              </h3>
              <p className="text-sm text-black/40 mt-1">Use AI to generate description and fair pricing.</p>

              <div className="mt-8">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="scan-harvest" 
                  className="hidden" 
                  onChange={handleScanHarvest}
                />
                <label 
                  htmlFor="scan-harvest"
                  className={cn(
                    "w-full py-6 bg-white border-2 border-dashed border-brand-primary/20 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-brand-accent/20",
                    scanning && "opacity-50 pointer-events-none"
                  )}
                >
                  {scanning ? (
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                  ) : (
                    <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-brand-primary" />
                    </div>
                  )}
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
                    {scanning ? "Extracting Data..." : "Scan Harvest for Auto-fill"}
                  </span>
                </label>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Crop Type</label>
                    <input 
                      required
                      value={formData.cropType}
                      onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                      placeholder="e.g. Maize" 
                      className="bg-white border-none rounded-2xl p-4 shadow-sm focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Quantity</label>
                    <input 
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      placeholder="e.g. 50kg bag" 
                      className="bg-white border-none rounded-2xl p-4 shadow-sm focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Location</label>
                  <input 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Town, District" 
                    className="bg-white border-none rounded-2xl p-4 shadow-sm focus:ring-2 focus:ring-brand-primary/20 text-sm"
                  />
                </div>

                <div className="bg-brand-accent/20 p-4 rounded-3xl border border-brand-accent/40">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-brand-accent-foreground flex items-center gap-2">
                       Smart Tools
                    </span>
                    <button 
                      type="button"
                      onClick={handleAIHelp}
                      disabled={suggesting}
                      className="text-[10px] font-black uppercase tracking-widest bg-brand-accent text-white px-3 py-1 rounded-full shadow-lg shadow-brand-accent/20 active:scale-95 disabled:opacity-50"
                    >
                      {suggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Fill with AI"}
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <input 
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="Price (UGX)" 
                        className="w-full bg-white border-none rounded-xl p-3 shadow-sm text-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/20">UGX</span>
                    </div>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Product Details..." 
                      className="bg-white border-none rounded-xl p-3 shadow-sm text-sm resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-brand-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-brand-primary/20 active:scale-95 transition-all mt-2"
                >
                  Post Listing
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
