import React, { useState } from 'react';
import { 
  Wallet, Cpu, Users, Award, Terminal, 
  Settings, PlusCircle, Network, Sun, Moon, Check, Key
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
    { id: 'marketplace', label: 'Gazette Jobs', icon: Users },
    { id: 'create-job', label: 'Post Dispatch', icon: PlusCircle },
    { id: 'leaderboard', label: 'Roll of Honor', icon: Award },
    { id: 'network', label: 'Agent Mesh', icon: Network },
    { id: 'explorer', label: 'Ledger Chronicle', icon: Terminal },
  ];

  return (
    <>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: 'var(--border-double)',
        background: 'var(--bg-paper)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        
        {/* Newspaper Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{
            background: 'var(--text-dark)',
            color: 'var(--bg-paper)',
            padding: '4px 10px',
            border: 'var(--border-thin)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 'bold',
            fontSize: '24px',
            letterSpacing: '-1px'
          }}>
            H M
          </div>
          <div>
            <span style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              The HireMe Gazette
            </span>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>
              Monad Ledger Edition
            </span>
          </div>
        </div>

        {/* Nav Links */}
        {currentView !== 'login' && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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
                    padding: '8px 12px',
                    background: isActive ? 'var(--text-dark)' : 'transparent',
                    color: isActive ? 'var(--bg-paper)' : 'var(--text-dark)',
                    border: '1px solid transparent',
                    borderBottom: isActive ? 'var(--border-thin)' : 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                  }}
                >
                  <Icon size={13} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'transparent',
              border: 'var(--border-thin)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-dark)'
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'transparent',
              border: 'var(--border-thin)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-dark)'
            }}
          >
            <Settings size={16} />
          </button>

          {/* Wallet */}
          {currentView !== 'login' && (
            <button
              onClick={connectWallet}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'transparent',
                color: 'var(--text-dark)',
                border: 'var(--border-thin)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              <Wallet size={12} />
              <span>
                {walletConnected 
                  ? `${walletAddress.substring(0, 6)}... (${walletBalance.toFixed(1)} MON)`
                  : 'Connect Ledger'
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
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="news-panel-thick" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '32px',
            background: 'var(--bg-paper)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Key size={18} />
              <h2 style={{ fontSize: '18px', margin: 0, textTransform: 'uppercase' }}>Nugen Credentials</h2>
            </div>
            <p style={{ fontSize: '12px', marginBottom: '20px', fontFamily: 'var(--font-serif)' }}>
              Configure your Nugen API Key bearer token below. If left blank, the platform executes using local heuristic emulations.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Bearer Token
              </label>
              <input
                type="password"
                placeholder={nugenKey ? "••••••••••••••••" : "INPUT KEY..."}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="news-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSettings(false)}
                className="news-button-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="news-button"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={14} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
