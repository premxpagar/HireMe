import React, { useState } from 'react';
import { 
  Wallet, Cpu, Users, Award, Terminal, 
  Settings, PlusCircle, Network, Sun, Moon, Check, Key
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

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
  clerkKey: string;
  setClerkKey: (key: string) => void;
  supabaseUrl: string;
  setSupabaseUrl: (url: string) => void;
  supabaseAnonKey: string;
  setSupabaseAnonKey: (key: string) => void;
  supabaseUser: any;
  handleLogout: () => void;
}

interface InnerNavbarProps extends NavbarProps {
  onOpenSettings: () => void;
}

// Inner Clerk-specific navbar
const ClerkNavbarContent: React.FC<InnerNavbarProps> = ({
  currentView,
  setView,
  darkMode,
  setDarkMode,
  walletConnected,
  connectWallet,
  walletAddress,
  walletBalance,
  onOpenSettings,
  supabaseUser,
  handleLogout
}) => {
  const { isSignedIn, user } = useUser();

  const navItems = [
    { id: 'landing', label: 'Home', icon: Cpu },
    { id: 'marketplace', label: 'Gazette Jobs', icon: Users },
    { id: 'create-job', label: 'Post Dispatch', icon: PlusCircle },
    { id: 'leaderboard', label: 'Roll of Honor', icon: Award },
    { id: 'network', label: 'Agent Mesh', icon: Network },
    { id: 'explorer', label: 'Ledger Chronicle', icon: Terminal },
  ];

  return (
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {currentView !== 'login' && (
          <>
            {/* Supabase User details if active */}
            {supabaseUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {supabaseUser.user_metadata?.avatar_url && (
                  <div style={{ border: 'var(--border-thin)', padding: '2px', display: 'flex', alignItems: 'center', width: '32px', height: '32px', overflow: 'hidden' }}>
                    <img src={supabaseUser.user_metadata.avatar_url} alt="Google Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  {supabaseUser.email?.split('@')[0]}
                </span>
              </div>
            )}

            {/* Clerk User details if active */}
            {isSignedIn && user && (
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', border: 'var(--border-thin)', padding: '6px 10px', background: 'transparent' }}>
                {user.firstName || user.primaryEmailAddress?.emailAddress.split('@')[0]}
              </span>
            )}
          </>
        )}

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

        <button
          onClick={onOpenSettings}
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

        {currentView !== 'login' && isSignedIn && (
          <div style={{ border: 'var(--border-thin)', padding: '2px', display: 'flex', alignItems: 'center' }}>
            <UserButton />
          </div>
        )}

        {currentView !== 'login' && (supabaseUser || isSignedIn) && (
          <button
            onClick={handleLogout}
            className="news-button-outline"
            style={{ padding: '8px 14px', fontSize: '11px', height: '36px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', textTransform: 'uppercase' }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

// Inner Mock navbar (used when Clerk is not configured)
const MockNavbarContent: React.FC<InnerNavbarProps> = ({
  currentView,
  setView,
  darkMode,
  setDarkMode,
  walletConnected,
  connectWallet,
  walletAddress,
  walletBalance,
  onOpenSettings,
  supabaseUser,
  handleLogout
}) => {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Cpu },
    { id: 'marketplace', label: 'Gazette Jobs', icon: Users },
    { id: 'create-job', label: 'Post Dispatch', icon: PlusCircle },
    { id: 'leaderboard', label: 'Roll of Honor', icon: Award },
    { id: 'network', label: 'Agent Mesh', icon: Network },
    { id: 'explorer', label: 'Ledger Chronicle', icon: Terminal },
  ];

  return (
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {currentView !== 'login' && supabaseUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {supabaseUser.user_metadata?.avatar_url && (
              <div style={{ border: 'var(--border-thin)', padding: '2px', display: 'flex', alignItems: 'center', width: '32px', height: '32px', overflow: 'hidden' }}>
                <img src={supabaseUser.user_metadata.avatar_url} alt="Google Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              {supabaseUser.email?.split('@')[0]}
            </span>
          </div>
        )}

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

        <button
          onClick={onOpenSettings}
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

        {currentView !== 'login' && supabaseUser && (
          <button
            onClick={handleLogout}
            className="news-button-outline"
            style={{ padding: '8px 14px', fontSize: '11px', height: '36px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', textTransform: 'uppercase' }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

// Parent wrapper managing modal and keys
export const Navbar: React.FC<NavbarProps> = (props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempNugenKey, setTempNugenKey] = useState(props.nugenKey);
  const [tempClerkKey, setTempClerkKey] = useState(props.clerkKey);
  const [tempSupabaseUrl, setTempSupabaseUrl] = useState(props.supabaseUrl);
  const [tempSupabaseAnonKey, setTempSupabaseAnonKey] = useState(props.supabaseAnonKey);

  const handleSaveKeys = () => {
    props.setNugenKey(tempNugenKey);
    props.setClerkKey(tempClerkKey);
    props.setSupabaseUrl(tempSupabaseUrl);
    props.setSupabaseAnonKey(tempSupabaseAnonKey);
    setShowSettings(false);
  };

  const navContentProps = {
    ...props,
    onOpenSettings: () => setShowSettings(true)
  };

  return (
    <>
      {props.clerkKey ? (
        <ClerkNavbarContent {...navContentProps} />
      ) : (
        <MockNavbarContent {...navContentProps} />
      )}

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
            maxWidth: '520px',
            padding: '32px',
            background: 'var(--bg-paper)',
            textAlign: 'left',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Key size={18} />
              <h2 style={{ fontSize: '18px', margin: 0, textTransform: 'uppercase' }}>Credentials Desk</h2>
            </div>
            
            <p style={{ fontSize: '12px', marginBottom: '16px', fontFamily: 'var(--font-serif)' }}>
              Configure your integration credentials below to authorize real-world API actions.
            </p>

            {/* Nugen API Section */}
            <div style={{ marginBottom: '16px', borderBottom: 'var(--border-thin)', paddingBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Nugen Bearer Token
              </label>
              <input
                type="password"
                placeholder={props.nugenKey ? "••••••••••••••••" : "INPUT KEY..."}
                value={tempNugenKey}
                onChange={(e) => setTempNugenKey(e.target.value)}
                className="news-input"
              />
              <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginTop: '4px' }}>
                Used for live recruiter matching and evaluation audits.
              </span>
            </div>

            {/* Clerk Section */}
            <div style={{ marginBottom: '16px', borderBottom: 'var(--border-thin)', paddingBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Clerk Publishable Key
              </label>
              <input
                type="password"
                placeholder={props.clerkKey ? "••••••••••••••••" : "pk_test_..."}
                value={tempClerkKey}
                onChange={(e) => setTempClerkKey(e.target.value)}
                className="news-input"
              />
              <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginTop: '4px' }}>
                Used for Clerk User Authentication. If left blank, defaults to local guest flow.
              </span>
            </div>

            {/* Supabase Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={tempSupabaseUrl}
                onChange={(e) => setTempSupabaseUrl(e.target.value)}
                className="news-input"
                style={{ marginBottom: '12px' }}
              />
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Supabase Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOi..."
                value={tempSupabaseAnonKey}
                onChange={(e) => setTempSupabaseAnonKey(e.target.value)}
                className="news-input"
              />
              <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginTop: '4px' }}>
                Used for Supabase Google OAuth and profile synchronization.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSettings(false)}
                className="news-button-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKeys}
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
