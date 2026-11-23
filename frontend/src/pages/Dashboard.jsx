import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Database,
  UploadCloud,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Search,
  Layers,
  Car,
  Compass,
  Sliders,
  ShieldCheck,
  Zap,
  ExternalLink,
  Info
} from 'lucide-react';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [docsRes, chatRes] = await Promise.allSettled([
        api.get('/documents'),
        api.get('/chat/history')
      ]);

      if (docsRes.status === 'fulfilled') {
        setDocuments(docsRes.value.data.documents || []);
      }
      if (chatRes.status === 'fulfilled') {
        setConversations(chatRes.value.data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalDocs = documents.length;
  const completedDocs = documents.filter(d => d.processingStatus === 'Completed').length;
  const processingDocs = documents.filter(d => d.processingStatus === 'Processing' || d.processingStatus === 'Uploaded').length;
  const totalChunks = documents.reduce((acc, curr) => acc + (curr.chunkCount || 0), 0);

  const capabilities = [
    {
      id: 'alcazar-feat',
      title: 'Alcazar Specifications & Features',
      tag: 'Capability A',
      badge: 'Single Model RAG',
      image: '/images/alcazar-features.jpg',
      desc: 'Explore comprehensive Hyundai Alcazar engineering specifications covering engine output, safety standards, cabin comfort, infotainment, and interior appointments.',
      highlight: 'Engine • Safety • Infotainment • Comfort',
      prompt: 'Provide a structured categorized breakdown of Hyundai Alcazar features covering engine, safety, comfort, technology, and interior.',
      icon: Car
    },
    {
      id: 'alcazar-creta',
      title: 'Alcazar vs Creta Comparison',
      tag: 'Capability B',
      badge: 'Cross-Brochure RAG',
      image: '/images/alcazar-vs-creta.jpg',
      desc: 'Perform a direct side-by-side comparison between Hyundai Alcazar and Hyundai Creta across exterior dimensions, powertrain options, seating rows, and cargo space.',
      highlight: 'Dimensions • Seating Rows • Engines',
      prompt: 'Compare Hyundai Alcazar vs Hyundai Creta in a structured table covering engine, performance, safety, comfort, and seating capacity.',
      icon: Compass
    },
    {
      id: 'alcazar-var',
      title: 'Variant Matrix: Prestige, Platinum, Signature',
      tag: 'Capability C',
      badge: 'Trim Matrix RAG',
      image: '/images/variant-matrix.jpg',
      desc: 'Analyze Hyundai Alcazar trim hierarchy. Compare Prestige, Platinum, and Signature variants with official brochure classifications and feature deltas.',
      highlight: 'Prestige • Platinum • Signature',
      prompt: 'Compare the different variants of Hyundai Alcazar like Prestige, Platinum, and Signature.',
      icon: Sliders
    },
    {
      id: 'i20-aura',
      title: 'i20 vs Aura Commuter Recommendation',
      tag: 'Capability D',
      badge: 'Advisory RAG',
      image: '/images/i20-aura-recommendation.jpg',
      desc: 'Receive tailored vehicle recommendations between Hyundai i20 hatchback and Hyundai Aura compact sedan based on boot capacity (311L vs 402L), mileage, and city driving.',
      highlight: 'City Agility • 311L vs 402L Boot • Commute',
      prompt: 'I need a vehicle for city driving with occasional long trips carrying family luggage. Recommend whether I should choose Hyundai i20 or Hyundai Aura with justifications.',
      icon: Sparkles
    }
  ];

  const handleLaunchPrompt = (promptText) => {
    navigate('/chat', { state: { initialPrompt: promptText } });
  };

  const handleOpenConversation = (convId) => {
    sessionStorage.setItem('hyundai_active_conv_id', convId);
    navigate('/chat');
  };

  return (
    <Layout>
      <div className="space-y-8 font-sans pb-6">
        
        {/* TOP SECTION: Professional Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0072CE]"></span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#002C5F] tracking-tight">
                Hyundai AI Intelligence Studio
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium pl-5">
              Automotive Engineering Knowledge Base & Vector Search Platform
            </p>
          </div>

          {/* Quick Search */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ask about Alcazar, Creta, i20 or Aura..."
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && dashboardSearch.trim()) {
                    handleLaunchPrompt(dashboardSearch.trim());
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] placeholder-[#94A3B8] focus:outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#EAF4FF] shadow-xs transition"
              />
            </div>
          </div>
        </div>

        {/* 1. HERO SECTION: Light Blue Gradient with Vehicle Image & Prominent Actions */}
        <div className="bg-gradient-to-br from-[#EBF3FE] via-[#F4F9FF] to-[#E2EFFF] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#BFDBFE] shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 z-10">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFFFFF] text-[#0072CE] border border-[#BFDBFE] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0072CE]" />
                <span>Hyundai Intelligent Assistant • 2026 Fleet Intelligence</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#002C5F] leading-tight">
                Explore Hyundai Engineering. Grounded In Real Brochures.
              </h2>

              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xl">
                Experience next-generation automotive AI. Query complete technical specifications, compare models and trims, and receive grounded purchasing advice supported by official engineering brochures and high-dimensional vector search.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/chat"
                  className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-[#0072CE] hover:bg-[#005FA8] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start AI Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/documents"
                  className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#002C5F] text-xs sm:text-sm font-bold border border-[#CBD5E1] shadow-xs hover:border-[#0072CE] transition-all"
                >
                  <UploadCloud className="w-4 h-4 text-[#0072CE]" />
                  <span>Manage Documents</span>
                </Link>
              </div>

              {/* Verification Pills */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-[#64748B] font-medium">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span>Atlas Vector Search Active</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0072CE]" />
                  <span>Verified Page Citations</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Gemini AI Embeddings</span>
                </span>
              </div>
            </div>

            {/* Right Automotive Hero Image */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-none group">
                <div className="relative rounded-2xl overflow-hidden border border-[#BFDBFE] bg-white shadow-md transition-all duration-300 group-hover:shadow-xl">
                  <img
                    src="/images/hyundai-suv-hero.jpg"
                    alt="Hyundai Premium SUV"
                    className="w-full h-56 sm:h-64 lg:h-72 object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/images/alcazar-features.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                  
                  {/* Floating Model Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/50 text-xs">
                    <div>
                      <p className="font-extrabold text-[#002C5F]">Hyundai Alcazar & Fleet</p>
                      <p className="text-[10px] text-[#64748B]">Premium 6/7-Seater Luxury SUV</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EAF4FF] text-[#0072CE] border border-[#BFDBFE]">
                      2026 Model
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 2. STATISTICS GRID: Four Visually Prominent Cards */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Stat Card 1: Total Brochures */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#0072CE] transition flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Total Brochures
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-[#002C5F] mt-2">
                  {totalDocs}
                </h3>
                <span className="text-xs text-[#0072CE] mt-1 block font-medium flex items-center space-x-1">
                  <span>Official PDF catalogs</span>
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#EAF4FF] text-[#0072CE] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <FileText className="w-7 h-7" />
              </div>
            </div>

            {/* Stat Card 2: Processed Documents */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#16A36A] transition flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Indexed Documents
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-[#16A36A] mt-2">
                  {completedDocs}
                </h3>
                <span className="text-xs text-[#16A36A] mt-1 block font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline" />
                  <span>Ready for AI retrieval</span>
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#16A36A] border border-[#A7F3D0] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>

            {/* Stat Card 3: Knowledge Chunks */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#0072CE] transition flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Knowledge Chunks
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-[#0072CE] mt-2">
                  {totalChunks}
                </h3>
                <span className="text-xs text-[#64748B] mt-1 block font-medium">
                  768-dim vector embeddings
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#0072CE] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Database className="w-7 h-7" />
              </div>
            </div>

            {/* Stat Card 4: Processing Queue */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#F59E0B] transition flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Pipeline Queue
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-[#F59E0B] mt-2">
                  {processingDocs}
                </h3>
                <span className="text-xs text-[#64748B] mt-1 block font-medium">
                  {processingDocs === 0 ? 'Idle (All Indexed)' : 'Processing chunks'}
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Clock className="w-7 h-7" />
              </div>
            </div>

          </div>
        </div>

        {/* 3. AUTOMOTIVE AI CAPABILITIES: 4 Redesigned Cards with Vehicle Images */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#002C5F] tracking-tight">
                Automotive AI Capabilities
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Directly launch grounded RAG consultations supported by official Hyundai technical brochures.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#0072CE]">
              Click any card to launch inquiry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.id}
                  onClick={() => handleLaunchPrompt(cap.prompt)}
                  className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-lg hover:border-[#0072CE] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#F1F5F9]">
                    <img
                      src={cap.image}
                      alt={cap.title}
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-white/95 text-[#002C5F] shadow-xs">
                        {cap.tag}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#002C5F]/80 text-white backdrop-blur-xs">
                        {cap.badge}
                      </span>
                    </div>

                    {/* Bottom overlay highlight */}
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white">
                      <span className="text-[11px] font-semibold tracking-wide drop-shadow-sm">
                        {cap.highlight}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EAF4FF] text-[#0072CE] group-hover:bg-[#0072CE] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors duration-200 mt-0.5">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-[#002C5F] group-hover:text-[#0072CE] transition-colors leading-snug">
                            {cap.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-[#475569] mt-1.5 leading-relaxed">
                            {cap.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0072CE] group-hover:text-[#002C5F] transition flex items-center space-x-1.5">
                        <span>Explore Capability</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="text-[11px] font-medium text-[#94A3B8] bg-[#F8FAFC] px-2.5 py-1 rounded-lg">
                        Grounded Verification
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* 4. RECENT ACTIVITY: Balanced Documents Table & Consultations List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Recent Documents Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-[#F1F5F9] flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EAF4FF] text-[#0072CE] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#002C5F] tracking-tight">
                    Recent Vehicle Documents
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Active brochures indexed in vector search
                  </p>
                </div>
              </div>
              <Link
                to="/documents"
                className="text-xs font-bold text-[#0072CE] hover:text-[#002C5F] flex items-center space-x-1 transition"
              >
                <span>View All ({totalDocs})</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#94A3B8]">
                <FileText className="w-10 h-10 text-[#CBD5E1] mx-auto mb-2" />
                <p className="font-semibold text-[#64748B]">No brochures uploaded yet.</p>
                <p className="text-[11px] mt-1">Upload PDF brochures in Document Management to start indexing.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#F1F5F9]">
                    <tr>
                      <th className="px-5 py-3.5">Document Name</th>
                      <th className="px-5 py-3.5">Vehicle Model</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Upload Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                    {documents.slice(0, 4).map((doc) => (
                      <tr key={doc._id} className="hover:bg-[#F8FAFC] transition">
                        <td className="px-5 py-3.5 font-medium text-[#0A192F] max-w-[200px] truncate" title={doc.originalName}>
                          {doc.originalName}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#002C5F]">
                          <span className="px-2.5 py-1 rounded-lg bg-[#EAF4FF] text-[#002C5F] border border-[#BFDBFE]">
                            {doc.vehicleModel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            doc.processingStatus === 'Completed'
                              ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                              : doc.processingStatus === 'Failed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doc.processingStatus === 'Completed' ? 'bg-[#10B981]' : 'bg-amber-500'
                            }`}></span>
                            <span>{doc.processingStatus === 'Completed' ? 'Processed' : doc.processingStatus}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#64748B] text-[11px]">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Consultations List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-[#F1F5F9] flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EAF4FF] text-[#0072CE] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#002C5F] tracking-tight">
                    Recent Consultations
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Previous AI sessions and queries
                  </p>
                </div>
              </div>
              <Link
                to="/chat"
                className="text-xs font-bold text-[#0072CE] hover:text-[#002C5F] flex items-center space-x-1 transition"
              >
                <span>Open Chat</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-3.5 divide-y divide-[#F1F5F9] overflow-y-auto max-h-[300px] flex-1">
              {conversations.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#94A3B8]">
                  <MessageSquare className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                  <p className="font-semibold text-[#64748B]">No recent consultations.</p>
                  <p className="text-[11px] mt-1">Start a conversation with the AI Consultant to ask any vehicle question.</p>
                </div>
              ) : (
                conversations.slice(0, 4).map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => handleOpenConversation(conv._id)}
                    className="py-3 px-3.5 rounded-xl hover:bg-[#F8FAFC] cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex-1 pr-3">
                      <p className="text-xs font-semibold text-[#0A192F] group-hover:text-[#0072CE] transition line-clamp-2 leading-snug">
                        {conv.title}
                      </p>
                      <span className="text-[10px] text-[#94A3B8] block mt-1">
                        {new Date(conv.updatedAt).toLocaleDateString()} • {conv.messageCount} messages
                      </span>
                    </div>
                    <button
                      className="px-3 py-1.5 text-[11px] font-bold text-[#0072CE] bg-[#EAF4FF] rounded-lg group-hover:bg-[#0072CE] group-hover:text-white transition flex items-center space-x-1 flex-shrink-0"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
}
