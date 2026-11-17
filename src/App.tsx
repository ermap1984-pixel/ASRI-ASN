import { useState } from 'react';
import {
  BarChart3,
  Database,
  Download,
  FolderKanban,
  Landmark,
  MessageSquareText,
  UserCheck,
} from 'lucide-react';
import {
  ChatMessage,
  ConversationLog,
  INITIAL_DOCUMENTS,
  INITIAL_LOGS,
  KnowledgeDocument,
  querySipkaKnowledgeBase,
  UserRole,
} from './data/sipkaData';
import { PegawaiChatView } from './components/PegawaiChatView';
import { AdminKepegawaianView } from './components/AdminKepegawaianView';
import { PimpinanAnalyticsView } from './components/PimpinanAnalyticsView';
import { buildStandaloneSingleFileHtml } from './utils/singleFileHtmlGenerator';

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'bot',
    timestamp: '09:00',
    text:
      'Selamat datang di **ASRI-ASN — BPKAD Kab. Sidoarjo**.\n\n' +
      'Saya adalah Asisten Regulasi & Informasi Kepegawaian ASN yang siap membantu Anda menelusuri peraturan kepegawaian secara cepat dan akurat, lengkap dengan sitasi pasal otomatis dari basis regulasi resmi BPKAD dan Pemkab Sidoarjo.\n\n' +
      'Silakan pilih salah satu pertanyaan cepat di bawah atau ketikkan pertanyaan Anda.',
  },
];

function formatCurrentTime(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function App() {
  const [role, setRole] = useState<UserRole>('pegawai');
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(INITIAL_DOCUMENTS);
  const [logs, setLogs] = useState<ConversationLog[]>(INITIAL_LOGS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isThinking, setIsThinking] = useState(false);

  const handleSendMessage = (question: string) => {
    const timeStr = formatCurrentTime();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    const delayMs = 680 + Math.round(Math.random() * 420);

    window.setTimeout(() => {
      const result = querySipkaKnowledgeBase(question, documents);
      const logId = `log-${Date.now()}`;
      const botTime = formatCurrentTime();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: result.answer,
        timestamp: botTime,
        citation: result.citation,
        responseTimeSec: result.responseTimeSec,
        feedback: null,
        logId,
      };

      const newLog: ConversationLog = {
        id: logId,
        namaPegawai: 'ASN BPKAD (Sesi Aktif)',
        unitKerja: 'Sekretariat & Bidang Teknis',
        pertanyaan: question,
        kategori: result.matchedCategory,
        rujukanPasal: `${result.citation.nomorPeraturan} ${result.citation.pasal}`,
        waktuAkses: `16 Nov 2026 · ${botTime}`,
        waktuResponsSec: result.responseTimeSec,
        status: result.status,
        kepuasan: 'Belum Dinilai',
      };

      setMessages((prev) => [...prev, botMsg]);
      setLogs((prev) => [newLog, ...prev]);
      setIsThinking(false);
    }, delayMs);
  };

  const handleFeedback = (
    messageId: string,
    logId: string | undefined,
    rating: 'puas' | 'kurang'
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: rating } : m))
    );
    if (logId) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? { ...l, kepuasan: rating === 'puas' ? 'Puas' : 'Kurang Tepat' }
            : l
        )
      );
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_CHAT_MESSAGES);
    setIsThinking(false);
  };

  const handleAddDocument = (
    docInput: Omit<KnowledgeDocument, 'id' | 'tanggalUnggah' | 'statusVector'>
  ) => {
    const newDoc: KnowledgeDocument = {
      ...docInput,
      id: `doc-${Date.now()}`,
      tanggalUnggah: '16 Nov 2026',
      statusVector: 'Terindeks pgvector',
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleUpdateDocument = (id: string, updates: Partial<KnowledgeDocument>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    );
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleUpdateLogStatus = (logId: string, status: ConversationLog['status']) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === logId ? { ...log, status } : log))
    );
  };

  const handleDownloadSingleFileHtml = () => {
    const htmlContent = buildStandaloneSingleFileHtml(documents, logs);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asri-asn-bpkad-sidoarjo.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar / Header Instansi */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Brand Instansi */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#1e3a8a] border border-blue-700/60 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-[#10b981]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                ASRI-ASN — BPKAD Kab. Sidoarjo
              </h1>
              <p className="text-xs text-slate-300 truncate">
                Asisten Regulasi &amp; Informasi Kepegawaian ASN · Tanya Regulasi Kepegawaian Cepat, Akurat, dan Mudah.
              </p>
            </div>
          </div>

          {/* Vector DB Status + Instant Role Switcher */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300 whitespace-nowrap shrink-0">
              <Database className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
              <span>Aktif · Terhubung ke Vector DB (pgvector)</span>
            </div>

            <nav
              aria-label="Pengalih Peran Pengguna"
              className="inline-flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-700/90 rounded-lg overflow-x-auto max-w-full"
            >
              <button
                type="button"
                onClick={() => setRole('pegawai')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  role === 'pegawai'
                    ? 'bg-[#10b981] text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Pegawai (ASN)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  role === 'admin'
                    ? 'bg-[#10b981] text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Admin Kepegawaian</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('pimpinan')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  role === 'pimpinan'
                    ? 'bg-[#10b981] text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Pimpinan</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Active Role Context Strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <UserCheck className="w-3.5 h-3.5 text-[#1e3a8a]" />
            <span>
              Mode Aktif:{' '}
              <strong className="font-semibold text-slate-900">
                {role === 'pegawai' && 'Pegawai (ASN BPKAD)'}
                {role === 'admin' && 'Admin Kepegawaian (Subbag Umum & Kepegawaian)'}
                {role === 'pimpinan' && 'Pimpinan (Kabid / Sekretaris / Kepala BPKAD)'}
              </strong>
            </span>
          </div>
          <span className="text-slate-500">
            Badan Pengelolaan Keuangan dan Aset Daerah Kabupaten Sidoarjo
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {role === 'pegawai' && (
          <PegawaiChatView
            documents={documents}
            messages={messages}
            isThinking={isThinking}
            onSendMessage={handleSendMessage}
            onFeedback={handleFeedback}
            onResetChat={handleResetChat}
          />
        )}

        {role === 'admin' && (
          <AdminKepegawaianView
            documents={documents}
            logs={logs}
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            onUpdateLogStatus={handleUpdateLogStatus}
          />
        )}

        {role === 'pimpinan' && <PimpinanAnalyticsView logs={logs} />}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            ASRI-ASN · Asisten Regulasi &amp; Informasi Kepegawaian ASN BPKAD Kabupaten Sidoarjo
          </p>
          <button
            type="button"
            onClick={handleDownloadSingleFileHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1e3a8a] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Versi Single-File HTML (Tailwind + FontAwesome + Alpine.js)</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
