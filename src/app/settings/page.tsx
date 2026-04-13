'use client';

import { useState } from 'react';
import { User, Lock, Bell, Shield, AlertTriangle, Check, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setLoading(true);
    setTimeout(() => {
      setSuccess('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSuccess(null);
                    setError(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#00BFFF]/10 text-[#00BFFF]'
                      : 'text-[#9CA3AF] hover:bg-[#12121A] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="md:col-span-3">
          {success && (
            <div className="mb-4 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-[#10B981] flex items-center gap-2">
              <Check className="w-5 h-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-[#EF4444]">
              {error}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-[#9CA3AF] mb-2 block">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                    placeholder="Your name"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="py-3 px-6 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#1F1F2E] disabled:text-[#6B7280] text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>
              <p className="text-[#6B7280]">Password change coming soon...</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
              <p className="text-[#6B7280]">Notification settings coming soon...</p>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Account Settings</h2>
              <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444] mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Delete Account</p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
