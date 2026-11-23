import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  History, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Consultant', href: '/chat', icon: MessageSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
  ];

  const secondaryNav = [
    { 
      name: 'Consultation History', 
      icon: History, 
      action: () => navigate('/chat') 
    },
    { 
      name: 'System Settings', 
      icon: Settings, 
      action: () => setIsSettingsOpen(true) 
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0A192F] flex font-sans">
      
      {/* Desktop Vertical White Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E2E8F0] flex-col justify-between fixed inset-y-0 left-0 z-30 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        <div>
          {/* Brand Header */}
          <div className="h-18 px-6 flex items-center space-x-3.5 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-[#002C5F] text-white flex items-center justify-center font-black text-xl tracking-tight shadow-sm">
              H
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#002C5F] block leading-tight">
                HYUNDAI
              </span>
              <span className="text-[11px] font-semibold text-[#0072CE] tracking-wider uppercase">
                AI Intelligence Studio
              </span>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <div className="px-3 py-6 space-y-1">
            <span className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-2 font-mono">
              Main Menu
            </span>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-[#EAF4FF] text-[#0072CE] font-bold shadow-xs'
                      : 'text-[#475569] hover:text-[#002C5F] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#0072CE]' : 'text-[#64748B]'}`} />
                  <span>{item.name}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0072CE]"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary Utilities */}
          <div className="px-3 pt-2 space-y-1 border-t border-[#F1F5F9]">
            <span className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-2 font-mono">
              Workspace & Systems
            </span>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#002C5F] hover:bg-[#F8FAFC] transition-all text-left"
                >
                  <Icon className="w-4 h-4 text-[#64748B]" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile & Sign Out at bottom of sidebar */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFCFF]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-9 h-9 rounded-full bg-[#EAF4FF] text-[#0072CE] border border-[#BFDBFE] flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#0A192F] truncate">
                  {user?.name || 'Automotive Specialist'}
                </p>
                <span className="text-[10px] text-[#64748B] block truncate">
                  {user?.email || 'demo@hyundai-ai.com'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-rose-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (With left margin for sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#475569] hover:text-[#002C5F] hover:bg-[#F1F5F9] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Context Heading */}
            <div className="flex items-center space-x-2 text-xs font-medium text-[#64748B]">
              <span className="text-[#002C5F] font-bold">Hyundai AI</span>
              <span>/</span>
              <span className="text-[#0A192F] capitalize">
                {location.pathname.replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Header Badges and Utilities */}
          <div className="flex items-center space-x-3">
            {/* RAG Engine Status Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-medium text-[#065F46]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              <span>RAG Knowledge Base Active</span>
            </div>

            {/* Notifications Button */}
            <button 
              onClick={() => alert('All systems operational. Vector search indexes synchronized.')}
              className="p-2 text-[#64748B] hover:text-[#002C5F] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition relative"
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0072CE]"></span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#002C5F] text-white flex items-center justify-center font-bold text-base">
                      H
                    </div>
                    <span className="font-bold text-sm text-[#002C5F]">Hyundai AI Studio</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-[#64748B] hover:text-[#0A192F]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          active
                            ? 'bg-[#EAF4FF] text-[#0072CE] font-bold'
                            : 'text-[#475569]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1F5F9]">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 text-xs font-semibold text-rose-600 p-2 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Clean Enterprise Footer */}
        <footer className="bg-white border-t border-[#E2E8F0] py-4 px-4 sm:px-8 text-xs text-[#64748B]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#002C5F]">Hyundai AI Intelligence Studio</span>
              <span>•</span>
              <span>Automotive RAG Knowledge Assistant</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Powered by MongoDB Atlas Vector Search & Google Gemini AI
            </p>
          </div>
        </footer>

      </div>

      {/* System Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center space-x-2 text-[#002C5F] font-bold text-sm">
                <Settings className="w-4 h-4 text-[#0072CE]" />
                <span>System Architecture Configuration</span>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-[#94A3B8] hover:text-[#0A192F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#475569]">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#002C5F] block">Vector Embeddings</span>
                <p>Model: <code className="text-[#0072CE] font-mono">gemini-embedding-001</code></p>
                <p>Dimensions: <code className="font-mono">768 (Matryoshka Representation Learning)</code></p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#002C5F] block">Vector Database</span>
                <p>Engine: <code className="text-[#0072CE] font-mono">MongoDB Atlas Vector Search</code></p>
                <p>Index Name: <code className="font-mono">vector_index</code></p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#002C5F] block">Generative Synthesis</span>
                <p>Model: <code className="text-[#0072CE] font-mono">gemini-1.5-flash</code></p>
                <p>Hallucination Policy: <code className="font-mono text-emerald-600">Zero Hallucination Grounding</code></p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-[#002C5F] hover:bg-[#0072CE] text-white rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
