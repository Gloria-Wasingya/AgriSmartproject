import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Sprout } from 'lucide-react';

export default function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-brand-primary overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm organic-card flex flex-col items-center text-center gap-6 relative z-10"
      >
        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center">
          <Sprout className="w-10 h-10 text-brand-primary" />
        </div>
        
        <div>
          <h2 className="font-display text-4xl font-black text-brand-primary">AgriSmart</h2>
          <p className="text-black/60 mt-2">Empowering Ugandan farmers with AI technology.</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-4 px-6 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-brand-primary/20"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
          Continue with Google
        </button>

        <p className="text-[10px] uppercase tracking-widest text-black/30 font-bold">
          Made for the Pearl of Africa 🇺🇬
        </p>
      </motion.div>
    </div>
  );
}
