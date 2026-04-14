'use client';

import { Target, Plus, Bell, Sparkles } from 'lucide-react';
import { holdings, userGoals } from '@/data/mockData';
import AIAdvisor from '@/components/AIAdvisor';
import { useState } from 'react';

export default function AdvisorPage() {
  const [showAddGoal, setShowAddGoal] = useState(false);

  const activeGoals = userGoals.filter((g) => g.status === 'active');

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Advisor</h1>
          <p className="text-[#6B7280]">Your personal financial assistant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIAdvisor />
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Your Goals</h3>
              <button
                onClick={() => setShowAddGoal(!showAddGoal)}
                className="flex items-center gap-2 px-3 py-2 bg-[#00BFFF] hover:bg-[#00A8E8] rounded-xl text-white text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </button>
            </div>

            {activeGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
                <p className="text-[#6B7280] text-sm">No active goals yet</p>
                <p className="text-[#6B7280] text-xs">Set your first investment goal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 bg-[#12121A] rounded-xl border border-[#1F1F2E]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{goal.ticker}</span>
                      <span className="text-xs text-[#00BFFF] px-2 py-1 bg-[#00BFFF]/10 rounded-lg">
                        {goal.goalType.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {goal.targetShares} shares at ${goal.targetPrice}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Price Alerts</h3>
            <div className="space-y-3">
              {holdings.slice(0, 4).map((holding) => (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-3 bg-[#12121A] rounded-xl"
                >
                  <span className="text-sm font-semibold text-white">{holding.ticker}</span>
                  <span className="text-xs text-[#6B7280] font-mono">
                    ${holding.currentPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-[#00BFFF]/10 to-[#006699]/10">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-[#00BFFF]" />
              <h3 className="text-lg font-semibold text-white">Pro Tip</h3>
            </div>
            <p className="text-sm text-[#9CA3AF]">
              Diversify your portfolio across different sectors to reduce risk. Your tech allocation is currently at 45%, consider adding healthcare or consumer staples.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
