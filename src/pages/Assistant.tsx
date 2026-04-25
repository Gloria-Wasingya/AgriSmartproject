import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, User, Bot, HelpCircle, Mic, MicOff } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: [{ text: "Hello! I am your AgriSmart Assistant. How can I help you with your farming today in Uganda?" }]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Web Speech API
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };

    recognition.start();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAssistant(input, messages);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I'm experiencing some technical difficulties. Please try again later." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <header className="mb-6">
        <h2 className="text-4xl font-display italic">Farming Assistant</h2>
        <p className="secondary-label mt-1">Direct Counsel from Gemini AI</p>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={cn(
              "flex gap-4",
              msg.role === 'user' ? "flex-row-reverse text-right" : "flex-row"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border-2 border-white",
              msg.role === 'user' ? "bg-brand-secondary text-white" : "bg-brand-primary text-white"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
            </div>
            <div className={cn(
              "p-5 rounded-[1.5rem] max-w-[85%] shadow-xl shadow-black/5 leading-relaxed",
              msg.role === 'user' 
                ? "bg-brand-secondary text-white rounded-tr-none text-sm font-medium" 
                : "bg-white text-black/80 rounded-tl-none border border-brand-primary/10"
            )}>
              {msg.role === 'model' && (
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 font-sans">Gemini Expert</p>
              )}
              <div className={cn(
                "prose prose-sm font-medium",
                msg.role === 'user' ? "prose-invert" : ""
              )}>
                <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-brand-primary animate-pulse" />
            </div>
            <div className="p-4 bg-white rounded-2xl rounded-tl-none border border-black/5 flex gap-1">
              <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 relative flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about crops, fertilizers, pricing..."
            className="w-full bg-white border border-black/10 rounded-2xl p-4 pr-14 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 shadow-xl"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={startListening}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl",
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-brand-primary"
          )}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["Maize planting tips", "Market prices in Jinja", "Treating banana wilt"].map((tip) => (
          <button 
            key={tip}
            onClick={() => setInput(tip)}
            className="px-3 py-1.5 bg-white border border-black/5 rounded-full text-[10px] uppercase font-bold tracking-wider text-black/40 hover:border-brand-primary/40 transition-colors"
          >
            {tip}
          </button>
        ))}
      </div>
    </div>
  );
}
