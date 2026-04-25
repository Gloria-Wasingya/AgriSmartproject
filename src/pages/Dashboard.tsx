import { useAuth } from '../App';
import { motion } from 'motion/react';
import { Camera, MessageSquare, ShoppingBag, TrendingUp, Sun, Droplets, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();

  const quickActions = [
    { label: 'Detect Disease', icon: Camera, path: '/detect', color: 'bg-red-50 text-red-600', description: 'Photo scan crops' },
    { label: 'Marketplace', icon: ShoppingBag, path: '/marketplace', color: 'bg-blue-50 text-blue-600', description: 'Sell your harvest' },
    { label: 'AI Farm Help', icon: MessageSquare, path: '/assistant', color: 'bg-green-50 text-green-600', description: 'Ask questions' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <section>
        <p className="secondary-label">Good Morning 🇺🇬</p>
        <h2 className="text-4xl font-display italic mt-1">Hello, {profile?.displayName?.split(' ')[0] || 'Farmer'}!</h2>
      </section>

      {/* Weather/Market Pulse */}
      <section className="grid grid-cols-2 gap-4">
        <div className="organic-card flex flex-col gap-2 !p-5 bg-white">
          <div className="flex items-center justify-between">
            <Sun className="w-5 h-5 text-orange-400" />
            <span className="text-[10px] font-bold text-brand-secondary uppercase">WAKISO</span>
          </div>
          <span className="text-3xl font-display italic">28°C</span>
          <span className="text-[10px] text-black/30 uppercase tracking-wider font-bold">Expect Sunny Skies</span>
        </div>
        <div className="organic-card flex flex-col gap-2 !p-5 bg-brand-accent/30">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <span className="text-[10px] font-bold text-brand-secondary uppercase">PULSE</span>
          </div>
          <span className="text-3xl font-display italic">+12%</span>
          <span className="text-[10px] text-brand-primary/40 uppercase tracking-wider font-bold">Maize demand is high</span>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black/30 mb-4 px-2">
          Agricultural Services
        </h3>
        <div className="flex flex-col gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.path}>
              <motion.div
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="organic-card !p-5 flex items-center gap-5 group transition-all hover:bg-brand-accent/20"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", action.color)}>
                  <action.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-xl leading-none italic">{action.label}</h4>
                  <p className="text-xs font-semibold text-black/30 uppercase tracking-widest mt-1">{action.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Insight */}
      <section className="bg-brand-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Gemini Intelligence</p>
          <h3 className="text-2xl font-display italic mt-2">Regional Insight</h3>
          <p className="text-sm opacity-80 mt-3 leading-relaxed font-medium">
            "Direct buyers in Kampala are looking for Grade A Matooke. Consider listing your bunches today for premium prices."
          </p>
          <button className="mt-6 px-6 py-2.5 bg-white text-brand-primary rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
            Consult Analyst
          </button>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      </section>
    </div>
  );
}

// Utility function duplicated for this file or imported
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
