import React from 'react';
import { X, FileText, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DocumentDetailsModal({ document, chunks, onClose }) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#0072CE] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#002C5F]">{document.originalName}</h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs font-semibold text-[#0072CE]">{document.vehicleModel}</span>
                <span className="text-[#CBD5E1]">•</span>
                <span className="text-[11px] text-[#16A36A] font-medium">Indexed in Vector Database</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0A192F] flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] uppercase font-bold block">Status</span>
              <span className="font-bold text-[#16A36A] mt-1 block">
                {document.processingStatus === 'Completed' ? 'Processed' : document.processingStatus}
              </span>
            </div>
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] uppercase font-bold block">Document Pages</span>
              <span className="font-bold text-[#002C5F] mt-1 block">{document.pageCount} Pages</span>
            </div>
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] uppercase font-bold block">Extracted Chunks</span>
              <span className="font-bold text-[#0072CE] mt-1 block">{document.chunkCount} Chunks</span>
            </div>
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] uppercase font-bold block">File Size</span>
              <span className="font-bold text-[#334155] mt-1 block">{(document.fileSize / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          {/* Extracted Chunks List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#002C5F] uppercase tracking-wider flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-[#0072CE]" />
                <span>Extracted Vector Chunks ({chunks.length})</span>
              </h4>
              <span className="text-[11px] text-[#64748B]">Preserved with original page numbers</span>
            </div>

            <div className="space-y-3">
              {chunks.length === 0 ? (
                <p className="text-xs text-[#94A3B8] italic p-4 bg-[#F8FAFC] rounded-xl text-center border border-[#E2E8F0]">
                  No chunks extracted or document is still processing.
                </p>
              ) : (
                chunks.map((chunk, idx) => (
                  <div key={chunk._id || idx} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                      <span className="font-bold text-[#002C5F] text-[11px]">
                        Chunk #{chunk.chunkIndex + 1}
                      </span>
                      <span className="px-2 py-0.5 bg-[#EAF4FF] text-[#0072CE] font-bold rounded-md text-[10px] border border-[#BFDBFE]">
                        Page {chunk.pageNumber}
                      </span>
                    </div>
                    <p className="text-[#334155] font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                      {chunk.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#F1F5F9] bg-[#F8FAFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#002C5F] hover:bg-[#0072CE] text-white text-xs font-bold rounded-xl transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
