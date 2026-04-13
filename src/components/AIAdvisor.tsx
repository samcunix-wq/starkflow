'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Target, Bell, AlertCircle, CheckCircle, Clock, MessageSquare, StickyNote, X, ChevronDown, ChevronUp, Minimize2, ExternalLink, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
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
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('jarvis_notes', JSON.stringify(newNotes));
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const storedHoldings = localStorage.getItem('starkflow_holdings');
      const holdings = storedHoldings ? JSON.parse(storedHoldings) : [];
      const purchasingPower = parseFloat(localStorage.getItem('starkflow_purchasing_power') || '5000');
      const holdingsValue = holdings.reduce((sum: number, h: any) => sum + (h.shares * h.currentPrice), 0);

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userContext: {
            purchasingPower,
            holdingsValue,
            holdings
          }
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "I'm here to help with your portfolio. What would you like to know?",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble accessing my analysis capabilities right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }

    setIsTyping(false);
  };

  const handleConfirmTrade = () => {
    if (!pendingChange) return;

    if (pendingChange.type === 'buy') {
      const stored = localStorage.getItem('starkflow_holdings');
      const holdings = stored ? JSON.parse(stored) : [];
      const existing = holdings.find((h: any) => h.ticker === pendingChange.ticker);
      
      if (existing) {
        existing.shares += pendingChange.shares || 0;
        existing.avgCost = ((existing.shares * existing.avgCost) + ((pendingChange.shares || 0) * (pendingChange.price || 0))) / existing.shares;
      } else {
        holdings.push({
          id: Date.now().toString(),
          ticker: pendingChange.ticker,
          name: pendingChange.ticker,
          shares: pendingChange.shares || 0,
          avgCost: pendingChange.price || 0,
          currentPrice: pendingChange.price || 0,
          change: 0,
          changePercent: 0,
          totalValue: (pendingChange.shares || 0) * (pendingChange.price || 0),
          totalGain: 0,
          totalGainPercent: 0,
        });
      }
      
      localStorage.setItem('starkflow_holdings', JSON.stringify(holdings));
      window.dispatchEvent(new CustomEvent('portfolio-updated'));
      
      const costBasis = (pendingChange.shares || 0) * (pendingChange.price || 0);
      const currentPP = parseFloat(localStorage.getItem('starkflow_purchasing_power') || '5000');
      localStorage.setItem('starkflow_purchasing_power', JSON.stringify(currentPP - costBasis));
      window.dispatchEvent(new CustomEvent('portfolio-updated'));
    }

    const note: Note = {
      id: Date.now().toString(),
      type: pendingChange.type === 'buy' ? 'trade_reason' : 'memory',
      content: `${pendingChange.type === 'buy' ? 'Bought' : 'Sold'} ${pendingChange.shares || 'all'} ${pendingChange.ticker}: ${pendingChange.description}`,
      createdAt: new Date().toISOString(),
    };
    saveNotes([...notes, note]);

    const confirmationMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: `${pendingChange.type === 'buy' ? 'Buy' : 'Sell'} order confirmed! I've updated your portfolio and saved this as a note for future reference.`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, confirmationMessage]);
    setPendingChange(null);
  };

  const handleDismissTrade = () => {
    const dismissalMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: 'No problem! Your trade request has been cancelled. Feel free to ask me about other stocks or portfolio strategies.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, dismissalMessage]);
    setPendingChange(null);
  };

  const activeGoals = notes.filter(n => n.type === 'goal');

  if (!mounted) return null;

  return (
    <div className={`card h-full flex flex-col ${variant === 'modal' ? 'max-w-2xl mx-auto' : ''}`}>
      <div className="p-4 border-b border-[#1F1F2E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              JARVIS
              <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            </h3>
            <p className="text-xs text-[#6B7280]">AI Financial Advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg transition-colors ${showNotes ? 'bg-[#00BFFF]/20 text-[#00BFFF]' : 'text-[#6B7280] hover:text-white hover:bg-[#12121A]'}`}
          >
            <StickyNote className="w-4 h-4" />
          </button>
          {variant === 'modal' && onClose && (
            <button onClick={onClose} className="p-2 text-[#6B7280] hover:text-white hover:bg-[#12121A] rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showNotes && notesExpanded && (
        <div className="p-4 border-b border-[#1F1F2E] bg-[#0D0D12]/50">
          <button
            onClick={() => setNotesExpanded(false)}
            className="flex items-center gap-2 text-xs text-[#6B7280] hover:text-white w-full"
          >
            <ChevronUp className="w-3 h-3" /> Notes ({notes.length})
          </button>
          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-xs text-[#6B7280] text-center py-2">No notes yet</p>
            ) : (
              notes.slice(-5).reverse().map(note => (
                <div key={note.id} className="text-xs p-2 bg-[#12121A] rounded-lg">
                  <span className={`font-medium ${
                    note.type === 'goal' ? 'text-[#10B981]' :
                    note.type === 'trade_reason' ? 'text-[#00BFFF]' :
                    'text-[#6B7280]'
                  }`}>
                    {note.type === 'goal' ? '🎯' : note.type === 'trade_reason' ? '💰' : '📝'}
                  </span>
                  <span className="text-[#9CA3AF] ml-2">{note.content}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {!showNotes && activeGoals.length > 0 && (
        <div className="p-4 border-b border-[#1F1F2E] bg-[#0D0D12]/50">
          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">Active Goals</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeGoals.slice(-3).map(goal => (
              <div key={goal.id} className="flex-shrink-0 px-3 py-1.5 bg-[#12121A] rounded-lg border border-[#10B981]/20">
                <p className="text-xs text-white">{goal.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-[#00BFFF] text-white rounded-br-md' 
                : 'bg-[#12121A] text-[#E5E7EB] rounded-bl-md'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-[#00BFFF]" />
                  <span className="text-xs font-medium text-[#00BFFF]">JARVIS</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-[#6B7280]'}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#12121A] p-4 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-[#00BFFF]" />
                <span className="text-xs font-medium text-[#00BFFF]">JARVIS</span>
              </div>
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

      {pendingChange && (
        <div className="p-4 border-t border-[#1F1F2E] bg-[#1F1F2E]/50">
          <div className="bg-[#12121A] rounded-xl p-4">
            <p className="text-sm text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
              Confirm Trade Request
            </p>
            <p className="text-sm text-[#9CA3AF] mb-4">{pendingChange.description}</p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmTrade}
                className="flex-1 py-2 px-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={handleDismissTrade}
                className="flex-1 py-2 px-4 bg-[#1F1F2E] hover:bg-[#2F2F3E] text-[#9CA3AF] rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-[#1F1F2E]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about stocks, your portfolio, or investment strategies..."
            className="flex-1 bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF] transition-colors"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p-3 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#1F1F2E] disabled:text-[#6B7280] rounded-xl transition-colors"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
