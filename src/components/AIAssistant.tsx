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
    
    // ACTION: Clear cart
    if (input === 'clear cart' || input === 'empty cart' || input === 'clear basket' || input === 'empty basket') {
      if (cart.length === 0) {
        return "Your cart is already empty!";
      }
      clearCart();
      return "✅ I've cleared all items from your cart.";
    }

    // ACTION: Add to cart (e.g., "add 2 mangoes to cart", "add apple")
    if (input.startsWith('add ')) {
      // Very basic natural language parsing: "add [qty] [item] to cart"
      const match = input.match(/add\s+(\d+)?\s*(.*?)(?:\s+to\s+cart|\s+to\s+basket)?$/i);
      
      if (match && match[2]) {
        const qtyStr = match[1];
        const itemName = match[2];
        let quantity = qtyStr ? parseInt(qtyStr, 10) : 1;
        
        // Find the product
        const product = products.find(p => itemName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(itemName));
        
        if (product) {
          if (product.stock === 0) {
            return `Sorry, ${product.name} is currently out of stock.`;
          }
          
          if (quantity > product.stock) {
            quantity = product.stock;
            addToCart(product); // addToCart currently adds 1, we'd need loop or store update to add multiple
            // Since store addToCart only increments by 1 if exists or adds 1 if not, we'll loop it
            for(let i=1; i<quantity; i++) addToCart(product);
            
            return `✅ I could only add ${quantity}x ${product.name} to your cart because that's all the stock we have left.`;
          }

          // Add to cart multiple times if qty > 1
          for(let i=0; i<quantity; i++) {
             addToCart(product);
          }
          
          return `✅ Added ${quantity}x ${product.name} to your cart!`;
        } else {
           return `I couldn't find a product matching "${itemName}". You can type "show products" to see what we have.`;
        }
      }
    }
    
    // Cart and total calculations
    if (input.includes('total') || input.includes('how much') || input.includes('sum') || input.includes('compute')) {
      if (cart.length === 0) {
        return "Your cart is currently empty. Add some products to see the total.";
      }
      
      const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      const tax = subtotal * APP_CONFIG.taxRate;
      const grandTotal = subtotal + tax;
      
      let response = `📊 Cart Total Calculation:\n\n`;
      response += `Items in Cart:\n`;
      cart.forEach(item => {
        response += `• ${item.product.name} x${item.quantity} = ₱${(item.product.price * item.quantity).toFixed(2)}\n`;
      });
      response += `\nSubtotal: ₱${subtotal.toFixed(2)}\n`;
      response += `Tax (12%): ₱${tax.toFixed(2)}\n`;
      response += `Grand Total: ₱${grandTotal.toFixed(2)}`;
      
      if (input.includes('receipt')) {
        response += `\n\n🧾 Would you like me to generate a full receipt? Just say "generate receipt" or "show receipt"!`;
      }
      
      return response;
    }
    
    // Generate receipt
    if (input.includes('receipt') || input.includes('generate') || input.includes('print')) {
      if (cart.length === 0) {
        return "Your cart is empty. Add some products first to generate a receipt.";
      }
      
      const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      const tax = subtotal * APP_CONFIG.taxRate;
      const grandTotal = subtotal + tax;
      
      const receiptId = 'REP-' + Date.now().toString(36).toUpperCase();
      const date = new Date().toLocaleString('en-PH');
      
      let receipt = `🧾 RECEIPT\n`;
      receipt += `━━━━━━━━━━━━━━━━━━━━\n`;
      receipt += `Receipt #: ${receiptId}\n`;
      receipt += `Date: ${date}\n`;
      receipt += `━━━━━━━━━━━━━━━━━━━━\n\n`;
      receipt += `ITEMS:\n`;
      cart.forEach(item => {
        const itemTotal = item.product.price * item.quantity;
        receipt += `${item.product.name}\n`;
        receipt += `  ${item.quantity} x ₱${item.product.price.toFixed(2)} = ₱${itemTotal.toFixed(2)}\n`;
      });
      receipt += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      receipt += `Subtotal: ₱${subtotal.toFixed(2)}\n`;
      receipt += `Tax (12%): ₱${tax.toFixed(2)}\n`;
      receipt += `TOTAL: ₱${grandTotal.toFixed(2)}\n`;
      receipt += `━━━━━━━━━━━━━━━━━━━━\n\n`;
      receipt += `*Thank you for your purchase!*`;
      
      return receipt;
    }
    
    // Product inquiries
    if (input.includes('product') || input.includes('item') || input.includes('stock') || input.includes('price')) {
      // Find specific product
      const productName = products.find(p => input.includes(p.name.toLowerCase()));
      if (productName) {
        const category = categories.find(c => c.id === productName.categoryId);
        return `📦 Product Details:\n\nName: ${productName.name}\nSKU: ${productName.sku}\nPrice: ₱${productName.price.toFixed(2)}\nStock: ${productName.stock} units\nCategory: ${category?.name || 'Uncategorized'}\n${productName.description ? `Description: ${productName.description}` : ''}\n${productName.stock <= productName.minStock ? '\n⚠️ Warning: Stock is below minimum level!' : ''}`;
      }
      
      // List all products
      let response = `📦 Available Products (${products.length}):\n\n`;
      products.filter(p => p.stock > 0).forEach(p => {
        const category = categories.find(c => c.id === p.categoryId);
        response += `• ${p.name} - ₱${p.price.toFixed(2)} (Stock: ${p.stock}) [${category?.name}]\n`;
      });
      response += `\nAsk about a specific product for more details!`;
      return response;
    }
    
    // Category inquiries
    if (input.includes('categories') || input.includes('category list')) {
      let response = `📂 Categories:\n\n`;
      categories.forEach(c => {
        const productCount = products.filter(p => p.categoryId === c.id).length;
        response += `• ${c.name} - ${productCount} products\n`;
      });
      return response;
    }
    
    // Sales/History
    if (input.includes('sale') || input.includes('transaction') || input.includes('history') || input.includes('today')) {
      const today = new Date().toDateString();
      const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === today);
      const todayTotal = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
      
      let response = `💰 Sales Information:\n\n`;
      response += `Total Sales Today: ₱${todayTotal.toFixed(2)}\n`;
      response += `Transactions Today: ${todaySales.length}\n`;
      response += `All Time Sales: ₱${sales.reduce((sum, s) => sum + s.grandTotal, 0).toFixed(2)}\n`;
      
      if (todaySales.length > 0) {
        response += `\nRecent Transactions:\n`;
        todaySales.slice(0, 5).forEach((s, i) => {
          response += `${i + 1}. ₱${s.grandTotal.toFixed(2)} - ${new Date(s.createdAt).toLocaleTimeString('en-PH')}\n`;
        });
      }
      
      return response;
    }
    
    // Cart info
    if (input.includes('cart') || input.includes('basket')) {
      if (cart.length === 0) {
        return "Your cart is empty. Click on products in the grid to add them to your cart.";
      }
      
      let response = `🛒 Cart Contents:\n\n`;
      cart.forEach(item => {
        response += `• ${item.product.name} x${item.quantity} = ₱${(item.product.price * item.quantity).toFixed(2)}\n`;
      });
      response += `\nSay "show total" or "compute total" to see the final amount!`;
      
      return response;
    }
    
    // Help
    if (input.includes('help') || input.includes('how') || input.includes('what can')) {
      return `❓ POS System Help:\n\n
Adding Products:
• Click on a product card to add it to the cart
• Use the +/- buttons to adjust quantity
• Say "add 2 apples" to have me add it for you

Checkout:
• Select payment method (Cash, Card, GCash)
• For cash, enter amount received
• Click "Complete Sale" to process

AI Assistant Commands:
• "show products" - List all products
• "add [item]" - Add item to cart
• "clear cart" - Empty the cart
• "compute total" - Calculate cart total
• "generate receipt" - Create receipt
• "show sales" - View sales history
• "show categories" - List categories

Other Features:
• Search products using the search bar
• Filter by category using the pills
• Apply discounts before checkout`;
    }
    
    // Inventory status
    if (input.includes('inventory') || input.includes('low stock') || input.includes('out of stock')) {
      const lowStock = products.filter(p => p.stock <= p.minStock);
      const outOfStock = products.filter(p => p.stock === 0);
      
      let response = `📊 Inventory Status:\n\n`;
      response += `Total Products: ${products.length}\n`;
      response += `In Stock: ${products.filter(p => p.stock > 0).length}\n`;
      response += `Low Stock: ${lowStock.length}\n`;
      response += `Out of Stock: ${outOfStock.length}\n`;
      
      if (lowStock.length > 0) {
        response += `\n⚠️ Low Stock Items:\n`;
        lowStock.forEach(p => {
          response += `• ${p.name}: ${p.stock} left (min: ${p.minStock})\n`;
        });
      }
      
      return response;
    }
    
    // Default response
    return `I understand you're asking about: "${userInput}"\n\nI'm not sure about that, but here are things I can help with:\n\n• Actions - Ask "add 2 apples" or "clear cart"\n• Products - Ask "show products" or "what items do you have"\n• Cart - Ask "show cart" or "what's in my basket"\n• Total - Ask "what's the total" or "compute total"\n• Receipt - Ask "generate receipt" or "show receipt"\n• Sales - Ask "show sales" or "how much did we sell today"\n• Help - Ask "help" for more commands\n\nHow can I assist you?`;
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
