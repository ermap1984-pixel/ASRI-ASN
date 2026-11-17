import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  RotateCcw,
  Send,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import {
  ChatMessage,
  KnowledgeDocument,
  QUICK_PROMPTS,
} from '../data/sipkaData';

interface PegawaiChatViewProps {
  documents: KnowledgeDocument[];
  messages: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (question: string) => void;
  onFeedback: (messageId: string, logId: string | undefined, rating: 'puas' | 'kurang') => void;
  onResetChat: () => void;
}

function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }
    const parts = line.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g);
    return (
      <p key={idx} className="leading-relaxed text-[14.5px] text-slate-800">
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return (
              <em key={pIdx} className="italic text-slate-700">
                {part.slice(1, -1)}
              </em>
            );
          }
          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
        })}
      </p>
    );
  });
}

export const PegawaiChatView: React.FC<PegawaiChatViewProps> = ({
  documents,
  messages,
  isThinking,
  onSendMessage,
  onFeedback,
  onResetChat,
}) => {
  const [input, setInput] = useState('');
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [showMobileRefs, setShowMobileRefs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isThinking) return;
    onSendMessage(prompt);
  };

  const toggleCitationDetail = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Chat Workspace */}
      <section
        aria-label="Asisten Konsultasi Regulasi Kepegawaian"
        className="lg:col-span-8 bg-white border border-slate-200 rounded-xl flex flex-col h-[calc(100vh-11.5rem)] min-h-[540px] max-h-[820px] overflow-hidden"
      >
        {/* Chat Panel Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">
              Konsultasi Regulasi Kepegawaian ASN
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {documents.length} regulasi terindeks · Sitasi pasal otomatis
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowMobileRefs((prev) => !prev)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#1e3a8a]" />
              <span>Referensi</span>
            </button>
            <button
              type="button"
              onClick={onResetChat}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              title="Mulai percakapan baru"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sesi Baru</span>
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Quick References */}
        {showMobileRefs && (
          <div className="lg:hidden border-b border-slate-200 bg-slate-50 px-5 py-3 space-y-2 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-700">
              Regulasi Aktif di Knowledge Base:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    handleQuickPrompt(`Jelaskan ketentuan utama dalam ${doc.nomorPeraturan}`);
                    setShowMobileRefs(false);
                  }}
                  className="text-left p-2.5 bg-white border border-slate-200 rounded-lg hover:border-[#1e3a8a]/40 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {doc.nomorPeraturan}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{doc.kategori}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 bg-slate-50/40">
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] bg-[#1e3a8a] text-white rounded-xl rounded-tr-sm px-4 py-3">
                    <p className="text-[14.5px] leading-relaxed">{msg.text}</p>
                    <div className="mt-1.5 text-[11px] text-blue-200 text-right font-mono tabular-nums">
                      Pegawai BPKAD · {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            }

            const isExpanded = !!expandedCitations[msg.id];

            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[92%] sm:max-w-[85%] bg-white border border-slate-200 rounded-xl rounded-tl-sm px-5 py-4">
                  <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-[#1e3a8a]">
                      ASRI-ASN · Asisten Regulasi BPKAD
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {msg.timestamp}
                      {msg.responseTimeSec ? ` · ${msg.responseTimeSec.toFixed(2)} dtk` : ''}
                    </span>
                  </div>

                  <div className="space-y-1">{renderFormattedText(msg.text)}</div>

                  {/* Automatic Citation Box */}
                  {msg.citation && (
                    <div className="mt-4 border border-emerald-200 bg-emerald-50/60 rounded-lg p-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-emerald-950">
                              Sumber: {msg.citation.nomorPeraturan} — {msg.citation.pasal}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5 tabular-nums">
                              {msg.citation.judulDokumen} · {msg.citation.kategori}
                              {msg.citation.skorRelevansi
                                ? ` · Relevansi ${msg.citation.skorRelevansi}%`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCitationDetail(msg.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#047857] hover:text-emerald-950 py-1 px-2 rounded hover:bg-emerald-100/70 transition-colors whitespace-nowrap shrink-0"
                        >
                          <span>{isExpanded ? 'Tutup Cuplikan' : 'Lihat Cuplikan Pasal'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-emerald-200/80 text-xs leading-relaxed text-slate-700 bg-white/80 rounded-md p-3 font-normal">
                          {msg.citation.cuplikan}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback & Helpful Controls */}
                  {msg.citation && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        Apakah jawaban ini membantu?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onFeedback(msg.id, msg.logId, 'puas')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                            msg.feedback === 'puas'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Membantu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onFeedback(msg.id, msg.logId, 'kurang')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                            msg.feedback === 'kurang'
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Kurang Tepat</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isThinking && (
            <div className="flex justify-start" aria-live="polite">
              <div className="bg-white border border-slate-200 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-bounce [animation-delay:-0.25s]" />
                  <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-bounce [animation-delay:-0.12s]" />
                  <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-bounce" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  Menelusuri pasal regulasi pada Vector DB (pgvector)...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts + Input Area */}
        <div className="border-t border-slate-200 bg-white px-5 py-3.5 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
              Pertanyaan Cepat:
            </span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isThinking}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-[#1e3a8a] hover:text-white rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <label htmlFor="sipka-chat-input" className="sr-only">
              Tulis pertanyaan regulasi kepegawaian
            </label>
            <input
              id="sipka-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
              placeholder="Tanyakan syarat cuti, kenaikan pangkat, perhitungan TPP, atau disiplin ASN..."
              className="flex-1 min-w-0 px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/25 focus:border-[#1e3a8a] focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-300 disabled:text-slate-500 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
            >
              <span>Kirim</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Right Context Rail: Active Knowledge Base Index */}
      <aside className="hidden lg:flex lg:col-span-4 flex-col gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Basis Regulasi Terindeks
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik dokumen untuk menanyakan ringkasan aturan
              </p>
            </div>
            <Database className="w-4 h-4 text-[#1e3a8a] shrink-0" />
          </div>

          <div className="mt-3 divide-y divide-slate-100 max-h-[440px] overflow-y-auto pr-1">
            {documents.map((doc) => (
              <button
                key={doc.id}
                type="button"
                disabled={isThinking}
                onClick={() =>
                  handleQuickPrompt(
                    `Apa ketentuan utama yang diatur dalam ${doc.nomorPeraturan} mengenai ${doc.kategori}?`
                  )
                }
                className="w-full text-left py-3 first:pt-1 last:pb-1 hover:bg-slate-50 rounded-md px-2 -mx-2 transition-colors group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1e3a8a] group-hover:text-[#059669] transition-colors truncate">
                    {doc.nomorPeraturan}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                    {doc.jumlahChunk} chunk
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 line-clamp-2 leading-relaxed">
                  {doc.judul}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {doc.kategori} · {doc.pasalRujukan}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0f172a] text-white rounded-xl p-5">
          <h3 className="text-sm font-semibold">Standar Akurasi Sitasi</h3>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Setiap jawaban ASRI-ASN ditautkan langsung ke dokumen regulasi resmi Pemerintah
            Kabupaten Sidoarjo dan SOP internal BPKAD melalui pencarian vektor pgvector.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400">Target Respons</p>
              <p className="font-mono font-semibold text-emerald-400 mt-0.5 tabular-nums">
                &lt; 3,00 detik
              </p>
            </div>
            <div>
              <p className="text-slate-400">Total Vektor Aktif</p>
              <p className="font-mono font-semibold text-white mt-0.5 tabular-nums">
                {documents.reduce((acc, d) => acc + d.jumlahChunk, 0)} chunk
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
