import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Info,
  Loader2,
  ChevronRight,
  FileSearch,
  ShieldAlert,
  ArrowRight,
  Fingerprint,
  Cpu,
  Lock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { analyzeDocument, AnalysisResult } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      let analysisInput: { text?: string; fileData?: { data: string; mimeType: string } } = {};

      if (activeTab === 'text') {
        if (!inputText.trim()) {
          throw new Error("Please provide document text for analysis.");
        }
        analysisInput = { text: inputText };
      } else {
        if (!file) {
          throw new Error("Please select a file to check.");
        }
        
        // Read file as base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        analysisInput = { 
          fileData: { 
            data: base64Data, 
            mimeType: file.type || "application/pdf" 
          } 
        };
      }

      const analysis = await analyzeDocument(analysisInput, "certificate");
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-600 w-6 h-6" />
            <span className="text-xl font-bold text-slate-900">VeriTrust AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it works</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-12 relative">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight"
            >
              Fake Document Detector
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Check if an academic certificate or resume is real or fake. 
              Upload a file or paste text below to start the verification.
            </motion.p>
          </div>

          {/* Analysis Section */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <div className="flex border-b border-slate-100">
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className={cn(
                      "flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2",
                      activeTab === 'upload' ? "bg-white text-blue-600 border-b-2 border-blue-600" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                  <button 
                    onClick={() => setActiveTab('text')}
                    className={cn(
                      "flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2",
                      activeTab === 'text' ? "bg-white text-blue-600 border-b-2 border-blue-600" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Paste Text
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'upload' ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.jpg,.png"
                      />
                      <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="text-blue-600 w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {file ? file.name : "Select a file to check"}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Supports PDF, Word, and Images
                      </p>
                    </div>
                  ) : (
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste the document text here..."
                      className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm"
                    />
                  )}

                  <div className="mt-6">
                    <button 
                      onClick={startAnalysis}
                      disabled={isAnalyzing || (activeTab === 'upload' && !file) || (activeTab === 'text' && !inputText)}
                      className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Checking Document...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          Start Verification
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  What we check
                </h3>
                <ul className="space-y-3">
                  {[
                    "Date consistency",
                    "Formatting errors",
                    "Logical anomalies",
                    "Verification markers"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm">
                <Lock className="w-8 h-8 mb-3 text-blue-400" />
                <h4 className="text-lg font-bold mb-1">Privacy First</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We don't store your documents. Analysis is done securely and deleted immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-12 bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex items-center gap-4 shadow-sm"
              >
                <div className="bg-rose-100 p-2 rounded-xl">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                </div>
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-20 space-y-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-grow bg-slate-200" />
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Verification Report</h2>
                  <div className="h-px flex-grow bg-slate-200" />
                </div>

                {/* Main Score Card */}
                <div className={cn(
                  "p-10 rounded-[2.5rem] border-2 shadow-2xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden",
                  result.isAuthentic ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                )}>
                  {/* Background Accents */}
                  <div className={cn(
                    "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20",
                    result.isAuthentic ? "bg-emerald-400" : "bg-rose-400"
                  )} />

                  <div className="relative w-48 h-48 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className={result.isAuthentic ? "text-emerald-100" : "text-rose-100"}
                      />
                      <motion.circle
                        initial={{ strokeDashoffset: 553 }}
                        animate={{ strokeDashoffset: 553 - (553 * result.confidenceScore) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={553}
                        className={result.isAuthentic ? "text-emerald-500" : "text-rose-500"}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-slate-900 leading-none">{result.confidenceScore}%</span>
                      <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-2">Confidence</span>
                    </div>
                  </div>

                  <div className="flex-grow text-center md:text-left relative z-10">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      {result.isAuthentic ? (
                        result.confidenceScore < 70 ? (
                          <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-200">
                            <Info className="text-white w-6 h-6" />
                          </div>
                        ) : (
                          <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
                            <CheckCircle2 className="text-white w-6 h-6" />
                          </div>
                        )
                      ) : (
                        <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-200">
                          <AlertTriangle className="text-white w-6 h-6" />
                        </div>
                      )}
                      <h2 className={cn(
                        "text-3xl font-black tracking-tight",
                        result.isAuthentic 
                          ? (result.confidenceScore < 70 ? "text-amber-700" : "text-emerald-700") 
                          : "text-rose-700"
                      )}>
                        {result.isAuthentic 
                          ? (result.confidenceScore < 70 ? "VERIFICATION: CAUTION" : "VERIFIED: AUTHENTIC") 
                          : "ALERT: FAKE DOCUMENT"}
                      </h2>
                    </div>
                    <p className="text-lg text-slate-600 mb-6 font-medium leading-relaxed">{result.summary}</p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      {result.findings.slice(0, 4).map((finding, i) => (
                        <span key={i} className="bg-white px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 border border-slate-200 shadow-sm">
                          {finding}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detailed Anomalies */}
                <div className="grid md:grid-cols-2 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-[2rem] p-10 border-white/40"
                  >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-xl">
                        <FileSearch className="w-5 h-5 text-indigo-600" />
                      </div>
                      Detected Anomalies
                    </h3>
                    <div className="space-y-5">
                      {result.detectedAnomalies.map((anomaly, i) => (
                        <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <div className={cn(
                            "w-3 h-3 rounded-full mt-1.5 flex-shrink-0 shadow-sm",
                            anomaly.severity === 'high' ? "bg-rose-500 ring-4 ring-rose-100" : 
                            anomaly.severity === 'medium' ? "bg-amber-500 ring-4 ring-amber-100" : "bg-blue-500 ring-4 ring-blue-100"
                          )} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-black text-slate-900">{anomaly.type}</p>
                              <span className={cn(
                                "text-[8px] uppercase font-black px-1.5 py-0.5 rounded border",
                                anomaly.severity === 'high' ? "text-rose-600 border-rose-200 bg-rose-50" : 
                                anomaly.severity === 'medium' ? "text-amber-600 border-amber-200 bg-amber-50" : "text-blue-600 border-blue-200 bg-blue-50"
                              )}>
                                {anomaly.severity}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{anomaly.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-[2rem] p-10 border-white/40"
                  >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-xl">
                        <Info className="w-5 h-5 text-indigo-600" />
                      </div>
                      Forensic Insights
                    </h3>
                    <div className="space-y-4">
                      {result.findings.map((finding, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="bg-indigo-50 p-1.5 rounded-lg mt-0.5">
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                            {finding}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-10 pt-8 border-t border-slate-100">
                      <button className="w-full btn-outline flex items-center justify-center gap-2 text-sm">
                        Download Full Forensic Report <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight">VeriTrust AI</span>
              </div>
              <p className="text-slate-400 max-w-sm text-lg font-medium leading-relaxed">
                Empowering institutions with neural-grade document verification. Secure your integrity with VeriTrust.
              </p>
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-6 text-slate-500">Platform</h4>
              <ul className="space-y-4 text-slate-300 font-bold text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Neural Engine</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Security Standards</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-6 text-slate-500">Support</h4>
              <ul className="space-y-4 text-slate-300 font-bold text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-xs font-bold">
            <p>© 2026 VeriTrust AI. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
