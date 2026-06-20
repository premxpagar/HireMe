import React from 'react';
import { 
  Sparkles, CheckCircle2, Play, RefreshCw 
} from 'lucide-react';

interface DemoWizardProps {
  currentStep: number;
  setStep: (step: number) => void;
  runNextDemoStep: () => void;
  resetDemo: () => void;
  currentView: string;
}

export const DemoWizard: React.FC<DemoWizardProps> = ({
  currentStep,
  runNextDemoStep,
  resetDemo,
  currentView
}) => {
  // If the user is on the login screen, don't show the wizard
  if (currentView === 'login') return null;

  const steps = [
    { number: 1, name: 'Post Job', description: 'Deploy escrow' },
    { number: 2, name: 'AI Matching', description: 'Nugen matches agents' },
    { number: 3, name: 'Submit Work', description: 'Agent uploads output' },
    { number: 4, name: 'Verify & Pay', description: 'Monad release & Reputation' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '900px',
      padding: '16px 24px',
      background: 'rgba(28, 25, 36, 0.9)',
      border: '1px solid rgba(232, 90, 36, 0.4)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 16px rgba(232, 90, 36, 0.15)',
      borderRadius: '20px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      backdropFilter: 'blur(12px)',
      color: 'white'
    }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
        <div style={{
          background: 'var(--primary)',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse-soft 2s infinite'
        }}>
          <Sparkles size={14} color="white" />
        </div>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', color: 'var(--primary)' }}>
            Monad Blitz
          </span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>Demo Flow</span>
        </div>
      </div>

      {/* Steps Visualizer */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', maxWidth: '560px' }}>
        {steps.map((s, idx) => {
          const isCompleted = currentStep > s.number;
          const isActive = currentStep === s.number;

          return (
            <React.Fragment key={s.number}>
              {idx > 0 && (
                <div style={{
                  height: '2px',
                  flex: 1,
                  background: isCompleted ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                  margin: '0 8px',
                  minWidth: '15px'
                }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: isCompleted 
                    ? 'var(--primary)' 
                    : isActive 
                      ? 'rgba(232, 90, 36, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  color: isCompleted || isActive ? 'white' : '#A6A0AF',
                  border: isActive 
                    ? '2px solid var(--primary)' 
                    : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {isCompleted ? <CheckCircle2 size={14} /> : s.number}
                </div>
                <div style={{ display: 'none', md: 'block' } as any}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: isActive || isCompleted ? 700 : 500,
                    color: isActive ? 'var(--primary)' : isCompleted ? 'white' : '#A6A0AF' 
                  }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '9px', opacity: 0.5, whiteSpace: 'nowrap' }}>{s.description}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={resetDemo}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#A6A0AF',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Reset Demo Loop"
          className="hover-bright"
        >
          <RefreshCw size={14} />
        </button>

        <button
          onClick={runNextDemoStep}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(232, 90, 36, 0.3)',
            transition: 'all 0.2s'
          }}
          className="hover-bright"
        >
          {currentStep === 4 ? (
            <>
              <span>Complete</span>
              <CheckCircle2 size={14} />
            </>
          ) : (
            <>
              <span>Next Step</span>
              <Play size={10} fill="white" />
            </>
          )}
        </button>
      </div>
      
      {/* Styles for inline hover effects */}
      <style>{`
        .hover-bright:hover {
          filter: brightness(1.2);
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};
