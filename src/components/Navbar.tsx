import React, { useState } from 'react';
import { 
  Wallet, Cpu, Users, Award, Terminal, 
  Settings, PlusCircle, Network, Sun, Moon, Sparkles, Check, Key
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  walletConnected: boolean;
  connectWallet: () => void;
  walletAddress: string;
  walletBalance: number;
  nugenKey: string;
  setNugenKey: (key: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setView,
  darkMode,
  setDarkMode,
  walletConnected,
  connectWallet,
  walletAddress,
  walletBalance,
  nugenKey,
  setNugenKey
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(nugenKey);

  const handleSaveKey = () => {
    setNugenKey(tempKey);
    setShowSettings(false);
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: Cpu },
    { id: 'marketplace', label: 'Marketplace', icon: Users },
    { id: 'create-job', label: 'Post Job', icon: PlusCircle },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'network', label: 'Agent Network', icon: Network },
    { id: 'explorer', label: 'Monad Explorer', icon: Terminal },
  ];

  return (
    <>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-light)',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all 0.3s'
      }} className="navbar-container">
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{
            background: 'var(--primary)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(232, 90, 36, 0.3)',
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>HireMe</span>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7 }}>Monad network</span>
          </div>
        </div>

        {/* Navigation Items */}
        {currentView !== 'login' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || 
                (item.id === 'marketplace' && (currentView === 'profile' || currentView === 'reputation')) ||
                (item.id === 'create-job' && (currentView === 'matching' || currentView === 'escrow' || currentView === 'submission' || currentView === 'evaluation'));
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'inherit',
                  }}
                  className="nav-btn"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions (Wallet, Dark Mode, Settings) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'inherit'
            }}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Nugen API Settings */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'inherit'
            }}
            title="Nugen Platform Settings"
          >
            <Settings size={18} />
          </button>

          {/* Monad Wallet Button */}
          {currentView !== 'login' && (
            <button
              onClick={connectWallet}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: walletConnected ? 'transparent' : 'var(--primary)',
                color: walletConnected ? 'inherit' : 'white',
                border: walletConnected ? '1px solid var(--border-light)' : 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                boxShadow: walletConnected ? 'none' : '0 4px 12px rgba(232, 90, 36, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              <Wallet size={16} />
              <span>
                {walletConnected 
                  ? `${walletBalance.toFixed(1)} MON (${walletAddress.substring(0, 6)}...${walletAddress.substring(38)})`
                  : 'Connect Wallet'
                }
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-container" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '32px',
            background: darkMode ? '#1C1924' : '#FFF9F3',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Key style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '20px', margin: 0 }}>Nugen Intelligence Keys</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Configure your Nugen API Key to run real agent matches, synthetic training cycles, or evaluation checks. If left blank, the app will run in high-fidelity mock/simulation mode.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nugen API Bearer Token
              </label>
              <input
                type="password"
                placeholder={nugenKey ? "••••••••••••••••••••••••••••" : "Paste Bearer Token here..."}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: darkMode ? '#282334' : 'white',
                  color: 'inherit',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                style={{
                  padding: '10px 20px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
