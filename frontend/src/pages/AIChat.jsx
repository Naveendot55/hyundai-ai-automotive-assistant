import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  Send,
  Sparkles,
  Trash2,
  Plus,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowRight,
  Filter,
  Car,
  Compass,
  Sliders,
  CheckCircle2
} from 'lucide-react';

const SUGGESTED_CAPABILITIES = [
  {
    id: 'alcazar-feat',
    tag: 'Capability A',
    label: 'Alcazar Features',
    prompt: 'Provide a structured categorized breakdown of Hyundai Alcazar features covering engine, safety, comfort, technology, and interior.',
    model: 'Hyundai Alcazar',
    description: 'Explore engine specifications, safety features, panoramic sunroof, and Bose premium audio.',
    icon: Car
  },
  {
    id: 'alcazar-creta',
    tag: 'Capability B',
    label: 'Vehicle Comparison',
    prompt: 'Compare Hyundai Alcazar vs Hyundai Creta in a structured table covering engine, performance, safety, comfort, and seating capacity.',
    model: 'General',
    description: 'Compare Hyundai Alcazar and Creta across dimensions, engines, and seating capacities.',
    icon: Compass
  },
  {
    id: 'alcazar-var',
    tag: 'Capability C',
    label: 'Variant Comparison',
    prompt: 'Compare the different variants of Hyundai Alcazar like Prestige, Platinum, and Signature.',
    model: 'Hyundai Alcazar',
    description: 'Compare Prestige, Platinum and Signature variants with official brochure classifications.',
    icon: Sliders
  },
  {
    id: 'i20-aura',
    tag: 'Capability D',
    label: 'Vehicle Recommendation',
    prompt: 'I need a vehicle for city driving with occasional long trips carrying family luggage. Recommend whether I should choose Hyundai i20 or Hyundai Aura with justifications.',
    model: 'General',
    description: 'Compare i20 and Aura for city commuting, boot capacity (311L vs 402L), and family requirements.',
    icon: Sparkles
  }
];

