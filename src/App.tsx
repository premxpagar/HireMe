import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Star, Search, ArrowRight, Upload, CheckCircle2, 
  ChevronRight, Sparkles, PlusCircle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DemoWizard } from './components/DemoWizard';

// Define Interface Types
interface Transaction {
  hash: string;
  blockNumber: number;
  type: string;
  status: 'SUCCESS' | 'PENDING';
  gasUsed: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  skill: string;
  status: 'PENDING' | 'MATCHED' | 'ESCROW_LOCKED' | 'WORK_SUBMITTED' | 'COMPLETED';
  matchedAgent?: string;
  submissionOutput?: string;
  submissionGithub?: string;
}

interface Agent {
  name: string;
  avatar: string;
  category: 'Coding' | 'Research' | 'Marketing' | 'Design';
  trustScore: number;
  tasksCompleted: number;
  revenue: number;
  skills: string[];
  bio: string;
  reviews: { user: string; rating: number; text: string }[];
}

// Initial Agents Data
const INITIAL_AGENTS: Agent[] = [
  {
    name: 'Frontend Agent',
    avatar: '💻',
    category: 'Coding',
    trustScore: 94,
    tasksCompleted: 42,
    revenue: 120,
    skills: ['React', 'TypeScript', 'CSS', 'Vite'],
    bio: 'Builds premium React interfaces.',
    reviews: [
      { user: 'GrowthCorp.eth', rating: 5, text: 'Delivered an outstanding dashboard.' }
    ]
  },
  {
    name: 'Research Agent',
    avatar: '🔎',
    category: 'Research',
    trustScore: 91,
    tasksCompleted: 35,
    revenue: 95,
    skills: ['Deep Retrieval', 'Summarization', 'Market Analysis'],
    bio: 'Conducts deep data retrieval.',
    reviews: [
      { user: 'MonadBuilders', rating: 5, text: 'Fantastic competitor analysis.' }
    ]
  },
  {
    name: 'Fraud Detection Agent',
    avatar: '🛡️',
    category: 'Research',
    trustScore: 98,
    tasksCompleted: 88,
    revenue: 210,
    skills: ['Spam Analysis', 'Sybil Audits'],
    bio: 'Audits smart contract security.',
    reviews: [
      { user: 'HireMe Platform', rating: 5, text: 'Highly accurate transaction validation.' }
    ]
  },
  {
    name: 'Marketing Copy Agent',
    avatar: '✍️',
    category: 'Marketing',
    trustScore: 89,
    tasksCompleted: 24,
    revenue: 45,
    skills: ['Copywriting', 'SEO', 'Twitter Campaigns'],
    bio: 'Drafts developer-facing copy.',
    reviews: [
      { user: 'TokenLauncher', rating: 4, text: 'Good campaigns, fast turnaround.' }
    ]
  },
  {
    name: 'Designer Agent',
    avatar: '🎨',
    category: 'Design',
    trustScore: 96,
    tasksCompleted: 50,
    revenue: 180,
    skills: ['Figma to HTML', '3D Mascot Rendering'],
    bio: 'Renders custom SVG visual assets.',
    reviews: [
      { user: 'SaaSFounder', rating: 5, text: 'Stunning visual assets.' }
    ]
  }
];

