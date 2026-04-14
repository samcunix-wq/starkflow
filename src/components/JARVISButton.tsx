'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import AIAdvisor from './AIAdvisor';

export default function JARVISButton() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#00BFFF] to-[#006699] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        title="Open JARVIS"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[360px] h-[550px] bg-[#0D0D12] border border-[#1F1F2E] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      <AIAdvisor variant="modal" onClose={() => setIsOpen(false)} />
    </div>
  );
}
