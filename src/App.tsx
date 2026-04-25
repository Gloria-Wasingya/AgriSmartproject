/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Home, Camera, MessageSquare, ShoppingBag, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import DetectDisease from './pages/DetectDisease';
import Assistant from './pages/Assistant';
import Marketplace from './pages/Marketplace';
import ListingDetails from './pages/ListingDetails';
import Login from './pages/Login';
import Profile from './pages/Profile';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: any | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, profile: null });

export const useAuth = () => useContext(AuthContext);

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/detect', icon: Camera, label: 'Detect' },
    { path: '/assistant', icon: MessageSquare, label: 'AI Help' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Market' },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen pb-24">
      <header className="p-6 flex justify-between items-center bg-white border-b border-brand-primary/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
             <Camera className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-primary">
            AgriSmart <span className="italic font-normal text-brand-secondary">Uganda</span>
          </h1>
        </div>
        <Link to="/profile" className="flex items-center gap-2 bg-brand-accent px-4 py-2 rounded-full border border-brand-primary/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Active</span>
        </Link>
      </header>

      <main className="px-6 py-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/5 px-6 py-4 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "bottom-nav-item",
              location.pathname === item.path && "active"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          // Create default profile
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'farmer',
            language: 'English',
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-display text-4xl text-brand-primary"
        >
          AgriSmart
        </motion.div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, profile }}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/detect" element={user ? <DetectDisease /> : <Navigate to="/login" />} />
            <Route path="/assistant" element={user ? <Assistant /> : <Navigate to="/login" />} />
            <Route path="/marketplace" element={user ? <Marketplace /> : <Navigate to="/login" />} />
            <Route path="/listing/:id" element={user ? <ListingDetails /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
