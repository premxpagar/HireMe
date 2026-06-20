import React from 'react';
import { 
  Sparkles, Play, RefreshCw 
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
  if (currentView === 'login') return null;

  const steps = [
    { number: 1, name: '1. POST DISPATCH', description: 'Escrow Lock' },
    { number: 2, name: '2. MATCH ENGINE', description: 'Scan Agents' },
    { number: 3, name: '3. FILE WORK', description: 'Agent Upload' },
    { number: 4, name: '4. AUDIT & DISBURSE', description: 'Release MON' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '95%',
      maxWidth: '960px',
      padding: '12px 20px',
      background: 'var(--bg-paper)',
      border: 'var(--border-thick)',
      boxShadow: '8px 8px 0px #000000',
      borderRadius: '0px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      color: 'var(--text-dark)'
    }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: 'var(--border-thin)', paddingRight: '16px' }}>
        <div style={{
          background: 'var(--text-dark)',
          color: 'var(--bg-paper)',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Sparkles size={12} />
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'block' }}>
            DAILY FLOW
          </span>
          <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>CHRONICLE SIM</span>
        </div>
      </div>

      {/* Steps Visualizer */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', maxWidth: '580px' }}>
        {steps.map((s, idx) => {
          const isCompleted = currentStep > s.number;
          const isActive = currentStep === s.number;

          return (
            <React.Fragment key={s.number}>
              {idx > 0 && (
                <div style={{
                  height: '1px',
                  flex: 1,
                  background: 'var(--text-dark)',
                  margin: '0 8px',
                  borderTop: '1px dashed var(--text-dark)',
                  minWidth: '10px'
                }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  color: (isActive || isCompleted) ? 'var(--text-dark)' : 'var(--text-muted)'
                }}>
                  {isActive ? '● ' : isCompleted ? '☑ ' : '☐ '}
                  {s.name}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: 'var(--border-thin)', paddingLeft: '16px' }}>
        <button
          onClick={resetDemo}
          className="news-button-outline"
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Reset Flow"
        >
          <RefreshCw size={12} />
        </button>

        <button
          onClick={runNextDemoStep}
          className="news-button"
          style={{
            padding: '8px 14px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {currentStep === 4 ? (
            <span>FINISH</span>
          ) : (
            <>
              <span>NEXT</span>
              <Play size={8} fill="currentColor" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
