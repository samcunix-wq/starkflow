'use client';

import { useState } from 'react';
import { Bot, Send, Target, Bell, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { UserGoal } from '@/data/mockData';

interface GoalCardProps {
  goal: UserGoal;
}

function GoalCard({ goal }: GoalCardProps) {
  const getStatusIcon = () => {
    switch (goal.status) {
      case 'achieved':
        return <CheckCircle className="w-5 h-5 text-[#10B981]" />;
      case 'missed':
        return <AlertCircle className="w-5 h-5 text-[#EF4444]" />;
      default:
        return <Clock className="w-5 h-5 text-[#00BFFF]" />;
    }
  };

  const getStatusColor = () => {
    switch (goal.status) {
      case 'achieved':
        return 'bg-[#10B981]/10';
      case 'missed':
        return 'bg-[#EF4444]/10';
      default:
        return 'bg-[#00BFFF]/10';
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#00BFFF]" />
          <span className="text-xs text-[#6B7280] uppercase tracking-wider">Goal</span>
        </div>
        <div className={`p-2 rounded-lg ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
      </div>
      <p className="text-sm font-semibold text-white mb-1">
        {goal.goalType === 'buy' ? 'Buy' : 'Sell'} {goal.targetShares} shares of {goal.ticker}
      </p>
      <p className="text-xs text-[#6B7280]">Target: ${goal.targetPrice.toFixed(2)}/share</p>
    </div>
  );
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm your AI Financial Advisor, powered by Grok. I can help you with investment goals, position analysis, and portfolio recommendations. What would you like to discuss today?",
    timestamp: '2:30 PM',
  },
];

export default function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Based on your portfolio, I notice you have significant exposure to technology stocks (45%). Consider diversifying into other sectors to reduce risk. Your AAPL position is approaching your target price - would you like me to set a reminder?",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00BFFF] to-[#006699] flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Advisor</h3>
          <p className="text-xs text-[#6B7280]">Powered by Grok</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-3">Active Goals</p>
        <div className="space-y-2">
          <GoalCard goal={{ id: '1', ticker: 'AAPL', targetPrice: 300, targetShares: 100, goalType: 'buy', status: 'active' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[300px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-[#00BFFF] text-white' 
                : 'bg-[#12121A] text-[#9CA3AF]'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-[#6B7280]'}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#12121A] p-3 rounded-xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#00BFFF] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#00BFFF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-[#00BFFF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your portfolio..."
          className="flex-1 bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00BFFF] transition-colors"
        />
        <button
          onClick={handleSend}
          className="p-3 bg-[#00BFFF] hover:bg-[#00A8E8] rounded-xl transition-colors"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
