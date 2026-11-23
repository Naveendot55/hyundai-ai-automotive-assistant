import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import DocumentDetailsModal from '../components/DocumentDetailsModal';
import api from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search,
  RefreshCw,
  X,
  FileUp,
  Database,
  Filter,
  Plus
} from 'lucide-react';

const HYUNDAI_MODELS = [
  'Hyundai Alcazar',
  'Hyundai Creta',
  'Hyundai i20',
  'Hyundai Aura',
  'Hyundai Venue',
  'Hyundai Verna',
  'Hyundai Tucson',
  'Hyundai Ioniq 5',
  'General'
];

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [vehicleModel, setVehicleModel] = useState('Hyundai Alcazar');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Filtering
  const [modelFilter, setModelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [selectedDocDetails, setSelectedDocDetails] = useState(null);
  const [docChunks, setDocChunks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only official Hyundai PDF brochures (.pdf) are supported.');
      setSelectedFile(null);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds maximum 25 MB limit.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select or drop a PDF brochure first.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('brochure', selectedFile);
      formData.append('vehicleModel', vehicleModel);

      // sync=true executes parsing and embedding immediately
      const res = await api.post('/documents/upload?sync=true', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadSuccess(`"${res.data.document.originalName}" was successfully processed and indexed into vector search!`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload and process PDF brochure.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"?\n\nThis will trigger cascading deletion to remove all associated vector chunks from the database.`)) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
      if (selectedDocDetails && selectedDocDetails._id === id) {
        setIsModalOpen(false);
      }
    } catch (err) {
      alert('Error deleting document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/documents/${id}`);
      setSelectedDocDetails(res.data.document);
      setDocChunks(res.data.chunks || []);
      setIsModalOpen(true);
    } catch (err) {
      alert('Failed to retrieve document details: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Filtered documents
  const filteredDocuments = documents.filter(doc => {
    const matchesModel = !modelFilter || doc.vehicleModel === modelFilter;
    const matchesStatus = !statusFilter || doc.processingStatus === statusFilter;
    const matchesSearch = !searchTerm || 
      doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModel && matchesStatus && matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-8 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002C5F] tracking-tight">
              Document Management
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
              Manage your Hyundai vehicle brochures and knowledge base.
            </p>
          </div>

          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0072CE]' : 'text-[#64748B]'}`} />
            <span>Sync Documents</span>
          </button>
        </div>

        {/* UPLOAD SECTION: Large White Drag-and-Drop Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#0072CE] flex items-center justify-center flex-shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#002C5F] tracking-tight">
                Upload Hyundai Brochure
              </h2>
              <p className="text-xs text-[#64748B]">
                Upload official PDF brochures to extract, chunk, and index into the vector search knowledge base.
              </p>
            </div>
          </div>

          {/* Alert notifications */}
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Vehicle Model Selector */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Vehicle Model
                </label>
                <select
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0A192F] focus:outline-none focus:border-[#0072CE] focus:bg-white focus:ring-1 focus:ring-[#0072CE] transition"
                >
                  {HYUNDAI_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="text-[11px] text-[#94A3B8] block">
                  Associates extracted vector chunks with this vehicle for accurate scoping.
                </span>
              </div>

              {/* Drag-and-Drop Area */}
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  PDF Brochure Document
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[#0072CE] bg-[#EAF4FF]'
                      : 'border-[#CBD5E1] hover:border-[#0072CE] bg-[#F8FAFC]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#CBD5E1] text-left">
                      <div className="flex items-center space-x-3 truncate">
                        <FileText className="w-6 h-6 text-[#0072CE] flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-[#0A192F] truncate">{selectedFile.name}</p>
                          <span className="text-[11px] text-[#64748B]">
                            {formatFileSize(selectedFile.size)} • PDF Document
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-1 text-[#94A3B8] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileUp className="w-8 h-8 text-[#0072CE] mx-auto" />
                      <div className="text-xs text-[#334155]">
                        <span className="font-bold text-[#0072CE]">Click to browse</span> or drag and drop your Hyundai brochure here
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">
                        PDF format up to 25 MB supported
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#002C5F] hover:bg-[#0072CE] text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing & Indexing Chunks...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload and Process</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* DOCUMENT TABLE SECTION */}
        <div className="space-y-4">
          
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 w-full sm:w-auto items-center space-x-2.5 bg-[#F8FAFC] border border-[#CBD5E1] px-3.5 py-2 rounded-xl text-xs">
              <Search className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search documents by name or vehicle model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-[#0A192F] placeholder-[#94A3B8] text-xs"
              />
            </div>

            <div className="flex w-full sm:w-auto space-x-2">
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#0072CE]"
              >
                <option value="">All Vehicles</option>
                {HYUNDAI_MODELS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#0072CE]"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Processed</option>
                <option value="Processing">Processing</option>
                <option value="Uploaded">Uploaded</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-2 border-[#0072CE] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#64748B]">Loading document database...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-16 text-center">
                <FileText className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#002C5F]">No Matching Documents</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Upload a PDF brochure above to add official specifications to the knowledge base.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-6 py-4">Document Name</th>
                      <th className="px-6 py-4">Vehicle Model</th>
                      <th className="px-6 py-4">File Size</th>
                      <th className="px-6 py-4">Pages</th>
                      <th className="px-6 py-4">Knowledge Chunks</th>
                      <th className="px-6 py-4">Upload Date</th>
                      <th className="px-6 py-4">Processing Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc._id} className="hover:bg-[#F8FAFC] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2.5">
                            <FileText className="w-4 h-4 text-[#0072CE] flex-shrink-0" />
                            <span className="font-semibold text-[#0A192F] truncate max-w-xs" title={doc.originalName}>
                              {doc.originalName}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-bold text-[#002C5F]">
                          {doc.vehicleModel}
                        </td>

                        <td className="px-6 py-4 text-[#64748B]">
                          {formatFileSize(doc.fileSize)}
                        </td>

                        <td className="px-6 py-4 text-[#64748B]">
                          {doc.pageCount} pgs
                        </td>

                        <td className="px-6 py-4 font-semibold text-[#0072CE]">
                          {doc.chunkCount} chunks
                        </td>

                        <td className="px-6 py-4 text-[#64748B]">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            doc.processingStatus === 'Completed'
                              ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                              : doc.processingStatus === 'Failed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {doc.processingStatus === 'Completed' && <CheckCircle2 className="w-3 h-3 text-[#10B981]" />}
                            {doc.processingStatus === 'Failed' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                            {(doc.processingStatus === 'Processing' || doc.processingStatus === 'Uploaded') && (
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            )}
                            <span>{doc.processingStatus === 'Completed' ? 'Processed' : doc.processingStatus}</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(doc._id)}
                              className="p-1.5 text-[#64748B] hover:text-[#0072CE] hover:bg-[#EAF4FF] rounded-lg transition"
                              title="View Document Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc._id, doc.originalName)}
                              className="p-1.5 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Details Modal */}
      {isModalOpen && (
        <DocumentDetailsModal
          document={selectedDocDetails}
          chunks={docChunks}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Layout>
  );
}
