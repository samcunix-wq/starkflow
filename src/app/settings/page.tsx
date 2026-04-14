'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isConfigured, supabase } from '@/lib/supabase';
import { User, Lock, Bell, Shield, Trash2, AlertTriangle, Check, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tradeNotifications, setTradeNotifications] = useState(true);
  const [dividendNotifications, setDividendNotifications] = useState(true);

  useEffect(() => {
    if (user && isConfigured && supabase) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user || !supabase) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setDisplayName(data.display_name || user.email?.split('@')[0] || '');
      setOriginalName(data.display_name || user.email?.split('@')[0] || '');
    } else {
      setDisplayName(user.email?.split('@')[0] || '');
      setOriginalName(user.email?.split('@')[0] || '');
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !supabase) {
      setError('Not logged in');
      return;
    }
    
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        display_name: displayName,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      setError('Failed to save: ' + error.message);
    } else {
      setSuccess('Profile updated successfully!');
      setOriginalName(displayName);
      localStorage.setItem('user_display_name', displayName);
    }
    
    setLoading(false);
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    if (!isConfigured || !supabase) {
      setError('Database not configured');
      return;
    }
    
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password updated successfully!');
    }
    
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setError('Account deletion is not available yet.');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  if (!isConfigured) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        <div className="card p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Database Not Connected</h2>
          <p className="text-[#6B7280]">
            Please configure Supabase to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        {user && (
          <div className="text-sm text-[#6B7280]">
            Signed in as <span className="text-white">{user.email}</span>
          </div>
        )}
      </div>

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

                <div>
                  <label className="text-sm text-[#9CA3AF] mb-2 block">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-[#12121A]/50 border border-[#1F1F2E] rounded-xl px-4 py-3 text-[#6B7280] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#6B7280] mt-2">Email cannot be changed</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading || displayName === originalName}
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
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
                const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                
                if (newPassword !== confirmPassword) {
                  setError('New passwords do not match');
                  return;
                }
                if (newPassword.length < 6) {
                  setError('Password must be at least 6 characters');
                  return;
                }
                handleUpdatePassword(currentPassword, newPassword);
                form.reset();
              }} className="space-y-6">
                <div>
                  <label className="text-sm text-[#9CA3AF] mb-2 block">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#9CA3AF] mb-2 block">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full bg-[#12121A] border border-[#1F1F2E] rounded-xl px-4 py-3 text-white"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 px-6 bg-[#00BFFF] hover:bg-[#00A8E8] disabled:bg-[#1F1F2E] text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-[#1F1F2E]">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-[#6B7280]">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      emailNotifications ? 'bg-[#10B981]' : 'bg-[#1F1F2E]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-[#1F1F2E]">
                  <div>
                    <p className="text-white font-medium">Trade Alerts</p>
                    <p className="text-sm text-[#6B7280]">Get notified about buy/sell executions</p>
                  </div>
                  <button
                    onClick={() => setTradeNotifications(!tradeNotifications)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      tradeNotifications ? 'bg-[#10B981]' : 'bg-[#1F1F2E]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      tradeNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-white font-medium">Dividend Alerts</p>
                    <p className="text-sm text-[#6B7280]">Ex-dividend and dividend payment notifications</p>
                  </div>
                  <button
                    onClick={() => setDividendNotifications(!dividendNotifications)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      dividendNotifications ? 'bg-[#10B981]' : 'bg-[#1F1F2E]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      dividendNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444] mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Delete Account</p>
                      <p className="text-sm text-[#6B7280] mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="mt-4 py-2 px-4 bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
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
