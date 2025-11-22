import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Phone, Globe, Bot, User, X } from 'lucide-react';
import { APP_CONFIG } from '../config/app-data';
import { findBotResponse, CHAT_CONFIG } from '../config/chatbot-data';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const CustomerCare = () => {
  // --- Chat State ---
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: CHAT_CONFIG.initialGreeting }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Auto-scroll ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- Handlers ---

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 2. Simulate AI Thinking Delay
    setTimeout(() => {
      // 3. Get Logic Response
      const responseText = findBotResponse(userMsg.text);
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: responseText };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, CHAT_CONFIG.typingDelay);
  };

  return (
    <PageLayout>
      {/* --- Header Section --- */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 text-cyan-600 mb-3 shadow-sm">
          <MessageCircle size={32} />
        </div>
        <h1 className="text-2xl font-heavy text-slate-800">Support Center</h1>
        <p className="text-sm font-medium text-slate-500">We are here to help 24/7</p>
      </div>

      {/* --- Live Chat Interface (Main Feature) --- */}
      <div className="flex-grow flex flex-col h-[500px] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-6">
        
        {/* Chat Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-heavy text-slate-700 text-sm">{CHAT_CONFIG.botName}</h3>
            <p className="text-xs text-green-600 font-bold">Online Now</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm 
                    ${msg.sender === 'user' 
                      ? 'bg-cyan-500 text-white rounded-tr-none' 
                      : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                    }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-grow bg-slate-50 text-slate-800 text-sm font-medium rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* --- External Links --- */}
      <div className="grid grid-cols-2 gap-4">
        <a 
          href={APP_CONFIG.SUPPORT_WHATSAPP} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-2xl border border-green-200 hover:bg-green-100 transition-colors"
        >
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-green-500/30">
            <Phone size={20} />
          </div>
          <span className="text-xs font-heavy text-green-800">WhatsApp</span>
        </a>

        <a 
          href={APP_CONFIG.SUPPORT_TELEGRAM} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-2xl border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-blue-500/30">
            <Globe size={20} />
          </div>
          <span className="text-xs font-heavy text-blue-800">Telegram Channel</span>
        </a>
      </div>

    </PageLayout>
  );
};

export default CustomerCare;