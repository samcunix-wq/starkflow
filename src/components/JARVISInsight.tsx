'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, X, TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign } from 'lucide-react';

interface Insight {
  type: 'tip' | 'alert' | 'recommendation' | 'progress';
  title: string;
  content: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface JARVISInsightProps {
  page: 'portfolio' | 'stock' | 'dividends' | 'watchlist' | 'news';
  symbol?: string;
}

export default function JARVISInsight({ page, symbol }: JARVISInsightProps) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await fetch('/api/agent/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page, symbol }),
        });
        const data = await res.json();
        if (data.insight) {
          setInsight(data.insight);
        }
      } catch (err) {
        console.error('Failed to fetch insight:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!dismissed) {
      fetchInsight();
      const interval = setInterval(fetchInsight, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [page, symbol, dismissed]);

  if (dismissed || loading || !insight) return null;

  const getIcon = () => {
    switch (insight.type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />;
      case 'recommendation':
        return <TrendingUp className="w-5 h-5 text-[#10B981]" />;
      case 'progress':
        return <Target className="w-5 h-5 text-[#00BFFF]" />;
      default:
        return <Lightbulb className="w-5 h-5 text-[#00BFFF]" />;
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'alert':
        return 'bg-[#F59E0B]/10 border-[#F59E0B]/30';
      case 'recommendation':
        return 'bg-[#10B981]/10 border-[#10B981]/30';
      case 'progress':
        return 'bg-[#00BFFF]/10 border-[#00BFFF]/30';
      default:
        return 'bg-[#00BFFF]/10 border-[#00BFFF]/30';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getBgColor()} mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getIcon()}</div>
          <div>
            <p className="text-sm font-semibold text-white">{insight.title}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">{insight.content}</p>
            {insight.action && (
              <button
                onClick={insight.action.handler}
                className="mt-2 px-3 py-1.5 bg-[#00BFFF] hover:bg-[#00A8E8] text-white text-xs rounded-lg transition-colors"
              >
                {insight.action.label}
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#6B7280] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}