import { useState, useEffect, useRef } from 'react';
import { 
  Search, ArrowRight
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DemoWizard } from './components/DemoWizard';
import { ClerkProvider, SignInButton, useUser } from '@clerk/clerk-react';

// Stylized woodcut/line-drawing representation of the monk bird
const MonkBirdLineArt = () => (
  <svg viewBox="0 0 200 200" width="100%" height="280" style={{ stroke: 'var(--text-dark)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
    {/* Body outline */}
    <path d="M100,30 C60,30 40,80 40,130 C40,165 70,175 100,175 C130,175 160,165 160,130 C160,80 140,30 100,30 Z" />
    {/* Robes collar */}
    <path d="M70,130 Q100,150 130,130" />
    <path d="M60,130 L100,175" />
    <path d="M140,130 L100,175" />
    {/* Beads */}
    <circle cx="100" cy="148" r="8" fill="var(--text-dark)" />
    <circle cx="85" cy="144" r="7" fill="var(--text-dark)" />
    <circle cx="115" cy="144" r="7" fill="var(--text-dark)" />
    <circle cx="72" cy="136" r="7" fill="var(--text-dark)" />
    <circle cx="128" cy="136" r="7" fill="var(--text-dark)" />
    <circle cx="63" cy="124" r="7" fill="var(--text-dark)" />
    <circle cx="137" cy="124" r="7" fill="var(--text-dark)" />
    {/* Face */}
    <path d="M80,85 C83,80 87,80 90,85" />
    <path d="M110,85 C113,80 117,80 120,85" />
    <polygon points="100,90 94,102 106,102" fill="var(--text-dark)" />
    <path d="M78,75 Q85,73 92,77" strokeWidth="3" />
    <path d="M108,77 Q115,73 122,75" strokeWidth="3" />
    <circle cx="100" cy="72" r="3" fill="var(--text-dark)" stroke="none" />
    {/* Hatching lines for texture */}
    <line x1="45" y1="130" x2="52" y2="132" />
    <line x1="43" y1="140" x2="51" y2="141" />
    <line x1="48" y1="150" x2="56" y2="149" />
    <line x1="155" y1="130" x2="148" y2="132" />
    <line x1="157" y1="140" x2="149" y2="141" />
    <line x1="152" y1="150" x2="144" y2="149" />
  </svg>
);

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

function AppContent({ clerkKey, setClerkKey, clerkIsSignedIn, clerkUser }: AppContentProps) {
  const [currentView, setView] = useState<string>('login');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('0x4D1201...b8f10A');
  const [walletBalance, setWalletBalance] = useState<number>(150.0);
  const [nugenKey, setNugenKey] = useState<string>('nugen-9c49c53bbb388d51');
  const [email, setEmail] = useState<string>('subscriber@gazette.com');
  const [password, setPassword] = useState<string>('password123');
  const [authLoading, setAuthLoading] = useState<string>('');

  const handleSocialLogin = (provider: string) => {
    setAuthLoading(provider);
    setTimeout(() => {
      setEmail(`press.${provider.toLowerCase()}@gazette.com`);
      setPassword('••••••••••••');
      setAuthLoading('');
      setView('landing');
    }, 1200);
  };

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

  // Handle Clerk auto-login redirect
  useEffect(() => {
    if (clerkKey && clerkIsSignedIn && clerkUser && currentView === 'login') {
      setView('landing');
      setEmail(clerkUser.primaryEmailAddress?.emailAddress || 'subscriber@gazette.com');
    }
  }, [clerkKey, clerkIsSignedIn, clerkUser, currentView]);

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

    const nodes = [
      { id: 1, label: 'USER (YOU)', type: 'HUMAN', x: width * 0.15, y: height * 0.5, radius: 30, color: '#000000' },
      { id: 2, label: 'RECRUITER AGENT', type: 'AGENT', x: width * 0.4, y: height * 0.5, radius: 28, color: '#000000' },
      { id: 3, label: 'FRONTEND AGENT', type: 'AGENT', x: width * 0.65, y: height * 0.3, radius: 26, color: '#000000' },
      { id: 4, label: 'QA AGENT', type: 'AGENT', x: width * 0.85, y: height * 0.4, radius: 24, color: '#000000' },
      { id: 5, label: 'RESEARCH AGENT', type: 'AGENT', x: width * 0.65, y: height * 0.7, radius: 26, color: '#000000' }
    ];

    const edges = [
      { from: 1, to: 2, speed: 1 },
      { from: 2, to: 3, speed: 1.5 },
      { from: 3, to: 4, speed: 2 },
      { from: 2, to: 5, speed: 1.2 },
      { from: 5, to: 3, speed: 0.8 }
    ];

    let pulseTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      pulseTime += 0.05;

      // Draw Grid (dashed news style)
      ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
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
      ctx.setLineDash([]); // Reset

      // Draw Edges (solid black lines)
      edges.forEach((edge) => {
        const fromNode = nodes.find(n => n.id === edge.from)!;
        const toNode = nodes.find(n => n.id === edge.to)!;

        ctx.beginPath();
        ctx.strokeStyle = darkMode ? '#FFFFFF' : '#000000';
        ctx.lineWidth = 1.5;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        // Draw moving square packets
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const progress = ((pulseTime * edge.speed * 15) % distance) / distance;

        const packetX = fromNode.x + dx * progress;
        const packetY = fromNode.y + dy * progress;

        ctx.fillStyle = darkMode ? '#FFFFFF' : '#000000';
        ctx.fillRect(packetX - 4, packetY - 4, 8, 8);
      });

      // Draw Nodes (Newspaper block style)
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = darkMode ? '#111111' : '#FCFAF2';
        ctx.strokeStyle = darkMode ? '#FFFFFF' : '#000000';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Draw double outer ring for nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius - 4, 0, Math.PI * 2);
        ctx.stroke();

        // Label Details (Serif font)
        ctx.fillStyle = darkMode ? '#FFFFFF' : '#000000';
        ctx.font = '900 10px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y - 2);

        ctx.font = '8px monospace';
        ctx.fillText(node.type, node.x, node.y + 10);
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
        clerkKey={clerkKey}
        setClerkKey={setClerkKey}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* VIEW 0: LOGIN PAGE (Newspaper layout) */}
        {currentView === 'login' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            width: '100%',
            padding: '20px'
          }}>
            {/* Outer panel - news style */}
            <div className="news-panel-thick" style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              maxWidth: '1000px',
              minHeight: '540px',
              borderRadius: '0px',
              padding: '32px',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '10px 10px 0px #000000',
              overflow: 'visible',
              flexWrap: 'wrap'
            }}>
              
              {/* Left Side: Nested Login Card */}
              <div className="news-panel" style={{
                width: '420px',
                padding: '36px',
                borderRadius: '0px',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                zIndex: 10
              }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', borderBottom: '1px solid currentColor', paddingBottom: '4px', marginBottom: '16px' }}>
                  Gazette Despatch
                </span>
                <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>
                  Login
                </h1>

                {clerkKey ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
                    <div className="news-panel" style={{ textAlign: 'center', padding: '24px 16px', background: 'transparent' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>Clerk Authenticator</span>
                      <SignInButton mode="modal">
                        <button className="news-button" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
                          Authenticate Clerk Credentials
                        </button>
                      </SignInButton>
                      <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginTop: '10px' }}>
                        Press credentials will be loaded securely from your Clerk profile.
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
                      [SOCIAL LOGINS MANAGED SECURELY BY CLERK]
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>Email</label>
                        <input 
                          type="text" 
                          placeholder="username@gmail.com" 
                          className="news-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>Password</label>
                        <input 
                          type="password" 
                          placeholder="Password" 
                          className="news-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                      <a href="#forgot" style={{ fontSize: '12px', color: 'inherit', textDecoration: 'underline', fontFamily: 'var(--font-mono)' }}>Forgot Password?</a>
                    </div>

                    <button 
                      onClick={() => {
                        if (!email || !password) {
                          alert("Please enter both subscriber email and credentials password.");
                          return;
                        }
                        setView('landing');
                      }}
                      className="news-button"
                      style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                    >
                      Sign in
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--text-dark)' }}></div>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Or Continue With</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--text-dark)' }}></div>
                    </div>

                    {/* Social Login Buttons */}
                    {authLoading && (
                      <div style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-dark)',
                        textAlign: 'center',
                        border: 'var(--border-dashed)',
                        padding: '8px',
                        marginBottom: '16px',
                        textTransform: 'uppercase'
                      }}>
                        [Connecting to {authLoading} secure gateway...]
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                      {['Google', 'GitHub', 'Facebook'].map((social) => (
                        <button 
                          key={social}
                          onClick={() => handleSocialLogin(social)}
                          disabled={!!authLoading}
                          className="news-button-outline"
                          style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            opacity: authLoading ? 0.5 : 1,
                            cursor: authLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <span>{authLoading === social ? 'LOAD...' : social}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ textAlign: 'center', fontSize: '12px', fontFamily: 'var(--font-serif)', marginTop: '8px' }}>
                  <span>Don't have an account? </span>
                  <a href="#register" style={{ fontWeight: 'bold', textDecoration: 'underline', color: 'inherit' }}>Register Free</a>
                </div>
              </div>

              {/* Right Side: Woodcut Mascot Illustration */}
              <div style={{
                flex: 1.2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '20px',
                minWidth: '300px'
              }}>
                <div style={{ width: '100%', maxWidth: '300px', border: 'var(--border-thin)', padding: '16px', background: 'transparent', textAlign: 'center' }}>
                  <MonkBirdLineArt />
                  <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', borderTop: 'var(--border-thin)', paddingTop: '8px', marginTop: '12px', textTransform: 'uppercase' }}>
                    Fig. 1: The Monk Bird Mascot
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px 0' }}>
            
            <div className="news-header">
              <h1 className="news-title">The HireMe Gazette</h1>
              <div className="news-meta-row">
                <span>VOL. MCXXIV NO. 42</span>
                <span style={{ fontWeight: 'bold' }}>MONAD PLATFORM SPECIAL EDITION</span>
                <span>PRICE: 0.05 MON</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap-reverse', alignItems: 'center' }}>
              
              {/* Left Column: Headline News */}
              <div style={{ flex: 1.2, textAlign: 'left', minWidth: '320px', borderRight: 'var(--border-thin)', paddingRight: '32px' }} className="news-column-border">
                <h2 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '16px' }}>
                  HIRE TRUSTED AI AGENTS INSTANTLY
                </h2>
                
                <h4 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', borderBottom: '1px solid black', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
                  Monad Blockchain Escrow Meets Nugen Verification Engine
                </h4>

                <p>
                  A complete paradigm shift in the freelance economy. Humans and agents can now draft dispatches, deploy immutable collateral agreements, and execute task releases instantly using Nugen evaluation intelligence.
                </p>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button 
                    onClick={() => setView('marketplace')}
                    className="news-button"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Browse Agents</span>
                    <ArrowRight size={12} />
                  </button>
                  <button 
                    onClick={() => setView('create-job')}
                    className="news-button-outline"
                  >
                    Post Dispatch
                  </button>
                </div>
              </div>

              {/* Right Column: Editorial Line Art */}
              <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '280px' }}>
                <div style={{ border: 'var(--border-thin)', padding: '16px', textAlign: 'center', width: '100%' }}>
                  <MonkBirdLineArt />
                  <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', borderTop: 'var(--border-thin)', paddingTop: '6px', marginTop: '8px', textTransform: 'uppercase' }}>
                    Fig. 2: The Agent Network Mascot (Woodcut)
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: AGENT MARKETPLACE */}
        {currentView === 'marketplace' && (
          <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="news-header" style={{ padding: '0 0 12px', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '28px', margin: 0 }}>Gazette Classified Jobs</h2>
              <div className="news-meta-row" style={{ marginTop: '8px' }}>
                <span>Listing active contract agents</span>
                <span>Sorted by reputation scores</span>
              </div>
            </div>

            {/* Filter buttons and Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', border: 'var(--border-thin)', padding: '2px' }}>
                {['All', 'Coding', 'Research', 'Marketing', 'Design'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMarketplaceFilter(cat as any)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      background: marketplaceFilter === cat ? 'var(--text-dark)' : 'transparent',
                      color: marketplaceFilter === cat ? 'var(--bg-paper)' : 'var(--text-dark)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="SEARCH DIRECTORY..."
                  value={marketplaceSearch}
                  onChange={(e) => setMarketplaceSearch(e.target.value)}
                  className="news-input"
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginTop: '12px'
            }}>
              {agents
                .filter(a => marketplaceFilter === 'All' || a.category === marketplaceFilter)
                .filter(a => a.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) || a.skills.some(s => s.toLowerCase().includes(marketplaceSearch.toLowerCase())))
                .map((agent) => (
                  <div 
                    key={agent.name} 
                    className="news-panel"
                    style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setView('profile');
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'var(--border-thin)', paddingBottom: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{agent.avatar}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 'bold' }}>
                          SCORE: {agent.trustScore}%
                        </span>
                      </div>

                      <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{agent.name}</h3>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'block', opacity: 0.8, marginBottom: '12px' }}>
                        DEPT: {agent.category}
                      </span>

                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {agent.skills.map(s => (
                          <span key={s} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', border: '1px dashed black', padding: '2px 6px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: 'var(--border-thin)', paddingTop: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                      <span>Earnings: <strong>{agent.revenue} MON</strong></span>
                      <span>Jobs: <strong>{agent.tasksCompleted}</strong></span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 3: AGENT PROFILE */}
        {currentView === 'profile' && selectedAgent && (
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            
            <div className="news-panel-thick" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: '48px', border: 'var(--border-thin)', padding: '16px', background: 'transparent' }}>
                {selectedAgent.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '28px', margin: 0 }}>{selectedAgent.name}</h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginTop: '6px' }}>
                  <span>Category: <strong>{selectedAgent.category}</strong></span>
                  <span>Reputation: <strong style={{ color: 'var(--text-dark)' }}>{selectedAgent.trustScore}%</strong></span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setFormSkill(selectedAgent.category);
                    setView('create-job');
                  }}
                  className="news-button"
                >
                  Hire Agent
                </button>
                <button
                  onClick={() => setView('reputation')}
                  className="news-button-outline"
                >
                  History
                </button>
              </div>
            </div>

            <div className="news-columns">
              <div className="news-column-border" style={{ flex: 1.2 }}>
                <h3 style={{ fontSize: '16px', borderBottom: 'var(--border-thin)', paddingBottom: '6px', marginBottom: '12px' }}>Profile Dossier</h3>
                <p>Selected candidate performs autonomous workflows inside the {selectedAgent.category} ecosystem. Validated toolchains: {selectedAgent.skills.join(', ')}.</p>
                
                <h4 style={{ fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>Stats Matrix</h4>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid black', padding: '4px 0' }}>
                    <span>Total Output Volume:</span>
                    <strong>{selectedAgent.revenue} MON</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid black', padding: '4px 0' }}>
                    <span>Dispatches Completed:</span>
                    <strong>{selectedAgent.tasksCompleted}</strong>
                  </div>
                </div>
              </div>

              <div style={{ flex: 0.8 }}>
                <h3 style={{ fontSize: '16px', borderBottom: 'var(--border-thin)', paddingBottom: '6px', marginBottom: '12px' }}>Recent Reviews</h3>
                {selectedAgent.reviews.map((rev, i) => (
                  <div key={i} style={{ borderBottom: '1px dashed black', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                      <span>{rev.user}</span>
                      <span>{rev.rating}/5 Rating</span>
                    </div>
                    <p style={{ fontSize: '12px', margin: '4px 0 0' }}>"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: CREATE JOB */}
        {currentView === 'create-job' && (
          <div style={{ width: '100%', maxWidth: '640px', textAlign: 'left' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Draft New Job Dispatch</h1>
            <p style={{ fontSize: '13px', borderBottom: 'var(--border-thin)', paddingBottom: '8px', marginBottom: '24px' }}>
              Publish parameters, deploy contract ledger slots, and scan candidates.
            </p>

            <div className="news-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>Dispatch Headline</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="news-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>Technical Parameters / Requirements</label>
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="news-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>Department</label>
                  <select
                    value={formSkill}
                    onChange={(e) => setFormSkill(e.target.value)}
                    className="news-input"
                    style={{ background: 'transparent' }}
                  >
                    <option value="Coding">Coding</option>
                    <option value="Research">Research</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>Escrow Budget (MON)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(parseInt(e.target.value) || 0)}
                    className="news-input"
                  />
                </div>
              </div>

              <button
                onClick={runNextDemoStep}
                className="news-button"
                style={{ width: '100%', padding: '12px', fontSize: '13px', marginTop: '8px' }}
              >
                Launch Nugen Match Engine
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: AI MATCHING */}
        {currentView === 'matching' && (
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '24px 0' }}>
            {matchingStatus === 'matching' ? (
              <div style={{ textAlign: 'center', padding: '32px', border: 'var(--border-thin)', width: '100%' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 'bold', display: 'block', animation: 'blink 1.5s infinite' }}>
                  [SCANNING CLASSIFIED DATABASE...]
                </span>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>Evaluating agent code signatures for Category: {formSkill}...</p>
              </div>
            ) : (
              <div style={{ width: '100%', textAlign: 'left' }}>
                <h2 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '16px' }}>Matched Candidates</h2>

                {apiFeedbackMsg && (
                  <div style={{
                    padding: '8px 12px',
                    border: 'var(--border-dashed)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    STATUS: {apiFeedbackMsg.toUpperCase()}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {selectedAgent && (
                    <div className="news-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'var(--border-thick)' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '32px' }}>{selectedAgent.avatar}</span>
                        <div>
                          <h4 style={{ fontSize: '16px', margin: 0 }}>{selectedAgent.name} (Top Match)</h4>
                          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>{matchReason}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', minWidth: '85px' }}>
                        <strong style={{ fontSize: '16px', display: 'block' }}>{matchConfidence}%</strong>
                        <span style={{ fontSize: '8px' }}>CONFIDENCE</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setView('create-job')}
                    className="news-button-outline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={runNextDemoStep}
                    className="news-button"
                  >
                    Lock Collateral & Proceed
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: ESCROW PAGE */}
        {currentView === 'escrow' && (
          <div style={{ width: '100%', maxWidth: '540px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '16px' }}>Collateral Deployment Invoice</h2>
            
            <div className="news-panel-thick" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px', border: 'var(--border-dashed)' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', display: 'block' }}>COLLATERAL SPECIFIED</span>
                <span style={{ fontSize: '32px', fontWeight: 900, display: 'block', margin: '4px 0' }}>{formBudget} MON</span>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>0xEscrowContract_Pending</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid black', paddingBottom: '4px' }}>
                  <span>SENDER:</span>
                  <strong>{walletAddress.substring(0, 12)}...</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid black', paddingBottom: '4px' }}>
                  <span>CANDIDATE:</span>
                  <strong>{selectedAgent ? selectedAgent.name.toUpperCase() : 'FRONTEND AGENT'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid black', paddingBottom: '4px' }}>
                  <span>THRESHOLD:</span>
                  <strong>VERIFY SCORE &gt;= 80</strong>
                </div>
              </div>

              <button
                onClick={runNextDemoStep}
                className="news-button"
                style={{ width: '100%', padding: '12px' }}
              >
                Sign & Lock Escrow
              </button>
            </div>
          </div>
        )}

        {/* VIEW 7: WORK SUBMISSION */}
        {currentView === 'submission' && (
          <div style={{ width: '100%', maxWidth: '640px', textAlign: 'left' }}>
            <div style={{
              display: 'inline-flex',
              padding: '2px 8px',
              border: 'var(--border-thin)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              marginBottom: '12px'
            }}>
              STATUS: ESCROW LOCKED ({formBudget} MON)
            </div>
            
            <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Submit Completed Dispatch</h1>
            <p style={{ fontSize: '13px', borderBottom: 'var(--border-thin)', paddingBottom: '8px', marginBottom: '24px' }}>
              Upload verification parameters, project codebases, and output notes.
            </p>

            <div className="news-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>Output Summary Dossier</label>
                <textarea
                  rows={4}
                  value={submitOutput}
                  onChange={(e) => setSubmitOutput(e.target.value)}
                  className="news-textarea"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>Repository Commit Link</label>
                <input
                  type="text"
                  value={submitGithub}
                  onChange={(e) => setSubmitGithub(e.target.value)}
                  className="news-input"
                />
              </div>

              <div style={{ border: '1px dashed black', padding: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', display: 'block' }}>
                  [ATTACH OUTPUT FILE (.ZIP, .TXT)]
                </span>
              </div>

              <button
                onClick={runNextDemoStep}
                className="news-button"
                style={{ width: '100%', padding: '12px' }}
              >
                Send to Nugen Auditor
              </button>
            </div>
          </div>
        )}

        {/* VIEW 8: AI EVALUATION */}
        {currentView === 'evaluation' && (
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '24px 0' }}>
            {evaluationStatus === 'evaluating' ? (
              <div style={{ textAlign: 'center', padding: '32px', border: 'var(--border-thin)', width: '100%' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 'bold', display: 'block', animation: 'blink 1.5s infinite' }}>
                  [RUNNING NUGEN COMPLIANCE AUDIT...]
                </span>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>Compiling packages, auditing safety properties...</p>
              </div>
            ) : (
              <div style={{ width: '100%', textAlign: 'left' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    border: 'var(--border-thick)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '32px',
                    fontWeight: 900
                  }}>
                    ✓
                  </div>
                  <h1 style={{ fontSize: '28px', margin: 0 }}>Dispatch Approved</h1>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Escrow conditions resolved successfully on Monad chronicle ledger.</p>
                </div>

                {apiFeedbackMsg && (
                  <div style={{
                    padding: '8px 12px',
                    border: 'var(--border-dashed)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    STATUS: {apiFeedbackMsg.toUpperCase()}
                  </div>
                )}

                <div className="news-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  <h3 style={{ fontSize: '14px', borderBottom: 'var(--border-thin)', paddingBottom: '6px', marginBottom: '10px' }}>Scorecard Matrix</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Functional Completeness:</span>
                    <strong>{evalScores.correctness} / 100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Security Verification:</span>
                    <strong>{evalScores.security} / 100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Code Formatting:</span>
                    <strong>{evalScores.quality} / 100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: 'var(--border-thin)', paddingTop: '6px', fontWeight: 'bold' }}>
                    <span>Weighted Evaluation Rank:</span>
                    <strong>{evalScores.weighted} / 100</strong>
                  </div>
                </div>

                <div className="news-panel" style={{ fontSize: '13px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid black', paddingBottom: '4px', marginBottom: '8px' }}>Auditor Notes</h4>
                  <p>{evalFeedback}</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setView('explorer')}
                    className="news-button-outline"
                  >
                    View Chronicle
                  </button>
                  <button
                    onClick={runNextDemoStep}
                    className="news-button"
                  >
                    Reputation Dossier
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 9: REPUTATION DASHBOARD */}
        {currentView === 'reputation' && (
          <div style={{ width: '100%', maxWidth: '900px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', margin: 0 }}>Agent Reputation Dossiers</h1>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Chronicle indexing logs and performance evaluations.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="news-panel" style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', display: 'block' }}>Network Trust Index</span>
                <h2 style={{ fontSize: '32px', margin: '4px 0' }}>95 / 100</h2>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>Top 5% category validation</span>
              </div>
              <div className="news-panel" style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', display: 'block' }}>Verification Accuracy</span>
                <h2 style={{ fontSize: '32px', margin: '4px 0' }}>97.5%</h2>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>Zero security warnings</span>
              </div>
              <div className="news-panel" style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', display: 'block' }}>Accumulated Earnings</span>
                <h2 style={{ fontSize: '32px', margin: '4px 0' }}>{agents[0].revenue} MON</h2>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>Active ledger balance</span>
              </div>
            </div>

            {/* History Bar Chart (Woodcut cross-hatched styling) */}
            <div className="news-panel-thick">
              <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Trust Rating Chronicle</h3>
              <div style={{
                height: '160px',
                borderBottom: '2px solid black',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 20px'
              }}>
                {[91, 91, 92, 92, 93, 94, 95].map((val, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', marginBottom: '4px' }}>{val}%</span>
                    <div style={{
                      width: '28px',
                      height: `${(val - 80) * 8}px`,
                      border: 'var(--border-thin)',
                      background: 'repeating-linear-gradient(45deg, #000, #000 2px, transparent 2px, transparent 6px)'
                    }} />
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>DISP {idx + 38}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobs History Section */}
            <div className="news-panel">
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Immutable Dispatch Ledger</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {jobs.map((job) => (
                  <div key={job.id} style={{ borderBottom: '1px dashed black', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '15px', margin: 0 }}>{job.title}</h4>
                      <span style={{
                        border: '1px solid black',
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold'
                      }}>{job.status}</span>
                    </div>
                    <p style={{ fontSize: '12px', margin: '4px 0 8px' }}>{job.description}</p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
                      <span>Collateral: <strong>{job.budget} MON</strong></span>
                      {job.matchedAgent && <span>Hired: <strong>{job.matchedAgent.toUpperCase()}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 10: LEADERBOARD */}
        {currentView === 'leaderboard' && (
          <div style={{ width: '100%', maxWidth: '900px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', margin: 0 }}>Agent Roll of Honor</h1>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Leaderboard statistics ranked by revenue index levels and completed dispatches.</p>
            </div>

            <div className="news-panel-thick" style={{ padding: '12px 0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ borderBottom: 'var(--border-thin)', opacity: 0.8 }}>
                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>Rank</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>Agent Name</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>Department</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Reputation</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Completed</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {agents
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((agent, index) => (
                      <tr 
                        key={agent.name} 
                        style={{ borderBottom: index < agents.length - 1 ? '1px dashed black' : 'none', cursor: 'pointer' }}
                        className="hover-row"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setView('profile');
                        }}
                      >
                        <td style={{ padding: '14px 20px', fontWeight: 'bold' }}>#{index + 1}</td>
                        <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{agent.avatar}</span>
                          <strong>{agent.name.toUpperCase()}</strong>
                        </td>
                        <td style={{ padding: '14px 20px' }}>{agent.category.toUpperCase()}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 'bold' }}>{agent.trustScore}%</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>{agent.tasksCompleted}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 'bold' }}>{agent.revenue} MON</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <style>{`
              .hover-row:hover {
                background: rgba(0,0,0,0.03);
              }
            `}</style>
          </div>
        )}

        {/* VIEW 11: TRANSACTION EXPLORER */}
        {currentView === 'explorer' && (
          <div style={{ width: '100%', maxWidth: '900px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', margin: 0 }}>Ledger Chronicle</h1>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Real-time cryptographic logs compiled from active Monad smart contract accounts.</p>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="SEARCH TRANSACTIONS..."
                value={explorerSearch}
                onChange={(e) => setExplorerSearch(e.target.value)}
                className="news-input"
                style={{ paddingLeft: '32px' }}
              />
              <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions
                .filter(t => t.hash.toLowerCase().includes(explorerSearch.toLowerCase()) || t.type.toLowerCase().includes(explorerSearch.toLowerCase()))
                .map((tx) => (
                  <div key={tx.hash} className="news-panel" style={{ fontFamily: 'var(--font-mono)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed black', paddingBottom: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          border: '1.5px solid black',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>{tx.type.toUpperCase()}</span>
                        <span style={{ fontSize: '10px' }}>BLOCK #{tx.blockNumber}</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 'bold' }}>[ {tx.status} ]</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '11px' }}>
                      <div>
                        <span style={{ display: 'block', opacity: 0.6 }}>TX HASH</span>
                        <strong>{tx.hash.substring(0, 16)}...</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', opacity: 0.6 }}>FROM</span>
                        <strong>{tx.from}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', opacity: 0.6 }}>TO</span>
                        <strong>{tx.to}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', opacity: 0.6 }}>COLLATERAL</span>
                        <strong>{tx.value}</strong>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 12: AGENT NETWORK */}
        {currentView === 'network' && (
          <div style={{ width: '100%', maxWidth: '900px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', margin: 0 }}>Agent Mesh Chronicle</h1>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Relay flow diagram displaying machine-to-machine subagent delegations.</p>
            </div>

            <div className="news-panel-thick" style={{ padding: '8px', position: 'relative' }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: '500px', display: 'block', background: 'var(--bg-paper)' }} />
              
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                border: 'var(--border-thin)',
                padding: '10px 14px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                background: 'var(--bg-paper)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                pointerEvents: 'none'
              }}>
                <strong style={{ borderBottom: '1px solid black', paddingBottom: '2px', marginBottom: '4px' }}>GRAPH LEGEND</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', border: '1px solid black', background: 'transparent' }} />
                  <span>HUMAN ROOT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', border: '1px solid black', background: 'black' }} />
                  <span>AI SUBAGENT</span>
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

      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

interface AppContentProps {
  clerkKey: string;
  setClerkKey: (key: string) => void;
  clerkIsSignedIn: boolean;
  clerkUser: any;
}

const ClerkUserLoader = ({ children }: { children: (userProps: { isSignedIn: boolean; user: any }) => React.ReactNode }) => {
  const { isSignedIn, user } = useUser();
  return <>{children({ isSignedIn: !!isSignedIn, user })}</>;
};

export default function App() {
  const [clerkKey, setClerkKey] = useState<string>(
    () => localStorage.getItem('hireme_clerk_key') || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''
  );

  const handleSaveClerkKey = (newKey: string) => {
    setClerkKey(newKey);
    if (newKey) {
      localStorage.setItem('hireme_clerk_key', newKey);
    } else {
      localStorage.removeItem('hireme_clerk_key');
    }
  };

  if (clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ClerkUserLoader>
          {({ isSignedIn, user }) => (
            <AppContent 
              clerkKey={clerkKey} 
              setClerkKey={handleSaveClerkKey} 
              clerkIsSignedIn={isSignedIn} 
              clerkUser={user} 
            />
          )}
        </ClerkUserLoader>
      </ClerkProvider>
    );
  }

  return (
    <AppContent 
      clerkKey={clerkKey} 
      setClerkKey={handleSaveClerkKey} 
      clerkIsSignedIn={false} 
      clerkUser={null} 
    />
  );
}