export default function App() {
  const [currentView, setView] = useState<string>('login');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('0x4D1201...b8f10A');
  const [walletBalance, setWalletBalance] = useState<number>(150.0);
  const [nugenKey, setNugenKey] = useState<string>('nugen-9c49c53bbb388d51');

  // Dynamic states updated via Nugen API
  const [matchConfidence, setMatchConfidence] = useState<number>(96);
  const [matchReason, setMatchReason] = useState<string>('Nugen matched this agent based on functional requirements.');
  const [apiFeedbackMsg, setApiFeedbackMsg] = useState<string>('');
  const [evalScores, setEvalScores] = useState({ correctness: 92, security: 95, quality: 89, weighted: 91 });
  const [evalFeedback, setEvalFeedback] = useState('Nugen audited the submitted artifact and confirmed compliance with Monad ledger security parameters.');

  // Demo / Simulation Step Tracker
  const [demoStep, setDemoStep] = useState<number>(1);

  // Dynamic state databases
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-98a2',
      title: 'Build Responsive Landing Page',
      description: 'Needs a highly polished layout, 3D claymation illustrations, and a glassmorphic user signup card.',
      budget: 10,
      skill: 'React',
      status: 'COMPLETED',
      matchedAgent: 'Frontend Agent',
      submissionOutput: 'Completed premium Vite React application deployed at Vercel with responsive grids.',
      submissionGithub: 'https://github.com/monad-blitz/hireme-mascot-landing'
    }
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      hash: '0x2d1a3c79a4087e59f81a3028c2c10b784f18ba201e9d1a38f7e201bcfd10f229',
      blockNumber: 1204859,
      type: 'Escrow Deployment',
      status: 'SUCCESS',
      gasUsed: '45,210',
      from: '0x4D1201...b8f10A',
      to: '0xEscrowContract_98a2',
      value: '0.00 MON',
      timestamp: '1 hour ago'
    },
    {
      hash: '0x8f192bc710a30bcfd91a18bc01d10284f18ba59f81a79a408e592d1c79a40a87',
      blockNumber: 1204862,
      type: 'Lock Budget',
      status: 'SUCCESS',
      gasUsed: '21,080',
      from: '0x4D1201...b8f10A',
      to: '0xEscrowContract_98a2',
      value: '10.00 MON',
      timestamp: '58 mins ago'
    }
  ]);

  // Current active job being operated in demo loop
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'matching' | 'complete'>('idle');
  const [evaluationStatus, setEvaluationStatus] = useState<'idle' | 'evaluating' | 'complete'>('idle');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(INITIAL_AGENTS[0]);

  // Forms
  const [formTitle, setFormTitle] = useState('Create Monad Smart Contract Dashboard');
  const [formDesc, setFormDesc] = useState('Develop a frontend dashboard illustrating live events, escrow state locks, and gas metrics from Monad explorer APIs.');
  const [formBudget, setFormBudget] = useState(15);
  const [formSkill, setFormSkill] = useState('Coding');

  // Submit files
  const [submitOutput, setSubmitOutput] = useState('React Dashboard built with CSS Modules. Custom Web3Provider hooks tracking transactions. Tested with mock RPC end-points.');
  const [submitGithub, setSubmitGithub] = useState('https://github.com/monad-builders/dashboard-escrow');

  // Modal helpers
  const [explorerSearch, setExplorerSearch] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState<'All' | 'Coding' | 'Research' | 'Marketing' | 'Design'>('All');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');

  // Handle Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Helper to connect mock wallet
  const connectWallet = () => {
    if (!walletConnected) {
      setWalletConnected(true);
      setWalletAddress('0x4D1201' + Math.random().toString(16).substring(2, 8) + '...b8f10A');
      setWalletBalance(150.0);
    } else {
      setWalletConnected(false);
    }
  };

  // Add block to Ledger helper
  const addTransaction = (type: string, value: string, toAddress: string) => {
    const newTx: Transaction = {
      hash: '0x' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
      blockNumber: transactions[0] ? transactions[0].blockNumber + Math.floor(Math.random() * 3) + 1 : 1204863,
      type,
      status: 'SUCCESS',
      gasUsed: (15000 + Math.floor(Math.random() * 30000)).toLocaleString(),
      from: walletAddress,
      to: toAddress,
      value,
      timestamp: 'Just now'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // 4-Step Interactive Demo Manager
  // Local fallbacks when Nugen API key is invalid, CORS fails, or offline
  const runLocalMatchingFallback = (jobId: string) => {
    setTimeout(() => {
      setMatchingStatus('complete');
      let agentName = 'Frontend Agent';
      if (formSkill === 'Research') agentName = 'Research Agent';
      else if (formSkill === 'Marketing') agentName = 'Marketing Copy Agent';
      else if (formSkill === 'Design') agentName = 'Designer Agent';
      
      const agentObj = agents.find(a => a.name === agentName) || agents[0];
      setSelectedAgent(agentObj);
      setMatchConfidence(94 + Math.floor(Math.random() * 5));
      setMatchReason(`Local matched ${agentName} for Category ${formSkill} successfully.`);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'MATCHED', matchedAgent: agentName } : j));
    }, 2500);
  };

  const runLocalEvaluationFallback = () => {
    setTimeout(() => {
      setEvaluationStatus('complete');
      const mockWeighted = 90 + Math.floor(Math.random() * 8);
      const mockScores = {
        correctness: 90 + Math.floor(Math.random() * 8),
        security: 92 + Math.floor(Math.random() * 6),
        quality: 88 + Math.floor(Math.random() * 8),
        weighted: mockWeighted
      };
      setEvalScores(mockScores);
      setEvalFeedback('Local heuristic evaluation audit completed successfully. Artifact matched all contract specifications.');
      
      const agentName = selectedAgent ? selectedAgent.name : 'Frontend Agent';
      setJobs(prev => prev.map(j => j.id === activeJobId ? { ...j, status: 'COMPLETED' } : j));
      addTransaction('Payment Released', `${formBudget}.00 MON`, '0x' + agentName.replace(' ', '') + 'Wallet');
      
      setAgents(prev => prev.map(a => a.name === agentName ? {
        ...a,
        trustScore: Math.min(a.trustScore + (mockWeighted >= 92 ? 1 : 0), 99),
        tasksCompleted: a.tasksCompleted + 1,
        revenue: a.revenue + formBudget
      } : a));
    }, 3000);
  };

  // 4-Step Interactive Demo Manager
  const runNextDemoStep = () => {
    if (demoStep === 1) {
      // Advance from Post Job -> Matches Agent
      const newJob: Job = {
        id: 'job-' + Math.random().toString(36).substring(2, 6),
        title: formTitle,
        description: formDesc,
        budget: formBudget,
        skill: formSkill,
        status: 'PENDING'
      };
      setJobs(prev => [newJob, ...prev]);
      setActiveJobId(newJob.id);
      
      // Navigate to Matching View & Run matching animation
      setView('matching');
      setMatchingStatus('matching');
      
      // Call Nugen API for Matching
      if (nugenKey) {
        setApiFeedbackMsg('Connecting to Nugen API...');
        const promptMessages = [
          {
            role: "system",
            content: "You are a professional AI recruitment matcher. Analyze the job title and description and select the best candidate from this list: \n1. Frontend Agent (Coding, Trust: 94, Skills: React, TypeScript, CSSModules)\n2. Research Agent (Research, Trust: 91, Skills: Deep Retrieval, Summarization, Analytics)\n3. Fraud Detection Agent (Research, Trust: 98, Skills: Spam Analysis, Transaction Auditing)\n4. Marketing Copy Agent (Marketing, Trust: 89, Skills: SEO Copywriting, Social Campaigns)\n5. Designer Agent (Design, Trust: 96, Skills: Figma, 3D Rendering, SVGs)\n\nYou must return a JSON response matching exactly this format: \n{\n  \"selectedAgentName\": \"Agent Name\",\n  \"confidence\": 95,\n  \"reason\": \"Reason for match\"\n}"
          },
          {
            role: "user",
            content: `Job Title: ${formTitle}\nDescription: ${formDesc}`
          }
        ];

        fetch('https://api.nugen.in/api/v3/inference/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nugenKey}`
          },
          body: JSON.stringify({
            model: 'nugen-flash-instruct',
            messages: promptMessages,
            temperature: 0.1
          })
        })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          try {
            const rawContent = data.choices[0].message.content;
            const cleanContent = rawContent.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanContent);
            
            const matchedName = parsed.selectedAgentName || 'Frontend Agent';
            const conf = parsed.confidence || 95;
            const reas = parsed.reason || 'Nugen matched based on skill correlation.';
            
            setMatchConfidence(conf);
            setMatchReason(reas);
            setApiFeedbackMsg('Live API matching active.');
            
            const agentObj = agents.find(a => a.name.toLowerCase().includes(matchedName.toLowerCase())) || agents[0];
            setSelectedAgent(agentObj);
            
            setJobs(prev => prev.map(j => j.id === newJob.id ? { 
              ...j, 
              status: 'MATCHED', 
              matchedAgent: agentObj.name 
            } : j));
            setMatchingStatus('complete');
          } catch (e) {
            console.error("Failed to parse Nugen API matching response", e);
            throw new Error("Parsing error");
          }
        })
        .catch(err => {
          console.warn("Nugen API match failed, falling back to mock:", err);
          setApiFeedbackMsg('API Key set. Fallback to local matching emulation.');
          runLocalMatchingFallback(newJob.id);
        });
      } else {
        setApiFeedbackMsg('No API key. Running local matching emulation.');
        runLocalMatchingFallback(newJob.id);
      }

      setDemoStep(2);
    } else if (demoStep === 2) {
      // Advance from Matches Agent -> Submit Work
      // Lock Escrow first
      if (walletBalance < formBudget) {
        alert("Insufficient MON balance!");
        return;
      }
      setWalletBalance(prev => prev - formBudget);
      addTransaction('Escrow Deployment', '0.00 MON', '0xEscrowContract_' + activeJobId.split('-')[1]);
      addTransaction('Lock Budget', `${formBudget}.00 MON`, '0xEscrowContract_' + activeJobId.split('-')[1]);
      
      setJobs(prev => prev.map(j => j.id === activeJobId ? { ...j, status: 'ESCROW_LOCKED' } : j));
      
      // Navigate to Work Submission
      setView('submission');
      setDemoStep(3);
    } else if (demoStep === 3) {
      // Advance from Submit Work -> Verify & Pay
      setJobs(prev => prev.map(j => j.id === activeJobId ? { 
        ...j, 
        status: 'WORK_SUBMITTED',
        submissionOutput: submitOutput,
        submissionGithub: submitGithub
      } : j));

      // Navigate to AI Evaluation
      setView('evaluation');
      setEvaluationStatus('evaluating');

      // Call Nugen API for Evaluation
      if (nugenKey) {
        setApiFeedbackMsg('Connecting to Nugen API for Evaluation...');
        const promptMessages = [
          {
            role: "system",
            content: "You are Nugen Quality Evaluation Agent. Analyze the job details and the agent's work submission.\nEvaluate compliance and code quality.\nYou must return a JSON response matching exactly this format: \n{\n  \"correctnessScore\": 92,\n  \"securityScore\": 95,\n  \"qualityScore\": 89,\n  \"weightedQualityScore\": 91,\n  \"feedback\": \"Brief evaluation feedback...\",\n  \"status\": \"Approved\"\n}"
          },
          {
            role: "user",
            content: `Job Title: ${formTitle}\nDescription: ${formDesc}\nSubmission: ${submitOutput}\nGitHub: ${submitGithub}`
          }
        ];

        fetch('https://api.nugen.in/api/v3/inference/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nugenKey}`
          },
          body: JSON.stringify({
            model: 'nugen-flash-instruct',
            messages: promptMessages,
            temperature: 0.1
          })
        })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          try {
            const rawContent = data.choices[0].message.content;
            const cleanContent = rawContent.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanContent);
            
            const scores = {
              correctness: parsed.correctnessScore || 90,
              security: parsed.securityScore || 90,
              quality: parsed.qualityScore || 90,
              weighted: parsed.weightedQualityScore || 90
            };
            setEvalScores(scores);
            setEvalFeedback(parsed.feedback || 'Artifact compliance check completed.');
            setApiFeedbackMsg('Live API evaluation complete.');
            
            // Release funds & update reputation
            const agentName = selectedAgent ? selectedAgent.name : 'Frontend Agent';
            setJobs(prev => prev.map(j => j.id === activeJobId ? { ...j, status: 'COMPLETED' } : j));
            addTransaction('Payment Released', `${formBudget}.00 MON`, '0x' + agentName.replace(' ', '') + 'Wallet');
            
            setAgents(prev => prev.map(a => a.name === agentName ? {
              ...a,
              trustScore: Math.min(a.trustScore + (scores.weighted >= 92 ? 1 : 0), 99),
              tasksCompleted: a.tasksCompleted + 1,
              revenue: a.revenue + formBudget
            } : a));
            
            setEvaluationStatus('complete');
          } catch (e) {
            console.error("Failed to parse Nugen API evaluation response", e);
            throw new Error("Parsing error");
          }
        })
        .catch(err => {
          console.warn("Nugen API eval failed, falling back to mock:", err);
          setApiFeedbackMsg('API Key set. Fallback to local evaluation emulation.');
          runLocalEvaluationFallback();
        });
      } else {
        setApiFeedbackMsg('No API key. Running local evaluation emulation.');
        runLocalEvaluationFallback();
      }

      setDemoStep(4);
    } else if (demoStep === 4) {
      // Show dashboard
      setView('reputation');
    }
  };

  const resetDemo = () => {
    setDemoStep(1);
    setMatchingStatus('idle');
    setEvaluationStatus('idle');
    setFormTitle('Create Monad Smart Contract Dashboard');
    setFormDesc('Develop a frontend dashboard illustrating live events, escrow state locks, and gas metrics from Monad explorer APIs.');
    setFormBudget(15);
    setFormSkill('Coding');
    setView('marketplace');
  };

  // Canvas Network Graph for Page 12
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (currentView !== 'network' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 500);

    // Nodes definition
    const nodes = [
      { id: 1, label: 'User (You)', type: 'Human', x: width * 0.15, y: height * 0.5, radius: 26, color: '#aa3bff' },
      { id: 2, label: 'Recruiter Agent', type: 'Agent', x: width * 0.4, y: height * 0.5, radius: 24, color: '#E85A24' },
      { id: 3, label: 'Frontend Agent', type: 'Agent', x: width * 0.65, y: height * 0.3, radius: 22, color: '#00BA90' },
      { id: 4, label: 'QA Agent', type: 'Agent', x: width * 0.85, y: height * 0.4, radius: 20, color: '#00B4D8' },
      { id: 5, label: 'Research Agent', type: 'Agent', x: width * 0.65, y: height * 0.7, radius: 22, color: '#E5A900' }
    ];

    const edges = [
      { from: 1, to: 2, label: 'Hires recruiter', speed: 1 },
      { from: 2, to: 3, label: 'Spawns developer', speed: 1.5 },
      { from: 3, to: 4, label: 'Delegates testing', speed: 2 },
      { from: 2, to: 5, label: 'Spawns researcher', speed: 1.2 },
      { from: 5, to: 3, label: 'Feeds data', speed: 0.8 }
    ];

    let pulseTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      pulseTime += 0.05;

      // Draw Grid / Stars Background
      ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Edges
      edges.forEach((edge) => {
        const fromNode = nodes.find(n => n.id === edge.from)!;
        const toNode = nodes.find(n => n.id === edge.to)!;

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(232, 90, 36, 0.15)';
        ctx.lineWidth = 2;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        // Draw moving data packets
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const progress = ((pulseTime * edge.speed * 20) % distance) / distance;

        const packetX = fromNode.x + dx * progress;
        const packetY = fromNode.y + dy * progress;

        ctx.beginPath();
        ctx.arc(packetX, packetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#E85A24';
        ctx.shadowColor = '#E85A24';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw Nodes
      nodes.forEach((node) => {
        // Outer glowing ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4 + Math.sin(pulseTime) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = node.color + '33'; // transparent hex
        ctx.lineWidth = 3;
        ctx.stroke();

        // Fill node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = darkMode ? '#1C1924' : '#FFF9F3';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Label details
        ctx.fillStyle = darkMode ? '#FFF' : '#1E1A24';
        ctx.font = 'bold 12px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y - 2);

        ctx.fillStyle = '#A6A0AF';
        ctx.font = '9px Inter';
        ctx.fillText(node.type, node.x, node.y + 12);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [currentView, darkMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Top Navbar */}
      <Navbar 
        currentView={currentView}
        setView={setView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        walletConnected={walletConnected}
        connectWallet={connectWallet}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        nugenKey={nugenKey}
        setNugenKey={setNugenKey}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* VIEW 0: LOGIN PAGE (Exactly matches Figma structure) */}
        {currentView === 'login' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '85vh',
            width: '100%',
            padding: '20px'
          }}>
            {/* Outer blur wrapper - glass container */}
            <div className="glass-container" style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              maxWidth: '1020px',
              minHeight: '580px',
              borderRadius: '36px',
              padding: '36px',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 25px 60px rgba(232, 90, 36, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              background: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'visible'
            }}>
              
              {/* Left Side: Nested Login Card */}
              <div style={{
                width: '430px',
                padding: '40px',
                background: darkMode ? 'rgba(28, 25, 36, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                borderRadius: '24px',
                boxShadow: '0 12px 36px rgba(232, 90, 36, 0.04)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(255, 255, 255, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                zIndex: 10
              }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Your Logo
                </span>
                <h1 style={{ fontSize: '38px', fontWeight: 800, margin: '8px 0 24px', color: darkMode ? 'white' : 'var(--text-dark)' }}>
                  Login
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', opacity: 0.8 }}>Email</label>
                    <input 
                      type="text" 
                      placeholder="username@gmail.com" 
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid var(--border-light)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        background: darkMode ? '#282334' : 'white',
                        color: 'inherit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', opacity: 0.8 }}>Password</label>
                    <input 
                      type="password" 
                      placeholder="Password" 
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid var(--border-light)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        background: darkMode ? '#282334' : 'white',
                        color: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                  <a href="#forgot" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</a>
                </div>

                <button 
                  onClick={() => setView('landing')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(232, 90, 36, 0.3)',
                    transition: 'all 0.2s',
                    marginBottom: '20px'
                  }}
                  className="hover-bright"
                >
                  Sign in
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0 20px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Or Continue With</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                </div>

                {/* Social Login Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                  {['Google', 'GitHub', 'Facebook'].map((social) => (
                    <button 
                      key={social}
                      onClick={() => setView('landing')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: '1px solid var(--border-light)',
                        borderRadius: '12px',
                        background: darkMode ? '#282334' : 'white',
                        color: 'inherit',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      className="hover-bright"
                    >
                      {social === 'Google' && <span style={{ color: '#EA4335', fontWeight: 800 }}>G</span>}
                      {social === 'GitHub' && (
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                          <path d="M9 18c-4.51 2-5-2-7-2"></path>
                        </svg>
                      )}
                      {social === 'Facebook' && <span style={{ color: '#1877F2', fontWeight: 800 }}>f</span>}
                      <span>{social}</span>
                    </button>
                  ))}
                </div>

                <div style={{ textAlign: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Don't have an account yet? </span>
                  <a href="#register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Register for free</a>
                </div>
              </div>

              {/* Right Side: Transparent 3D Mascot Panel */}
              <div style={{
                flex: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'visible',
                padding: '20px',
                height: '100%'
              }}>
                {/* Floating Leaves Decoration */}
                <div className="animate-float" style={{ position: 'absolute', top: '15%', left: '10%', transform: 'rotate(-20deg)', animationDuration: '5s', opacity: 0.6 }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#a2b97c"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4C6.2 19 6 17.5 6 16c0-4.4 3.6-8 8-8 1.5 0 3 .4 4.3 1.1c.4-2.8-1.5-5.6-4.3-6.6-1.3-.5-2.7-.5-4 0z" /></svg>
                </div>
                <div className="animate-float" style={{ position: 'absolute', top: '8%', right: '15%', transform: 'rotate(35deg)', animationDuration: '6s', opacity: 0.7 }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#8cb369"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4C6.2 19 6 17.5 6 16c0-4.4 3.6-8 8-8 1.5 0 3 .4 4.3 1.1c.4-2.8-1.5-5.6-4.3-6.6-1.3-.5-2.7-.5-4 0z" /></svg>
                </div>
                <div className="animate-float" style={{ position: 'absolute', top: '50%', right: '5%', transform: 'rotate(15deg)', animationDuration: '4s', opacity: 0.8 }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="#a2b97c"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4C6.2 19 6 17.5 6 16c0-4.4 3.6-8 8-8 1.5 0 3 .4 4.3 1.1c.4-2.8-1.5-5.6-4.3-6.6-1.3-.5-2.7-.5-4 0z" /></svg>
                </div>
                <div className="animate-float" style={{ position: 'absolute', bottom: '15%', left: '15%', transform: 'rotate(-45deg)', animationDuration: '5.5s', opacity: 0.5 }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#8cb369"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4C6.2 19 6 17.5 6 16c0-4.4 3.6-8 8-8 1.5 0 3 .4 4.3 1.1c.4-2.8-1.5-5.6-4.3-6.6-1.3-.5-2.7-.5-4 0z" /></svg>
                </div>
                <div className="animate-float" style={{ position: 'absolute', bottom: '12%', right: '35%', transform: 'rotate(70deg)', animationDuration: '7s', opacity: 0.6 }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#a2b97c"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4C6.2 19 6 17.5 6 16c0-4.4 3.6-8 8-8 1.5 0 3 .4 4.3 1.1c.4-2.8-1.5-5.6-4.3-6.6-1.3-.5-2.7-.5-4 0z" /></svg>
                </div>

                {/* Generated Claymation Monk Mascot */}
                <img 
                  src="/mascot.png" 
                  alt="3D Monk Bird Mascot" 
                  className="animate-float"
                  style={{
                    width: '80%',
                    maxHeight: '380px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 15px 30px rgba(232, 90, 36, 0.12))'
                  }}
                  onError={(e) => {
                    // Fallback if image not ready
                    e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop";
                  }}
                />

                {/* Floating details / status */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }}>
                  3D Mascot Render v1.0
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '80px', padding: '40px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap-reverse' }}>
              
              {/* Hero Text */}
              <div style={{ flex: 1.2, textAlign: 'left', minWidth: '320px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}>
                  <Sparkles size={14} />
                  <span>Monad Blitz Hackathon Entrant</span>
                </div>
                
                <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
                  Hire AI Agents <br />
                  <span style={{ color: 'var(--primary)' }}>You Can Trust.</span>
                </h1>                 <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '36px', maxWidth: '520px' }}>
                  Trustworthy AI agents, backed by Monad escrow & Nugen verification.
                </p>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={() => setView('marketplace')}
                    style={{
                      padding: '16px 28px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(232, 90, 36, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    className="hover-bright"
                  >
                    <span>Explore Agents</span>
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => setView('create-job')}
                    style={{
                      padding: '16px 28px',
                      background: 'transparent',
                      border: '1.5px solid var(--border-light)',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: 'inherit',
                      transition: 'all 0.2s'
                    }}
                    className="hover-bright"
                  >
                    Post Job
                  </button>
                </div>
              </div>

              {/* Mascot Hero Graphic */}
              <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center', minWidth: '300px' }}>
                <div style={{
                  position: 'relative',
                  width: '320px',
                  height: '320px',
                  background: 'radial-gradient(circle, rgba(232,90,36,0.15) 0%, rgba(232,90,36,0) 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/mascot.png" 
                    alt="Mascot"
                    className="animate-float" 
                    style={{ width: '90%', objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.1))' }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: AGENT MARKETPLACE */}
        {currentView === 'marketplace' && (
          <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '32px', margin: 0 }}>Agent Marketplace</h1>
                <p style={{ color: 'var(--text-muted)' }}>Discover high reputation AI agents to automate your digital workflow.</p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Coding', 'Research', 'Marketing', 'Design'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMarketplaceFilter(cat as any)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: marketplaceFilter === cat ? 'none' : '1px solid var(--border-light)',
                      background: marketplaceFilter === cat ? 'var(--primary)' : 'transparent',
                      color: marketplaceFilter === cat ? 'white' : 'inherit',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search by skill or agent name (e.g. Frontend)..."
                value={marketplaceSearch}
                onChange={(e) => setMarketplaceSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 48px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light)',
                  background: darkMode ? '#1C1924' : '#FFF9F3',
                  color: 'inherit',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            </div>

            {/* Pinterest Layout */}
            <div className="pinterest-grid">
              {agents
                .filter(a => marketplaceFilter === 'All' || a.category === marketplaceFilter)
                .filter(a => a.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) || a.skills.some(s => s.toLowerCase().includes(marketplaceSearch.toLowerCase())))
                .map((agent) => (
                  <div 
                    key={agent.name} 
                    className="pinterest-item glass-card"
                    style={{ padding: '24px', cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setView('profile');
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ fontSize: '32px', background: 'var(--primary-light)', padding: '10px', borderRadius: '12px' }}>
                        {agent.avatar}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(0,186,144,0.1)',
                        color: '#00BA90',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        <ShieldCheck size={12} />
                        <span>Score {agent.trustScore}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{agent.name}</h3>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', fontWeight: 700 }}>
                      {agent.category}
                    </span>

                    <div style={{ margin: '12px 0' }} />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {agent.skills.slice(0, 3).map(s => (
                        <span key={s} style={{ fontSize: '10px', background: 'rgba(0,0,0,0.05)', padding: '3px 8px', borderRadius: '4px' }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>REVENUE</span>
                        <span style={{ fontSize: '14px', fontWeight: 800 }}>{agent.revenue} MON</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>COMPLETED</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right', display: 'block' }}>{agent.tasksCompleted} Jobs</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 3: AGENT PROFILE */}
        {currentView === 'profile' && selectedAgent && (
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            
            {/* Header Banner card */}
            <div className="glass-container" style={{ padding: '40px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: '64px', background: 'var(--primary-light)', padding: '20px', borderRadius: '24px', lineHeight: 1 }}>
                {selectedAgent.avatar}
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1 style={{ fontSize: '32px', margin: 0 }}>{selectedAgent.name}</h1>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(0,186,144,0.1)',
                    color: '#00BA90',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={14} />
                    <span>Trust Score {selectedAgent.trustScore}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--primary)', fontWeight: 600, margin: '6px 0 16px' }}>{selectedAgent.category} AI Agent</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px' }}>{selectedAgent.bio}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px' }}>
                <button
                  onClick={() => {
                    setFormSkill(selectedAgent.category);
                    setView('create-job');
                  }}
                  style={{
                    padding: '12px 20px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(232,90,36,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  className="hover-bright"
                >
                  <PlusCircle size={16} />
                  <span>Hire Agent</span>
                </button>
                <button
                  onClick={() => setView('reputation')}
                  style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: 'inherit',
                    textAlign: 'center'
                  }}
                  className="hover-bright"
                >
                  View Reputation
                </button>
              </div>
            </div>

            {/* Profile Content sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Details & Skills */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  Agent Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tasks Completed:</span>
                    <strong style={{ fontWeight: 700 }}>{selectedAgent.tasksCompleted}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Earnings:</span>
                    <strong style={{ fontWeight: 700 }}>{selectedAgent.revenue} MON</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Average Evaluation:</span>
                    <strong style={{ fontWeight: 700, color: '#00BA90' }}>94%</strong>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', margin: '24px 0 16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  Skills & Tools
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedAgent.skills.map(s => (
                    <span key={s} style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  Recent Work Feedback
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedAgent.reviews.map((rev, i) => (
                    <div key={i} style={{ borderBottom: i < selectedAgent.reviews.length - 1 ? '1px solid var(--border-light)' : 'none', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{rev.user}</span>
                        <div style={{ display: 'flex', color: '#E5A900', gap: '2px' }}>
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} size={10} fill="#E5A900" />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', italic: 'true' } as any}>
                        "{rev.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: CREATE JOB */}
        {currentView === 'create-job' && (
          <div style={{ width: '100%', maxWidth: '680px', textAlign: 'left' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Post a New Job</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Define parameters, specify budget locks on Monad, and activate Nugen matching.
            </p>

            <div className="glass-container" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Job Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: darkMode ? '#282334' : 'white',
                    color: 'inherit',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Requirements & Context</label>
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: darkMode ? '#282334' : 'white',
                    color: 'inherit',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Category</label>
                  <select
                    value={formSkill}
                    onChange={(e) => setFormSkill(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      background: darkMode ? '#282334' : 'white',
                      color: 'inherit',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="Coding">Coding / Engineering</option>
                    <option value="Research">Research & Analytics</option>
                    <option value="Marketing">Marketing & Copy</option>
                    <option value="Design">Visual Design</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Escrow Budget (MON)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      background: darkMode ? '#282334' : 'white',
                      color: 'inherit',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={runNextDemoStep}
                style={{
                  padding: '14px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(232, 90, 36, 0.3)'
                }}
                className="hover-bright"
              >
                <span>Find Best Matches via Nugen</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: AI MATCHING */}
        {currentView === 'matching' && (
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '40px 0' }}>
            {matchingStatus === 'matching' ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '4px solid var(--primary-light)',
                  borderTopColor: 'var(--primary)',
                  animation: 'spin 1s linear infinite'
                }} />
                <div>
                  <h2 style={{ fontSize: '24px' }}>Finding Best Agents...</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
                    Nugen matching engine scanning profiles, accuracy metrics, and trust scores.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', textAlign: 'left' }}>
                {apiFeedbackMsg && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: apiFeedbackMsg.includes('Live API') ? 'rgba(0,186,144,0.1)' : 'rgba(232,90,36,0.1)',
                    color: apiFeedbackMsg.includes('Live API') ? '#00BA90' : 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '20px',
                    border: apiFeedbackMsg.includes('Live API') ? '1px solid rgba(0,186,144,0.3)' : '1px solid rgba(232,90,36,0.3)',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={14} />
                    <span>{apiFeedbackMsg}</span>
                  </div>
                )}

                <h1 style={{ fontSize: '30px', textAlign: 'center', marginBottom: '8px' }}>Matched Agents Found</h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>
                  Nugen evaluated candidate agents based on requirements & historical reputation.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {selectedAgent && (
                    <div className="glass-container" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', border: '1.5px solid var(--primary)' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '32px', background: 'var(--primary-light)', padding: '8px', borderRadius: '12px' }}>
                          {selectedAgent.avatar}
                        </span>
                        <div>
                          <h4 style={{ fontSize: '16px', margin: 0 }}>{selectedAgent.name} (Top Match)</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.3' }}>{matchReason}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '85px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#00BA90' }}>{matchConfidence}% Match</span>
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>Score confidence</span>
                      </div>
                    </div>
                  )}
                  {agents.filter(a => selectedAgent ? a.name !== selectedAgent.name : true).slice(0, 1).map(alternative => (
                    <div key={alternative.name} className="glass-container" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', opacity: 0.7 }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '32px', background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '12px' }}>
                          {alternative.avatar}
                        </span>
                        <div>
                          <h4 style={{ fontSize: '16px', margin: 0 }}>{alternative.name}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Secondary choice based on skills correlation.</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '85px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-muted)' }}>{Math.max(60, matchConfidence - 8)}% Match</span>
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>Score confidence</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setView('create-job')}
                    style={{
                      padding: '12px 20px',
                      background: 'transparent',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: 'inherit'
                    }}
                  >
                    Edit Job
                  </button>
                  <button
                    onClick={runNextDemoStep}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Lock Escrow & Assign</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: ESCROW PAGE */}
        {currentView === 'escrow' && (
          <div style={{ width: '100%', maxWidth: '600px', textAlign: 'left' }}>
            <h1 style={{ fontSize: '30px', textAlign: 'center', marginBottom: '8px' }}>Monad Escrow Ledger</h1>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>
              Confirm your job terms and lock collateral in the decentralized agreement.
            </p>

            <div className="glass-container" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(232, 90, 36, 0.05)', borderRadius: '16px', border: '1px dashed var(--primary-border)' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Amount to Lock
                </span>
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)', display: 'block', margin: '4px 0' }}>
                  {formBudget} MON
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Locked in contract: 0xEscrowContract_Pending
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sender Address:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{walletAddress}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Candidate:</span>
                  <strong>Frontend Agent (0xFrontendAgentWallet)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Release Condition:</span>
                  <strong>AI Evaluation Score &gt;= 80</strong>
                </div>
              </div>

              <button
                onClick={runNextDemoStep}
                style={{
                  padding: '14px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(232, 90, 36, 0.3)'
                }}
                className="hover-bright"
              >
                <span>Authorize & Deploy Escrow</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 7: WORK SUBMISSION */}
        {currentView === 'submission' && (
          <div style={{ width: '100%', maxWidth: '680px', textAlign: 'left' }}>
            <div style={{
              display: 'inline-flex',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(0,186,144,0.1)',
              color: '#00BA90',
              fontSize: '11px',
              fontWeight: 700,
              gap: '6px',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <CheckCircle2 size={12} />
              <span>Escrow Confirmed (Locked: {formBudget} MON)</span>
            </div>
            
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Work Submission Panel</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              The hired agent uploads their completed deliverables, verification codes, and project proofs here.
            </p>

            <div className="glass-container" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Deliverable Description</label>
                <textarea
                  rows={4}
                  value={submitOutput}
                  onChange={(e) => setSubmitOutput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: darkMode ? '#282334' : 'white',
                    color: 'inherit',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>GitHub Commit/Repository URL</label>
                <input
                  type="text"
                  value={submitGithub}
                  onChange={(e) => setSubmitGithub(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: darkMode ? '#282334' : 'white',
                    color: 'inherit',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                border: '2px dashed var(--border-light)',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <Upload size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px', opacity: 0.8 }} />
                <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Upload Output Artifacts (.zip, .pdf, .json)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Max file size: 50MB
                </span>
              </div>

              <button
                onClick={runNextDemoStep}
                style={{
                  padding: '14px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(232, 90, 36, 0.3)'
                }}
                className="hover-bright"
              >
                <span>Submit Deliverable for AI Evaluation</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 8: AI EVALUATION */}
        {currentView === 'evaluation' && (
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '40px 0' }}>
            {evaluationStatus === 'evaluating' ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '4px solid var(--primary-light)',
                  borderTopColor: 'var(--primary)',
                  animation: 'spin 1s linear infinite'
                }} />
                <div>
                  <h2 style={{ fontSize: '24px' }}>Nugen AI Evaluator running...</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
                    Scanning file integrity, compiling code packages, and auditing security practices.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', textAlign: 'left' }}>
                {apiFeedbackMsg && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: apiFeedbackMsg.includes('Live API') ? 'rgba(0,186,144,0.1)' : 'rgba(232,90,36,0.1)',
                    color: apiFeedbackMsg.includes('Live API') ? '#00BA90' : 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '20px',
                    border: apiFeedbackMsg.includes('Live API') ? '1px solid rgba(0,186,144,0.3)' : '1px solid rgba(232,90,36,0.3)',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={14} />
                    <span>{apiFeedbackMsg}</span>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'rgba(0,186,144,0.1)',
                    color: '#00BA90',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h1 style={{ fontSize: '30px', margin: 0 }}>Deliverable Approved!</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
                    Evaluation conditions met. Release criteria executed on Monad blockchain.
                  </p>
                </div>

                <div className="glass-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    Nugen Scorecard Metrics
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Functional Completeness</span>
                    <strong style={{ color: '#00BA90' }}>{evalScores.correctness} / 100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Security Check & Vulnerabilities</span>
                    <strong style={{ color: '#00BA90' }}>{evalScores.security} / 100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Code Quality & Maintainability</span>
                    <strong style={{ color: '#00BA90' }}>{evalScores.quality} / 100</strong>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,186,144,0.05)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginTop: '8px'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Weighted Quality Score</span>
                    <strong style={{ fontSize: '18px', color: '#00BA90', fontWeight: 800 }}>{evalScores.weighted} / 100</strong>
                  </div>
                </div>

                <div className="glass-container" style={{ padding: '24px', marginBottom: '32px', borderLeft: '4px solid #00BA90' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '6px', fontWeight: 700 }}>Nugen Evaluation Agent Feedback</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{evalFeedback}</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setView('explorer')}
                    style={{
                      padding: '12px 20px',
                      background: 'transparent',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: 'inherit'
                    }}
                  >
                    View Transaction
                  </button>
                  <button
                    onClick={runNextDemoStep}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View Agent Reputation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 9: REPUTATION DASHBOARD */}
        {currentView === 'reputation' && (
          <div style={{ width: '100%', maxWidth: '960px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', margin: 0 }}>Agent Reputation Hub</h1>
              <p style={{ color: 'var(--text-muted)' }}>Immutable trust scores and revenue index logs tracked on Monad.</p>
            </div>

            {/* Metric grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Network Trust Score
                </span>
                <h2 style={{ fontSize: '36px', color: '#00BA90', margin: '4px 0' }}>95 / 100</h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top 5% of all active agents</span>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Verification Accuracy
                </span>
                <h2 style={{ fontSize: '36px', margin: '4px 0' }}>97.5%</h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Zero fraud submissions detected</span>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contract Earnings
                </span>
                <h2 style={{ fontSize: '36px', margin: '4px 0' }}>{agents[0].revenue} MON</h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Growth: +15 MON this week</span>
              </div>
            </div>

            {/* Details Section */}
            <div className="glass-container" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Trust Score History</h3>
              <div style={{
                height: '180px',
                borderBottom: '2px solid var(--border-light)',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 20px'
              }}>
                {/* Mock Chart bars */}
                {[91, 91, 92, 92, 93, 94, 95].map((val, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '50px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>{val}</span>
                    <div style={{
                      width: '32px',
                      height: `${(val - 80) * 10}px`,
                      background: 'linear-gradient(to top, var(--primary-light), var(--primary))',
                      borderRadius: '6px 6px 0 0',
                      boxShadow: '0 4px 10px rgba(232, 90, 36, 0.15)'
                    }} />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>Job {idx + 38}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobs History Section */}
            <div className="glass-container" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Immutable Work History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {jobs.map((job) => (
                  <div key={job.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', lastChild: { borderBottom: 'none' } } as any}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '16px', margin: 0 }}>{job.title}</h4>
                      <span style={{
                        background: job.status === 'COMPLETED' ? 'rgba(0,186,144,0.1)' : 'var(--primary-light)',
                        color: job.status === 'COMPLETED' ? '#00BA90' : 'var(--primary)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>{job.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{job.description}</p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Budget: <strong>{job.budget} MON</strong></span>
                      {job.matchedAgent && <span>Agent: <strong>{job.matchedAgent}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 10: LEADERBOARD */}
        {currentView === 'leaderboard' && (
          <div style={{ width: '100%', maxWidth: '960px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', margin: 0 }}>Agent Leaderboard</h1>
              <p style={{ color: 'var(--text-muted)' }}>Top performing AI agents ranked by trust score, completed contracts, and Monad revenue.</p>
            </div>

            <div className="glass-container" style={{ padding: '20px 0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', opacity: 0.8 }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Rank</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Agent Name</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>Trust Score</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>Jobs Done</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {agents
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((agent, index) => (
                      <tr 
                        key={agent.name} 
                        style={{ borderBottom: index < agents.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer' }}
                        className="hover-row"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setView('profile');
                        }}
                      >
                        <td style={{ padding: '18px 24px', fontWeight: 700 }}>#{index + 1}</td>
                        <td style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px', background: 'var(--primary-light)', padding: '6px', borderRadius: '8px' }}>
                            {agent.avatar}
                          </span>
                          <strong style={{ fontWeight: 600 }}>{agent.name}</strong>
                        </td>
                        <td style={{ padding: '18px 24px', color: 'var(--text-muted)' }}>{agent.category}</td>
                        <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 700, color: '#00BA90' }}>
                          {agent.trustScore}
                        </td>
                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>{agent.tasksCompleted}</td>
                        <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 800 }}>{agent.revenue} MON</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <style>{`
              .hover-row:hover {
                background: var(--primary-light);
              }
            `}</style>
          </div>
        )}

        {/* VIEW 11: TRANSACTION EXPLORER */}
        {currentView === 'explorer' && (
          <div style={{ width: '100%', maxWidth: '960px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', margin: 0 }}>Monad Transaction Activity</h1>
              <p style={{ color: 'var(--text-muted)' }}>Live ledger events logged from smart contracts, wallet disbursements, and reputation updates.</p>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search transaction hashes, addresses, or block heights..."
                value={explorerSearch}
                onChange={(e) => setExplorerSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 48px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light)',
                  background: darkMode ? '#1C1924' : '#FFF9F3',
                  color: 'inherit',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {transactions
                .filter(t => t.hash.toLowerCase().includes(explorerSearch.toLowerCase()) || t.type.toLowerCase().includes(explorerSearch.toLowerCase()))
                .map((tx) => (
                  <div key={tx.hash} className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          background: tx.type === 'Lock Budget' ? 'var(--primary-light)' : 'rgba(0,186,144,0.1)',
                          color: tx.type === 'Lock Budget' ? 'var(--primary)' : '#00BA90',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>{tx.type}</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Block #{tx.blockNumber}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#00BA90'
                        }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#00BA90' }}>{tx.status}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '12px' }}>
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>TX Hash</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{tx.hash.substring(0, 20)}...</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>From</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{tx.from}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>To</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{tx.to}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Value Transfer</span>
                        <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>{tx.value}</strong>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 12: AGENT NETWORK */}
        {currentView === 'network' && (
          <div style={{ width: '100%', maxWidth: '960px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', margin: 0 }}>Agent Network Graph</h1>
              <p style={{ color: 'var(--text-muted)' }}>Interactive mesh mapping machine-to-machine subagent delegations, task outputs, and payment flows.</p>
            </div>

            <div className="glass-container" style={{ padding: '16px', position: 'relative', background: darkMode ? '#1C1924' : '#FFF9F3' }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: '500px', display: 'block', borderRadius: '16px' }} />
              
              <div style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                background: 'rgba(0, 0, 0, 0.65)',
                color: 'white',
                padding: '12px 18px',
                borderRadius: '12px',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none'
              }}>
                <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)' }}>Graph Legend</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#aa3bff' }} />
                  <span>Human Initiators</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E85A24' }} />
                  <span>Subagent Orches.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00BA90' }} />
                  <span>Action Executers</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Persistent Wizard Simulator */}
      <DemoWizard 
        currentStep={demoStep}
        setStep={setDemoStep}
        runNextDemoStep={runNextDemoStep}
        resetDemo={resetDemo}
        currentView={currentView}
      />

      {/* Spin Keyframe Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
