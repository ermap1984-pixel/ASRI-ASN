import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FilePlus2,
  FileText,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  ConversationLog,
  KnowledgeDocument,
  REGULATION_CATEGORIES,
  RegulationCategory,
} from '../data/sipkaData';
import {
  chunkRegulationText,
  DocumentChunk,
  extractTextFromFile,
} from '../utils/documentParser';

interface AdminKepegawaianViewProps {
  documents: KnowledgeDocument[];
  logs: ConversationLog[];
  onAddDocument: (doc: Omit<KnowledgeDocument, 'id' | 'tanggalUnggah' | 'statusVector'>) => void;
  onUpdateDocument: (id: string, updates: Partial<KnowledgeDocument>) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateLogStatus: (logId: string, status: ConversationLog['status']) => void;
}

export const AdminKepegawaianView: React.FC<AdminKepegawaianViewProps> = ({
  documents,
  logs,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onUpdateLogStatus,
}) => {
  // Upload / Edit Form State
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [judul, setJudul] = useState('');
  const [nomorPeraturan, setNomorPeraturan] = useState('');
  const [kategori, setKategori] = useState<RegulationCategory>('TPP');
  const [pasalRujukan, setPasalRujukan] = useState('');
  const [ringkasanIsi, setRingkasanIsi] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [extractedFullText, setExtractedFullText] = useState('');
  const [extractedPageCount, setExtractedPageCount] = useState(0);
  const [extractWarning, setExtractWarning] = useState<string | null>(null);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document Table Filters, Preview & Delete Confirm
  const [docSearch, setDocSearch] = useState('');
  const [docCatFilter, setDocCatFilter] = useState<'Semua' | RegulationCategory>('Semua');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);

  // Conversation Log Filters & Detail Modal
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<'Semua' | 'Terjawab' | 'Perlu Tinjauan'>('Semua');
  const [selectedLog, setSelectedLog] = useState<ConversationLog | null>(null);

  const avgResponseTime = useMemo(() => {
    if (logs.length === 0) return 1.45;
    const total = logs.reduce((sum, l) => sum + l.waktuResponsSec, 0);
    return total / logs.length;
  }, [logs]);

  const totalChunks = useMemo(
    () => documents.reduce((sum, d) => sum + d.jumlahChunk, 0),
    [documents]
  );

  const todayQuestionsCount = useMemo(
    () => logs.filter((l) => l.waktuAkses.startsWith('16 Nov')).length,
    [logs]
  );

  const filteredDocs = useMemo(() => {
    const q = docSearch.toLowerCase().trim();
    return documents.filter((d) => {
      const matchesCat = docCatFilter === 'Semua' || d.kategori === docCatFilter;
      const matchesQuery =
        !q ||
        d.judul.toLowerCase().includes(q) ||
        d.nomorPeraturan.toLowerCase().includes(q) ||
        d.namaFile.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [documents, docSearch, docCatFilter]);

  const filteredLogs = useMemo(() => {
    const q = logSearch.toLowerCase().trim();
    return logs.filter((l) => {
      const matchesStatus = logStatusFilter === 'Semua' || l.status === logStatusFilter;
      const matchesQuery =
        !q ||
        l.pertanyaan.toLowerCase().includes(q) ||
        l.namaPegawai.toLowerCase().includes(q) ||
        l.unitKerja.toLowerCase().includes(q) ||
        l.rujukanPasal.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [logs, logSearch, logStatusFilter]);

  const handleFileChosen = async (file: File | null) => {
    if (!file) return;
    setSelectedFileName(file.name);
    const sizeKb = file.size / 1024;
    setSelectedFileSize(
      sizeKb >= 1024
        ? `${(sizeKb / 1024).toFixed(2)} MB`
        : `${Math.max(1, Math.round(sizeKb))} KB`
    );
    if (!judul.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
      setJudul(cleanName);
    }

    setExtractWarning(null);
    setIsExtractingFile(true);
    const parsed = await extractTextFromFile(file);
    setIsExtractingFile(false);
    setExtractedFullText(parsed.text);
    setExtractedPageCount(parsed.pageCount);
    if (parsed.warning) {
      setExtractWarning(parsed.warning);
    }
    if (parsed.text && !ringkasanIsi.trim()) {
      const previewExcerpt = parsed.text
        .replace(/\[Halaman \d+\]\s*/g, '')
        .slice(0, 420)
        .trim();
      setRingkasanIsi(
        previewExcerpt + (parsed.text.length > 420 ? '...' : '')
      );
    }
  };

  const resetForm = () => {
    setEditingDocId(null);
    setJudul('');
    setNomorPeraturan('');
    setKategori('TPP');
    setPasalRujukan('');
    setRingkasanIsi('');
    setSelectedFileName('');
    setSelectedFileSize('');
    setExtractedFullText('');
    setExtractedPageCount(0);
    setExtractWarning(null);
  };

  const handleStartEdit = (doc: KnowledgeDocument) => {
    setEditingDocId(doc.id);
    setJudul(doc.judul);
    setNomorPeraturan(doc.nomorPeraturan);
    setKategori(doc.kategori);
    setPasalRujukan(doc.pasalRujukan);
    setRingkasanIsi(doc.ringkasanIsi);
    setSelectedFileName(doc.namaFile);
    setSelectedFileSize(doc.ukuranFile);
    setExtractedFullText(doc.isiLengkap || '');
    setExtractedPageCount(0);
    setExtractWarning(null);
    setUploadNotice(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !nomorPeraturan.trim()) return;
    if (!ringkasanIsi.trim() && !extractedFullText.trim()) return;

    const effectiveTextForChunking = [
      ringkasanIsi.trim(),
      extractedFullText.trim(),
    ]
      .filter(Boolean)
      .join('\n\n');

    const docPrefix = editingDocId || `doc-${Date.now()}`;
    const generatedChunks: DocumentChunk[] = chunkRegulationText(
      effectiveTextForChunking,
      pasalRujukan.trim() || 'Ketentuan Utama',
      docPrefix
    );

    const keywords = Array.from(
      new Set(
        `${judul} ${nomorPeraturan} ${kategori} ${effectiveTextForChunking.slice(0, 2000)}`
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3)
          .slice(0, 40)
      )
    );

    const summaryText =
      ringkasanIsi.trim() ||
      generatedChunks[0]?.content ||
      effectiveTextForChunking.slice(0, 400);

    if (editingDocId) {
      const existingDoc = documents.find((d) => d.id === editingDocId);
      const finalChunks =
        generatedChunks.length > 0 ? generatedChunks : existingDoc?.chunks || [];
      onUpdateDocument(editingDocId, {
        judul: judul.trim(),
        nomorPeraturan: nomorPeraturan.trim(),
        kategori,
        pasalRujukan: pasalRujukan.trim() || finalChunks[0]?.pasalLabel || 'Pasal 1',
        ringkasanIsi: summaryText,
        cuplikanPasal: `${pasalRujukan.trim() || finalChunks[0]?.pasalLabel || 'Pasal 1'}: "${summaryText}"`,
        namaFile: selectedFileName || 'Regulasi_Terbaru_BPKAD.pdf',
        ukuranFile: selectedFileSize || '1.4 MB',
        kataKunci: keywords,
        chunks: finalChunks,
        jumlahChunk: Math.max(1, finalChunks.length),
        isiLengkap: extractedFullText || existingDoc?.isiLengkap,
        isCustomUploaded: true,
      });
      setUploadNotice(
        `Dokumen "${nomorPeraturan.trim()}" berhasil diperbarui (${Math.max(1, finalChunks.length)} chunk terindeks ke pgvector).`
      );
      resetForm();
      return;
    }

    onAddDocument({
      judul: judul.trim(),
      nomorPeraturan: nomorPeraturan.trim(),
      kategori,
      namaFile: selectedFileName || `${nomorPeraturan.trim().replace(/\s+/g, '_')}.pdf`,
      ukuranFile: selectedFileSize || '1.6 MB',
      jumlahChunk: Math.max(1, generatedChunks.length),
      pasalRujukan: pasalRujukan.trim() || generatedChunks[0]?.pasalLabel || 'Pasal 1 ayat 1',
      ringkasanIsi: summaryText,
      kataKunci: keywords,
      cuplikanPasal: `${pasalRujukan.trim() || generatedChunks[0]?.pasalLabel || 'Pasal 1 ayat 1'}: "${summaryText}"`,
      chunks: generatedChunks,
      isiLengkap: extractedFullText || undefined,
      isCustomUploaded: true,
    });
    setUploadNotice(
      `Dokumen "${nomorPeraturan.trim()}" berhasil diekstrak & diindeks (${Math.max(1, generatedChunks.length)} chunk ke pgvector).`
    );
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Strip */}
      <section aria-label="Ringkasan Operasional Admin" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Dokumen Regulasi Aktif</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 font-mono tabular-nums">
            {documents.length} Dokumen
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {totalChunks} vector chunk terindeks di pgvector
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Total Pertanyaan Hari Ini</p>
          <p className="text-2xl font-bold text-[#1e3a8a] mt-1.5 font-mono tabular-nums">
            {todayQuestionsCount} Konsultasi
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {logs.length} total riwayat tercatat pada log aktif
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Rata-rata Waktu Respons Server</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-2xl font-bold text-[#059669] font-mono tabular-nums">
              {avgResponseTime.toFixed(2)} dtk
            </p>
            <span className="text-xs font-medium text-emerald-700">Memenuhi SLA (&lt; 3 dtk)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencarian semantik & generasi sitasi otomatis
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Kesiapan Indeks Vector DB</p>
          <div className="flex items-center gap-2 mt-1.5">
            <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">100%</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Seluruh dokumen tersinkron dengan Chatbot ASN
          </p>
        </div>
      </section>

      {/* FR-02: Knowledge Base Upload & Documents Management */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Upload / Edit Form */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {editingDocId ? 'Perbarui Dokumen Regulasi' : 'Unggah Dokumen Knowledge Base'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                FR-02 · Penambahan & pembaruan indeks regulasi PDF/SOP ke pgvector
              </p>
            </div>
            <FilePlus2 className="w-5 h-5 text-[#1e3a8a] shrink-0" />
          </div>

          {uploadNotice && (
            <div className="mt-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                <span>{uploadNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadNotice(null)}
                className="text-emerald-700 hover:text-emerald-950 shrink-0"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const droppedFile = e.dataTransfer.files?.[0] || null;
                handleFileChosen(droppedFile);
              }}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[#10b981] bg-emerald-50/60'
                  : 'border-slate-300 bg-slate-50/70 hover:border-[#1e3a8a]/60 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,.csv"
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0] || null)}
              />
              {isExtractingFile ? (
                <div className="py-2 flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 text-[#10b981] animate-spin" />
                  <p className="text-xs font-semibold text-slate-800">
                    Mengekstrak teks &amp; pasal dari dokumen...
                  </p>
                </div>
              ) : selectedFileName ? (
                <div className="mt-1">
                  <UploadCloud className="w-6 h-6 text-[#10b981] mx-auto" />
                  <p className="text-xs font-semibold text-slate-900 truncate mt-1.5">
                    {selectedFileName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                    Ukuran: {selectedFileSize}
                    {extractedPageCount > 0 ? ` · ${extractedPageCount} halaman terbaca` : ''}
                    {extractedFullText ? ` · ${extractedFullText.length.toLocaleString('id-ID')} karakter` : ''}
                  </p>
                  <p className="text-[11px] text-[#1e3a8a] font-medium mt-1">
                    Klik untuk mengganti file
                  </p>
                </div>
              ) : (
                <div className="mt-1">
                  <UploadCloud className="w-7 h-7 text-[#1e3a8a] mx-auto" />
                  <p className="text-xs font-semibold text-slate-800 mt-2">
                    Tarik &amp; lepas file PDF/DOCX/TXT regulasi ke sini, atau klik untuk memilih
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Isi teks &amp; pasal akan diekstrak otomatis untuk pencarian Chatbot
                  </p>
                </div>
              )}
            </div>

            {extractWarning && (
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{extractWarning}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label htmlFor="doc-title" className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Dokumen Regulasi / SOP
                </label>
                <input
                  id="doc-title"
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Pedoman Pemberian Cuti Bersama ASN 2026"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/25 focus:border-[#1e3a8a]"
                />
              </div>

              <div>
                <label htmlFor="doc-number" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Peraturan
                </label>
                <input
                  id="doc-number"
                  type="text"
                  required
                  value={nomorPeraturan}
                  onChange={(e) => setNomorPeraturan(e.target.value)}
                  placeholder="Perbup Sidoarjo No. ... Tahun 2026"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/25 focus:border-[#1e3a8a]"
                />
              </div>

              <div>
                <label htmlFor="doc-category" className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Topik
                </label>
                <select
                  id="doc-category"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as RegulationCategory)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/25 focus:border-[#1e3a8a]"
                >
                  {REGULATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="doc-pasal" className="block text-xs font-semibold text-slate-700 mb-1">
                  Pasal Rujukan Utama
                </label>
                <input
                  id="doc-pasal"
                  type="text"
                  value={pasalRujukan}
                  onChange={(e) => setPasalRujukan(e.target.value)}
                  placeholder="Contoh: Pasal 7 ayat 2"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/25 focus:border-[#1e3a8a]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="doc-summary" className="block text-xs font-semibold text-slate-700 mb-1">
                  Ringkasan Ketentuan / Catatan Tambahan Indeks RAG
                </label>
                <textarea
                  id="doc-summary"
                  required={!extractedFullText.trim()}
                  rows={3}
                  value={ringkasanIsi}
                  onChange={(e) => setRingkasanIsi(e.target.value)}
                  placeholder="Terisi otomatis dari teks file yang diunggah, atau ketikkan inti ketentuan secara manual..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/25 focus:border-[#1e3a8a]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1e3a8a] hover:bg-[#0f172a] rounded-lg transition-colors whitespace-nowrap"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{editingDocId ? 'Simpan Pembaruan' : 'Unggah & Indeks Dokumen'}</span>
              </button>
              {editingDocId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Uploaded Documents Table */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Daftar Dokumen Knowledge Base
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                Menampilkan {filteredDocs.length} dari {documents.length} regulasi terindeks
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Cari regulasi..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1e3a8a] w-44"
                />
              </div>
              <select
                value={docCatFilter}
                onChange={(e) => setDocCatFilter(e.target.value as 'Semua' | RegulationCategory)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1e3a8a]"
              >
                <option value="Semua">Semua Kategori</option>
                {REGULATION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Dokumen & Nomor Peraturan</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-right">Vector Chunk</th>
                  <th className="py-3 px-3">Diunggah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Tidak ada dokumen yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-[#1e3a8a] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 leading-snug">
                              {doc.nomorPeraturan}
                            </p>
                            <p className="text-slate-600 mt-0.5 line-clamp-1">{doc.judul}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                              {doc.namaFile} · {doc.ukuranFile}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{doc.kategori}</span>
                        <span className="block text-[11px] text-slate-400">{doc.pasalRujukan}</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {doc.jumlahChunk}
                      </td>
                      <td className="py-3.5 px-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {doc.tanggalUnggah}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {confirmDeleteId === doc.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteDocument(doc.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                            >
                              Konfirmasi Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                              title="Lihat isi chunk & pasal terindeks"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#1e3a8a] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                              title="Perbarui metadata dokumen"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Perbarui</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(doc.id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                              title="Hapus dokumen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FR-04: Interactive Conversation History Log */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Log Riwayat Percakapan Pegawai (FR-04)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan pertanyaan ASN secara waktu-nyata, rujukan pasal yang dikirim, waktu respons, dan penilaian kepuasan
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Cari pertanyaan atau pegawai..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1e3a8a] w-56"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['Semua', 'Terjawab', 'Perlu Tinjauan'] as const).map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => setLogStatusFilter(statusOption)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    logStatusFilter === statusOption
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {statusOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Waktu Akses</th>
                <th className="py-3 px-3">Pegawai & Unit Kerja</th>
                <th className="py-3 px-3">Pertanyaan Masuk</th>
                <th className="py-3 px-3 text-right">Respons</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Kepuasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Belum ada log percakapan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {log.waktuAkses}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{log.namaPegawai}</p>
                      <p className="text-[11px] text-slate-500">{log.unitKerja}</p>
                    </td>
                    <td className="py-3.5 px-3 max-w-md">
                      <p className="text-slate-800 font-medium line-clamp-1">{log.pertanyaan}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {log.kategori} · {log.rujukanPasal}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {log.waktuResponsSec.toFixed(2)} dtk
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          log.status === 'Terjawab' ? 'text-[#047857]' : 'text-amber-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          log.kepuasan === 'Puas'
                            ? 'text-[#047857]'
                            : log.kepuasan === 'Kurang Tepat'
                            ? 'text-red-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {log.kepuasan}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 id="log-modal-title" className="text-base font-semibold text-slate-900">
                  Detail Audit Log Konsultasi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                  {selectedLog.waktuAkses} · Respons {selectedLog.waktuResponsSec.toFixed(2)} dtk
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                aria-label="Tutup detail log"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Pegawai & Unit Kerja</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {selectedLog.namaPegawai} — {selectedLog.unitKerja}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pertanyaan Diajukan</p>
                <p className="text-slate-800 mt-0.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {selectedLog.pertanyaan}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Rujukan Pasal Otomatis</p>
                  <p className="text-xs font-semibold text-[#047857] mt-0.5">
                    {selectedLog.rujukanPasal}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Feedback Pegawai</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedLog.kepuasan}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-600">Status Verifikasi Admin:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateLogStatus(selectedLog.id, 'Terjawab');
                    setSelectedLog({ ...selectedLog, status: 'Terjawab' });
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    selectedLog.status === 'Terjawab'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Tandai Terjawab
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateLogStatus(selectedLog.id, 'Perlu Tinjauan');
                    setSelectedLog({ ...selectedLog, status: 'Perlu Tinjauan' });
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    selectedLog.status === 'Perlu Tinjauan'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Perlu Tinjauan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Document Chunk Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chunk-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
              <div className="min-w-0">
                <h3 id="chunk-modal-title" className="text-base font-semibold text-slate-900 truncate">
                  {previewDoc.nomorPeraturan}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {previewDoc.judul} · {previewDoc.chunks.length} chunk pasal terbaca
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 shrink-0"
                aria-label="Tutup pratinjau chunk"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1">
              {previewDoc.chunks.map((chunk, idx) => (
                <div
                  key={chunk.id}
                  className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-[#1e3a8a]">
                      Chunk #{idx + 1} · {chunk.pasalLabel}
                    </span>
                    {chunk.pageHint && (
                      <span className="font-mono text-slate-400 tabular-nums">
                        Hal. {chunk.pageHint}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
