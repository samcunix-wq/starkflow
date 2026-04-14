'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Target, Bell, AlertCircle, CheckCircle, Clock, MessageSquare, StickyNote, X, ChevronDown, ChevronUp, Minimize2, ExternalLink } from 'lucide-react';
import { UserGoal } from '@/data/mockData';
import { usePortfolio } from '@/context/PortfolioContext';
import { useNotifications } from '@/context/NotificationContext';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolUsed?: string;
}

interface Note {
  id: string;
  type: 'goal' | 'preference' | 'trade_reason' | 'memory';
  content: string;
  createdAt: string;
}

interface PendingChange {
  type: string;
  ticker: string;
  shares?: number;
  price?: number;
  description: string;
  isSellingAll?: boolean;
}

const GREETING = {
  id: '1',
  role: 'assistant' as const,
  content: "Hello! I'm JARVIS, your AI financial advisor. I have access to your portfolio, can look up any stock, and help you with investment decisions.\n\nWhat would you like to discuss today?",
  timestamp: '',
};

interface AIAdvisorProps {
  variant?: 'full' | 'modal';
  onClose?: () => void;
}

export default function AIAdvisor({ variant = 'full', onClose }: AIAdvisorProps) {
  const { updatePurchasingPower, setPurchasingPower, purchasingPower } = usePortfolio();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const storedNotes = localStorage.getItem('jarvis_notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
    
    const storedHistory = localStorage.getItem('jarvis_conversation');
    if (storedHistory) {
      try {
        const savedMessages = JSON.parse(storedHistory);
        if (savedMessages.length > 0) {
          setMessages(savedMessages);
        }
      } catch (e) {
        console.error('Failed to parse conversation history:', e);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (mounted && messages.length > 1) {
      const messagesToSave = messages.filter(m => m.id !== '1');
      if (messagesToSave.length > 0) {
        localStorage.setItem('jarvis_conversation', JSON.stringify(messages));
      }
    }
  }, [messages, mounted]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await res.json();

      if (data.proposedChange && data.proposedChange.type) {
        setPendingChange({
          type: data.proposedChange.type,
          ticker: data.proposedChange.ticker,
          shares: data.proposedChange.shares,
          price: data.proposedChange.price,
          description: data.proposedChange.description || `Add ${data.proposedChange.shares || 1} shares of ${data.proposedChange.ticker}`,
          isSellingAll: data.proposedChange.isSellingAll,
        });
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm not sure how to help with that.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmChange = async () => {
    if (!pendingChange) return;
    
    setIsTyping(true);
    
    try {
      let currentPrice = pendingChange.price || 0;
      
      if (!currentPrice) {
        try {
          const priceRes = await fetch(`/api/stock?symbol=${pendingChange.ticker}`);
          const priceData = await priceRes.json();
          if (priceData.price) {
            currentPrice = priceData.price;
          }
        } catch (e) {
          console.error('Failed to fetch price:', e);
        }
      }
      
      const storedHoldings = localStorage.getItem('starkflow_holdings');
      const currentHoldings = storedHoldings ? JSON.parse(storedHoldings) : [];
      
      if (pendingChange.type === 'sell') {
        const existingIndex = currentHoldings.findIndex((h: any) => h.ticker === pendingChange.ticker);
        const existing = existingIndex >= 0 ? currentHoldings[existingIndex] : null;
        let sharesToSell = pendingChange.shares || 1;
        let salePrice = currentPrice || pendingChange.price || 0;
        
        if (existing) {
          salePrice = currentPrice || existing.currentPrice || pendingChange.price || 0;
          
          if (pendingChange.isSellingAll) {
            sharesToSell = existing.shares;
          }
          
          const remainingShares = existing.shares - sharesToSell;
          
          if (remainingShares <= 0) {
            currentHoldings.splice(existingIndex, 1);
          } else {
            currentHoldings[existingIndex] = {
              ...existing,
              shares: remainingShares,
              totalValue: remainingShares * (currentPrice || existing.currentPrice),
            };
          }
        }
        
        const saleProceeds = sharesToSell * salePrice;
        const costBasis = existing?.avgCost ? existing.avgCost * sharesToSell : 0;
        const pnl = saleProceeds - costBasis;
        updatePurchasingPower(saleProceeds);
        
        localStorage.setItem('starkflow_holdings', JSON.stringify(currentHoldings));
        window.dispatchEvent(new CustomEvent('portfolio-updated', { detail: { holdings: currentHoldings } }));
        
        addNotification({
          type: 'sale',
          title: 'JARVIS: Sold at Profit',
          message: `Sold ${sharesToSell} shares of ${pendingChange.ticker} at $${salePrice.toFixed(2)}/share for $${saleProceeds.toLocaleString()} (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} ${pnl >= 0 ? 'gain' : 'loss'})`,
          ticker: pendingChange.ticker,
          amount: saleProceeds,
        });
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ I've sold ${sharesToSell} shares of ${pendingChange.ticker} at $${salePrice.toFixed(2)}. Sale proceeds: $${saleProceeds.toFixed(2)} added to purchasing power.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
      } else {
        const newHolding = {
          id: Date.now().toString(),
          ticker: pendingChange.ticker,
          name: pendingChange.ticker,
          shares: pendingChange.shares || 1,
          avgCost: currentPrice || pendingChange.price || 0,
          currentPrice: currentPrice || pendingChange.price || 0,
          change: 0,
          changePercent: 0,
          totalValue: (pendingChange.shares || 1) * (currentPrice || pendingChange.price || 0),
          totalGain: 0,
          totalGainPercent: 0,
          peRatio: 0,
          dividendYield: 0,
          dividendRate: 0,
          exDivDate: '',
          dividendPaymentDate: '',
          dividendFrequency: 'quarterly',
          nextEarningsDate: '',
          sector: 'Unknown',
        };
        
        const existingIndex = currentHoldings.findIndex((h: any) => h.ticker === pendingChange.ticker);
        if (existingIndex >= 0) {
          const existing = currentHoldings[existingIndex];
          const totalShares = existing.shares + (pendingChange.shares || 1);
          const totalCost = (existing.shares * existing.avgCost) + ((pendingChange.shares || 1) * (currentPrice || pendingChange.price || 0));
          currentHoldings[existingIndex] = {
            ...existing,
            shares: totalShares,
            avgCost: totalCost / totalShares,
            currentPrice: currentPrice || existing.currentPrice,
            totalValue: totalShares * (currentPrice || existing.currentPrice),
          };
        } else {
          currentHoldings.push(newHolding);
        }
        
        const purchaseCost = (pendingChange.shares || 1) * (currentPrice || pendingChange.price || 0);
        updatePurchasingPower(-purchaseCost);
        
        localStorage.setItem('starkflow_holdings', JSON.stringify(currentHoldings));
        window.dispatchEvent(new CustomEvent('portfolio-updated', { detail: { holdings: currentHoldings } }));
        
        addNotification({
          type: 'purchase',
          title: 'JARVIS: Position Added',
          message: `Bought ${pendingChange.shares || 1} shares of ${pendingChange.ticker} at $${(currentPrice || pendingChange.price || 0).toFixed(2)}/share for $${purchaseCost.toLocaleString()}`,
          ticker: pendingChange.ticker,
          amount: purchaseCost,
        });
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ I've added ${pendingChange.shares || 1} shares of ${pendingChange.ticker} to your portfolio at $${(currentPrice || pendingChange.price || 0).toFixed(2)}. Your portfolio has been updated!`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Failed to update portfolio:', err);
    } finally {
      setPendingChange(null);
      setIsTyping(false);
    }
  };

  const handleDenyChange = () => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "No problem! I won't make any changes to your portfolio. Is there anything else I can help you with?",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, assistantMessage]);
    setPendingChange(null);
  };

  const isModal = variant === 'modal';

  return (
    <div className={`flex flex-col h-full ${isModal ? '' : 'card p-6 h-[600px]'}`}>
      <div className={`flex items-center shrink-0 ${isModal ? 'p-3 border-b border-[#1F1F2E]' : 'mb-4'}`}>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">JARVIS</span>
        </div>
        <div className="flex items-center gap-2">
          {!isModal && (
            <Link 
              href="/advisor"
              className="p-1.5 text-[#6B7280] hover:text-white rounded-lg hover:bg-[#1F1F2E]"
              title="Open full page"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:text-white rounded-lg hover:bg-[#1F1F2E]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {pendingChange && (
        <div className={`shrink-0 p-4 border-b border-[#1F1F2E] ${pendingChange.type === 'sell' ? 'bg-[#F59E0B]/10' : 'bg-[#10B981]/10'}`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${pendingChange.type === 'sell' ? 'bg-[#F59E0B]/20' : 'bg-[#10B981]/20'}`}>
              {pendingChange.type === 'sell' ? (
                <Target className="w-5 h-5 text-[#F59E0B]" />
              ) : (
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">
                {pendingChange.type === 'sell' ? 'Confirm Sale' : 'Confirm Purchase'}
              </p>
              <p className="text-[#9CA3AF] text-sm mt-1 truncate">
                {pendingChange.description}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleConfirmChange}
                  disabled={isTyping}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    pendingChange.type === 'sell'
                      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                      : 'bg-[#10B981] hover:bg-[#059669] text-white'
                  } disabled:opacity-50`}
                >
                  Confirm
                </button>
                <button
                  onClick={handleDenyChange}
                  className="px-4 py-2 bg-[#1F1F2E] hover:bg-[#2F2F3E] text-white rounded-lg font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto p-4 space-y-4`}>
        {messages.map((msg, idx) => (
          <div key={`${msg.id}-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center mr-2 flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-[#00BFFF] text-white rounded-br-sm'
                  : 'bg-[#12121A] text-[#9CA3AF] rounded-bl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.timestamp && (
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-[#6B7280]'}`}>
                  {msg.timestamp}
                </p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center mr-2">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#12121A] p-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#00BFFF] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#00BFFF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-[#00BFFF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`shrink-0 p-4 border-t border-[#1F1F2E] ${isModal ? '' : 'mt-auto'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSend()}
            placeholder="Ask about stocks, portfolios, or investment strategies..."
            disabled={isTyping}
            className="flex-1 bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="px-4 py-3 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#6B7280] disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
