'use client';
import { useState, useRef, useEffect } from 'react';
import { usePOSStore } from '@/lib/store';
import { APP_CONFIG } from '@/lib/config';
import { Bot, Send, X, Receipt, Calculator, Package, ShoppingCart } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const { products, categories, cart, sales, addToCart, clearCart } = usePOSStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your POS Assistant.\n\nI can help you with:\n• Product prices and stock\n• Cart totals and calculations\n• Receipt summaries\n• POS system guidance\n• Actionable Commands (e.g., \"add 2 apples to cart\", \"clear cart\")\n\nWhat would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const processCommand = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase().trim();
    
    // Help Center
    if (input.includes('help') || input.includes('how') || input.includes('what can') || input === '?') {
      return `🤖 I can help you with these tasks:\n\n` +
             `🛒 Cart Actions:\n` +
             `• "Add 2 apples to cart"\n` +
             `• "Show my cart"\n` +
             `• "Clear my basket"\n\n` +
             `📦 Inventory:\n` +
             `• "Check stock of Laptop"\n` +
             `• "Price of Coffee"\n` +
             `• "What is low on stock?"\n\n` +
             `💰 Sales & Trends:\n` +
             `• "How much did we sell today?"\n` +
             `• "Show total revenue"\n` +
             `• "Generate a receipt preview"`;
    }

    // ACTION: Clear cart
    if (input.match(/clear|empty|reset\s+(cart|basket)/)) {
      if (cart.length === 0) return "🏷️ Your cart is already empty!";
      clearCart();
      return "✅ Success: I've completely cleared your shopping cart.";
    }

    // ACTION: Add to cart
    if (input.match(/^add\s+/)) {
      const match = input.match(/add\s+(\d+)?\s*(.*?)(?:\s+to\s+cart|\s+to\s+basket)?$/);
      if (match && match[2]) {
        const quantity = parseInt(match[1] || '1', 10);
        const query = match[2].trim();
        
        const product = products.find(p => 
          p.name.toLowerCase().includes(query) || 
          query.includes(p.name.toLowerCase()) ||
          p.sku.toLowerCase() === query
        );
        
        if (product) {
          if (product.stock <= 0) return `❌ Sorry, ${product.name} is currently out of stock.`;
          const actualAdd = Math.min(quantity, product.stock);
          for(let i=0; i<actualAdd; i++) addToCart(product);
          
          return actualAdd < quantity 
            ? `⚠️ I could only add ${actualAdd}x ${product.name} (stock limit reached).`
            : `✅ Successfully added ${actualAdd}x ${product.name} to your cart.`;
        }
        return `🔍 I couldn't find any product matching "${query}". Try checking your spelling.`;
      }
    }
    
    // BUSINESS INSIGHTS: Low Stock
    if (input.includes('low') || input.includes('alert') || input.includes('empty') || input.includes('inventory')) {
      const lowStock = products.filter(p => p.stock <= p.minStock);
      
      let res = `📊 Inventory Status:\n`;
      res += `• Total Products: ${products.length}\n`;
      res += `• In Stock: ${products.filter(p => p.stock > 0).length}\n`;
      res += `• Out of Stock: ${products.filter(p => p.stock === 0).length}\n\n`;

      if (lowStock.length > 0) {
        res += `⚠️ Low Stock Alerts:\n`;
        lowStock.forEach(p => {
          res += `• ${p.name}: ${p.stock} units left\n`;
        });
      } else {
        res += `✅ All items are well-stocked!`;
      }
      return res;
    }

    // REVENUE & SALES INFO
    if (input.includes('revenue') || input.includes('sell') || input.includes('sale') || input.includes('income')) {
      const today = new Date().toDateString();
      const tSales = sales.filter(s => new Date(s.createdAt).toDateString() === today);
      const tRev = tSales.reduce((sum, s) => sum + s.grandTotal, 0);
      
      let res = `💰 Business Performance:\n\n`;
      res += `• Today's Revenue: ${APP_CONFIG.currency.symbol}${tRev.toLocaleString()}\n`;
      res += `• Transaction Count: ${tSales.length}\n`;
      res += `• Total Products Sold: ${tSales.reduce((sum, s) => sum + (s.items?.length || 0), 0)}\n\n`;
      
      if (tRev > 0) res += `📈 Great job! You have active sales today.`;
      else res += `☕ No transactions recorded yet today.`;
      
      return res;
    }

    // PRICE & INFO CHECK
    if (input.includes('price') || input.includes('cost') || input.includes('stock of') || input.includes('how many')) {
      const query = input.replace(/price of|cost of|stock of|check|how many/g, '').trim();
      const p = products.find(p => p.name.toLowerCase().includes(query) || query.includes(p.name.toLowerCase()));
      
      if (p) {
        const cat = categories.find(c => c.id === p.categoryId);
        return `📄 Product Details:\n\n` +
               `• Name: ${p.name}\n` +
               `• Price: ${APP_CONFIG.currency.symbol}${p.price.toFixed(2)}\n` +
               `• Stock: ${p.stock} units\n` +
               `• Category: ${cat?.name || 'General'}\n` +
               `• SKU: ${p.sku}`;
      }
    }

    // RECEIPT PREVIEW
    if (input.includes('receipt') || input.includes('preview')) {
      if (cart.length === 0) return "🛒 Your cart is empty. Add items to see a receipt preview.";
      
      const sub = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      const total = sub + (sub * APP_CONFIG.taxRate);
      
      let res = `🧾 Receipt Preview:\n`;
      res += `━━━━━━━━━━━━━━━━━━━━\n`;
      cart.forEach(i => res += `${i.product.name} x${i.quantity} ... ${APP_CONFIG.currency.symbol}${(i.product.price * i.quantity).toFixed(2)}\n`);
      res += `━━━━━━━━━━━━━━━━━━━━\n`;
      res += `TOTAL: ${APP_CONFIG.currency.symbol}${total.toFixed(2)}\n`;
      res += `━━━━━━━━━━━━━━━━━━━━`;
      return res;
    }

    // DEFAULT
    return `🤔 I'm not sure about that. \n\nTry asking about prices, stock levels, revenue, or say "add 1 laptop to cart".`;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI thinking delay
    setTimeout(async () => {
      const response = await processCommand(userMessage.content);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white/70 dark:bg-slate-950/40 backdrop-blur-[60px] rounded-[2rem] shadow-2xl shadow-indigo-500/20 border border-slate-200/50 dark:border-white/10 flex flex-col overflow-hidden z-50 animate-fade-in-up selection:bg-indigo-500/30 transition-all duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/80 to-purple-600/80 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner pt-0.5 backdrop-blur-md">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-black text-sm tracking-tight uppercase">AI ASSISTANT</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
              <p className="text-indigo-100 text-[10px] uppercase tracking-widest font-bold opacity-80">Online</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white/90 hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 py-3 bg-slate-900/40 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-white/5 flex gap-2 overflow-x-auto scrollbar-thin">
        <button onClick={() => setInput('show products')} className="px-3 py-1.5 bg-white dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm hover:translate-y-[-1px]">
          <Package className="w-3.5 h-3.5 text-indigo-500" /> Products
        </button>
        <button onClick={() => setInput('show cart')} className="px-3 py-1.5 bg-white dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm hover:translate-y-[-1px]">
          <ShoppingCart className="w-3.5 h-3.5 text-purple-500" /> Cart
        </button>
        <button onClick={() => setInput('compute total')} className="px-3 py-1.5 bg-white dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm hover:translate-y-[-1px]">
          <Calculator className="w-3.5 h-3.5 text-blue-500" /> Total
        </button>
        <button onClick={() => setInput('generate receipt')} className="px-3 py-1.5 bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm hover:translate-y-[-1px]">
          <Receipt className="w-3.5 h-3.5 text-emerald-500" /> Receipt
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin bg-black/5 dark:bg-black/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm shadow-sm transition-all hover:shadow-md ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm shadow-indigo-500/20' 
                : 'bg-white dark:bg-slate-800/80 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-tl-sm whitespace-pre-wrap'
            }`}>
              {msg.content}
              <p className={`text-[9px] mt-1.5 opacity-50 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-indigo-100 text-right' : 'text-slate-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-5 bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5">
        <div className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-5 py-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 shadow-inner placeholder-slate-400 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