export default function AIChat() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(
    sessionStorage.getItem('hyundai_active_conv_id') || null
  );
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModelFilter, setSelectedModelFilter] = useState('');
  const [expandedSources, setExpandedSources] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    fetchConversations();
    if (location.state?.initialPrompt) {
      handleSendMessage(null, location.state.initialPrompt);
    }
  }, [location.state]);

  useEffect(() => {
    const savedConvId = sessionStorage.getItem('hyundai_active_conv_id');
    if (savedConvId) {
      loadConversation(savedConvId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/history');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  const loadConversation = async (convId) => {
    if (!convId) return;
    try {
      setLoading(true);
      const res = await api.get(`/chat/history?conversationId=${convId}`);
      if (res.data?.conversation) {
        setCurrentConvId(res.data.conversation._id);
        sessionStorage.setItem('hyundai_active_conv_id', res.data.conversation._id);
        setMessages(res.data.conversation.messages || []);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      sessionStorage.removeItem('hyundai_active_conv_id');
      setCurrentConvId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    sessionStorage.removeItem('hyundai_active_conv_id');
    setCurrentConvId(null);
    setMessages([]);
    setInputMessage('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/history/${convId}`);
      setConversations(prev => prev.filter(c => c._id !== convId));
      if (currentConvId === convId) {
        handleNewChat();
      }
    } catch (err) {
      alert('Failed to delete chat: ' + err.message);
    }
  };

  const handleSendMessage = async (e, customText = null, customModel = null) => {
    if (e) e.preventDefault();
    const queryText = (customText || inputMessage).trim();
    if (!queryText || loading || isSendingRef.current) return;

    setInputMessage('');
    isSendingRef.current = true;

    // Append user message immediately
    const userMsg = {
      role: 'user',
      content: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const payload = {
        message: queryText,
        conversationId: currentConvId,
        vehicleModelFilter: customModel !== undefined && customModel !== null
          ? customModel
          : (selectedModelFilter || null)
      };

      const res = await api.post('/chat', payload);

      if (res.data.success) {
        const assistantMsg = res.data.response;
        setMessages(prev => [...prev, assistantMsg]);
        if (res.data.conversationId) {
          setCurrentConvId(res.data.conversationId);
          sessionStorage.setItem('hyundai_active_conv_id', res.data.conversationId);
          fetchConversations();
        }
      }
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `**Notice:** ${err.response?.data?.message || 'Failed to complete RAG consultation. Please check server connectivity.'}`,
        sources: []
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      isSendingRef.current = false;
    }
  };

  const handleSelectCapability = (cap) => {
    handleSendMessage(null, cap.prompt, cap.model !== 'General' ? cap.model : null);
  };

  const toggleSourceExpand = (msgIndex) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgIndex]: !prev[msgIndex]
    }));
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-11rem)] min-h-[620px] rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden bg-white font-sans">

        {/* Left Sidebar: Consultation History & Vehicle Scoping */}
        <div className="w-80 bg-[#FAFCFF] border-r border-[#E2E8F0] flex flex-col hidden md:flex">

          {/* New Consultation Action */}
          <div className="p-4 border-b border-[#F1F5F9]">
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-4 bg-[#002C5F] hover:bg-[#0072CE] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Consultation</span>
            </button>
          </div>

          {/* Vehicle Model Scoping Filter */}
          <div className="p-3.5 border-b border-[#F1F5F9] text-xs">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5 mb-1.5">
              <Filter className="w-3 h-3 text-[#0072CE]" />
              <span>Vehicle Scoping Filter</span>
            </label>
            <select
              value={selectedModelFilter}
              onChange={(e) => setSelectedModelFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#334155] focus:outline-none focus:border-[#0072CE]"
            >
              <option value="">Auto-Detect Model</option>
              <option value="Hyundai Alcazar">Hyundai Alcazar</option>
              <option value="Hyundai Creta">Hyundai Creta</option>
              <option value="Hyundai i20">Hyundai i20</option>
              <option value="Hyundai Aura">Hyundai Aura</option>
            </select>
          </div>

          {/* Recent Consultations List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 block mb-1.5 font-mono">
              Consultation History
            </span>
            {conversations.length === 0 ? (
              <p className="text-xs text-[#94A3B8] px-2 italic py-4">No past consultations</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => loadConversation(conv._id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition ${currentConvId === conv._id
                      ? 'bg-[#EAF4FF] text-[#0072CE] font-bold border-l-3 border-[#0072CE]'
                      : 'text-[#475569] hover:text-[#002C5F] hover:bg-white'
                    }`}
                >
                  <div className="truncate flex-1 pr-2">
                    <p className="truncate font-semibold">{conv.title}</p>
                    <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                      {new Date(conv.updatedAt).toLocaleDateString()} • {conv.messageCount} messages
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-[#94A3B8] rounded transition"
                    title="Delete Consultation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">

          {/* Header */}
          <div className="px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#002C5F] text-white flex items-center justify-center font-black text-lg">
                H
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-sm font-bold text-[#002C5F]">
                    Hyundai AI Consultant
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#ECFDF5] text-[#065F46] rounded-full border border-[#A7F3D0] flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    <span>Grounded RAG</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Answers strictly grounded in official Hyundai brochures • Zero assumptions
                </p>
              </div>
            </div>

            <button
              onClick={handleNewChat}
              className="text-xs font-semibold text-[#475569] hover:text-[#002C5F] px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition md:hidden"
            >
              New Chat
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FAFCFF]/50">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto py-8 text-center space-y-6">

                {/* Visual Header */}
                <div className="w-14 h-14 rounded-2xl bg-[#EAF4FF] text-[#0072CE] border border-[#BFDBFE] flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#002C5F] tracking-tight">
                    Your Hyundai Expert Assistant
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-lg mx-auto leading-relaxed">
                    Ask anything about Hyundai vehicles. Compare specifications, explore variants and find the right vehicle for your needs.
                  </p>
                </div>

                {/* 4 Core Capability Cards (Shown Only Once) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
                  {SUGGESTED_CAPABILITIES.map((cap) => {
                    const Icon = cap.icon;
                    return (
                      <button
                        key={cap.id}
                        onClick={() => handleSelectCapability(cap)}
                        disabled={loading}
                        className="p-4 bg-white hover:bg-[#F0F7FF] border border-[#E2E8F0] hover:border-[#0072CE] rounded-xl text-xs transition-all text-left group shadow-xs hover:shadow-xs cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#EAF4FF] text-[#0072CE] rounded-md">
                              {cap.tag}
                            </span>
                            <span className="text-[11px] font-semibold text-[#0072CE] flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                              <span>Ask Assistant</span>
                              <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition" />
                            </span>
                          </div>

                          <div className="flex items-start space-x-2.5 mt-2">
                            <Icon className="w-4 h-4 text-[#0072CE] flex-shrink-0 mt-0.5" />
                            <span className="font-bold text-[#002C5F] group-hover:text-[#0072CE] transition">
                              {cap.label}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
                            {cap.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <span className="text-[10px] font-bold text-[#94A3B8] px-1">
                      {isUser ? 'You' : 'Hyundai AI Consultant'}
                    </span>

                    <div
                      className={`max-w-3xl rounded-2xl px-5 py-4 text-xs sm:text-sm leading-relaxed ${isUser
                          ? 'bg-[#0072CE] text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-xs shadow-xs'
                        }`}
                    >
                      {/* Markdown Body */}
                      <div className="prose prose-sm max-w-none text-xs sm:text-sm leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-3 rounded-xl border border-[#CBD5E1]">
                                <table className="min-w-full text-xs" {...props} />
                              </div>
                            ),
                            thead: ({ node, ...props }) => (
                              <thead className="bg-[#F1F5F9] text-[#002C5F] font-bold border-b border-[#CBD5E1]" {...props} />
                            ),
                            th: ({ node, ...props }) => (
                              <th className="px-3.5 py-2 text-left" {...props} />
                            ),
                            td: ({ node, ...props }) => (
                              <td className="border-t border-[#E2E8F0] px-3.5 py-2 text-[#334155]" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-sm font-bold text-[#002C5F] mt-3 mb-1.5" {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                              <h4 className="text-xs font-bold text-[#334155] mt-2.5 mb-1" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong className="text-[#002C5F] font-bold" {...props} />
                            ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-l-3 border-[#0072CE] pl-3 my-2 text-[#475569] bg-[#F8FAFC] py-1.5 rounded-r-lg" {...props} />
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Source Citations Drawer */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                          <button
                            onClick={() => toggleSourceExpand(index)}
                            className="flex items-center space-x-2 text-[11px] font-bold text-[#0072CE] hover:text-[#002C5F] transition"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#0072CE]" />
                            <span>Grounded in {msg.sources.length} Verified Brochure Excerpts</span>
                            {expandedSources[index] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {expandedSources[index] && (
                            <div className="mt-2.5 space-y-2 animate-in fade-in duration-150">
                              {msg.sources.map((src, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-[11px] space-y-1"
                                >
                                  <div className="flex items-center justify-between font-semibold">
                                    <span className="text-[#002C5F] flex items-center space-x-1.5">
                                      <FileText className="w-3.5 h-3.5 text-[#0072CE]" />
                                      <span>{src.documentName}</span>
                                    </span>
                                    <span className="px-2 py-0.5 bg-[#EAF4FF] text-[#0072CE] font-bold rounded text-[10px] border border-[#BFDBFE]">
                                      Page {src.pageNumber}
                                    </span>
                                  </div>
                                  <p className="text-[#64748B] font-mono text-[10px] leading-relaxed">
                                    {src.chunkText}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-[#002C5F] text-white flex items-center justify-center font-bold text-xs">
                  H
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs text-xs text-[#64748B] flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#0072CE] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-[#0072CE] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-[#0072CE] rounded-full animate-bounce" />
                  </div>
                  <span>Searching brochure knowledge base & generating grounded consultation...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-[#E2E8F0]">
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="flex items-center space-x-2">
                {/* Inline Vehicle Model Selector */}
                <select
                  value={selectedModelFilter}
                  onChange={(e) => setSelectedModelFilter(e.target.value)}
                  className="px-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#0072CE]"
                >
                  <option value="">Auto-Detect Model</option>
                  <option value="Hyundai Alcazar">Hyundai Alcazar</option>
                  <option value="Hyundai Creta">Hyundai Creta</option>
                  <option value="Hyundai i20">Hyundai i20</option>
                  <option value="Hyundai Aura">Hyundai Aura</option>
                </select>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about Hyundai vehicles, features or comparisons..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs sm:text-sm text-[#0A192F] placeholder-[#94A3B8] focus:outline-none focus:border-[#0072CE] focus:bg-white transition"
                />

                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="px-5 py-2.5 bg-[#002C5F] hover:bg-[#0072CE] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
