import { useAuth } from '../App';
import { motion } from 'motion/react';
import { User, Mail, Shield, LogOut, Globe, ArrowLeft, Phone } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
      window.location.reload(); // Refresh to update context
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-xl shadow-sm border border-black/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-display italic">User Profile</h2>
      </header>

      <section className="organic-card flex flex-col items-center gap-4 py-8 relative overflow-hidden">
        <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center border-4 border-white shadow-xl relative z-10">
          <User className="w-12 h-12 text-brand-primary" />
        </div>
        <div className="text-center relative z-10">
          <h3 className="text-2xl font-display italic">{user?.displayName || 'User'}</h3>
          <p className="text-sm text-black/40 font-medium">{user?.email}</p>
        </div>
        <div className="absolute top-0 left-0 w-full h-24 bg-brand-primary/5" />
      </section>

      <div className="grid grid-cols-1 gap-4">
        <div className="organic-card !p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-brand-primary/40" />
              <span className="text-sm font-bold uppercase tracking-widest text-black/40">Active Role</span>
            </div>
            <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {profile?.role || 'Farmer'}
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Change Role</p>
            <div className="flex gap-2">
              {['farmer', 'buyer'].map((role) => (
                <button
                  key={role}
                  disabled={updating || profile?.role === role}
                  onClick={() => handleRoleChange(role)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    profile?.role === role 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-black/5 text-black/40 hover:bg-black/10'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="organic-card !p-5 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-brand-primary/40" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Locale</p>
              <p className="text-sm font-bold">Uganda (Kampala Time)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-brand-primary/40" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Support</p>
              <p className="text-sm font-bold">+256 (Local Agronomist Hotline)</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => auth.signOut()}
          className="organic-card !p-5 flex items-center justify-center gap-3 text-red-600 border-red-100 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold uppercase tracking-widest text-xs">Logout Session</span>
        </button>
      </div>

      <p className="text-[10px] text-center text-black/20 font-black uppercase tracking-[0.2em] mt-4">
        AgriSmart Uganda v1.0.4 • Gemini Active
      </p>
    </div>
  );
}
