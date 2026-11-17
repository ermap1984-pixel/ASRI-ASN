import { KnowledgeDocument, ConversationLog } from '../data/sipkaData';

export function buildStandaloneSingleFileHtml(
  documents: KnowledgeDocument[],
  logs: ConversationLog[]
): string {
  const serializedDocs = JSON.stringify(documents);
  const serializedLogs = JSON.stringify(logs);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ASRI-ASN — BPKAD Kab. Sidoarjo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    [x-cloak] { display: none !important; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col" x-data="sipkaApp()">
  <!-- Top Bar Instansi -->
  <header class="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-lg bg-[#1e3a8a] border border-blue-700/50 flex items-center justify-center shrink-0">
          <i class="fa-solid fa-landmark text-emerald-400"></i>
        </div>
        <div class="min-w-0">
          <h1 class="text-base sm:text-lg font-bold tracking-tight truncate">ASRI-ASN — BPKAD Kab. Sidoarjo</h1>
          <p class="text-xs text-slate-300 truncate">Asisten Regulasi &amp; Informasi Kepegawaian ASN · Tanya Regulasi Kepegawaian Cepat, Akurat, dan Mudah.</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between lg:justify-end gap-3">
        <div class="inline-flex items-center gap-2 text-xs text-emerald-300 font-medium whitespace-nowrap">
          <i class="fa-solid fa-database"></i>
          <span>Aktif · Vector DB (pgvector) Terhubung</span>
        </div>

        <div class="inline-flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700">
          <button @click="role = 'pegawai'" :class="role === 'pegawai' ? 'bg-[#10b981] text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'" class="px-3 py-1.5 text-xs rounded-md transition whitespace-nowrap">
            <i class="fa-solid fa-user-tie mr-1.5"></i>Pegawai
          </button>
          <button @click="role = 'admin'" :class="role === 'admin' ? 'bg-[#10b981] text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'" class="px-3 py-1.5 text-xs rounded-md transition whitespace-nowrap">
            <i class="fa-solid fa-folder-open mr-1.5"></i>Admin Kepegawaian
          </button>
          <button @click="role = 'pimpinan'" :class="role === 'pimpinan' ? 'bg-[#10b981] text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'" class="px-3 py-1.5 text-xs rounded-md transition whitespace-nowrap">
            <i class="fa-solid fa-chart-column mr-1.5"></i>Pimpinan
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
    <!-- VIEW 1: PEGAWAI -->
    <div x-show="role === 'pegawai'" x-cloak class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <section class="lg:col-span-8 bg-white border border-slate-200 rounded-xl flex flex-col h-[640px] overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Konsultasi Regulasi Kepegawaian ASN</h2>
            <p class="text-xs text-slate-500 tabular-nums" x-text="documents.length + ' regulasi terindeks · Sitasi pasal otomatis'"></p>
          </div>
          <button @click="resetChat()" class="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-100">
            <i class="fa-solid fa-rotate-right mr-1"></i>Sesi Baru
          </button>
        </div>

        <div id="chatScroll" class="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
          <template x-for="msg in messages" :key="msg.id">
            <div :class="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
              <div :class="msg.sender === 'user' ? 'bg-[#1e3a8a] text-white max-w-[80%] rounded-xl rounded-tr-sm px-4 py-3' : 'bg-white border border-slate-200 max-w-[85%] rounded-xl rounded-tl-sm px-5 py-4'">
                <div x-show="msg.sender === 'bot'" class="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-slate-100 text-xs">
                  <span class="font-semibold text-[#1e3a8a]">ASRI-ASN · Asisten Regulasi BPKAD</span>
                  <span class="font-mono text-slate-400 tabular-nums" x-text="msg.timestamp"></span>
                </div>
                <p class="text-sm leading-relaxed whitespace-pre-line" x-text="msg.text"></p>
                <template x-if="msg.citation">
                  <div class="mt-3 border border-emerald-200 bg-emerald-50/70 rounded-lg p-3 text-xs">
                    <p class="font-semibold text-emerald-950">
                      <i class="fa-solid fa-book-bookmark text-emerald-600 mr-1.5"></i>
                      <span x-text="'Sumber: ' + msg.citation.nomorPeraturan + ' ' + msg.citation.pasal"></span>
                    </p>
                    <p class="text-slate-600 mt-1" x-text="msg.citation.cuplikan"></p>
                  </div>
                </template>
              </div>
            </div>
          </template>

          <div x-show="isThinking" class="flex justify-start">
            <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600 flex items-center gap-2">
              <i class="fa-solid fa-circle-notch fa-spin text-emerald-600"></i>
              <span>Menelusuri pasal regulasi di pgvector...</span>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 bg-white p-4 space-y-3">
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <template x-for="q in quickPrompts" :key="q">
              <button @click="sendQuestion(q)" class="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-[#1e3a8a] hover:text-white rounded-lg whitespace-nowrap transition" x-text="q"></button>
            </template>
          </div>
          <form @submit.prevent="sendQuestion(chatInput)" class="flex gap-2">
            <input x-model="chatInput" type="text" placeholder="Tanyakan regulasi kepegawaian BPKAD Sidoarjo..." class="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1e3a8a]" />
            <button type="submit" class="px-5 py-2.5 text-sm font-semibold text-white bg-[#10b981] hover:bg-[#059669] rounded-lg whitespace-nowrap">
              Kirim <i class="fa-solid fa-paper-plane ml-1"></i>
            </button>
          </form>
        </div>
      </section>

      <aside class="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100">Basis Regulasi Terindeks</h3>
        <div class="mt-3 divide-y divide-slate-100">
          <template x-for="doc in documents" :key="doc.id">
            <button @click="sendQuestion('Jelaskan ketentuan ' + doc.nomorPeraturan)" class="w-full text-left py-3 hover:bg-slate-50 px-2 rounded-lg transition">
              <p class="text-xs font-semibold text-[#1e3a8a]" x-text="doc.nomorPeraturan"></p>
              <p class="text-xs text-slate-700 mt-0.5 line-clamp-2" x-text="doc.judul"></p>
            </button>
          </template>
        </div>
      </aside>
    </div>

    <!-- VIEW 2: ADMIN -->
    <div x-show="role === 'admin'" x-cloak class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <p class="text-xs text-slate-500">Dokumen Aktif</p>
          <p class="text-2xl font-bold font-mono tabular-nums mt-1" x-text="documents.length + ' Dokumen'"></p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <p class="text-xs text-slate-500">Total Pertanyaan Tercatat</p>
          <p class="text-2xl font-bold font-mono tabular-nums text-[#1e3a8a] mt-1" x-text="logs.length + ' Pertanyaan'"></p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <p class="text-xs text-slate-500">Rata-rata Waktu Respons</p>
          <p class="text-2xl font-bold font-mono tabular-nums text-[#059669] mt-1">1.58 dtk (&lt; 3 dtk)</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5">
          <h2 class="text-base font-semibold mb-3">Unggah Dokumen Knowledge Base (FR-02)</h2>
          <form @submit.prevent="addDocument()" class="space-y-3">
            <input x-model="newDoc.judul" required type="text" placeholder="Judul Dokumen Regulasi" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            <input x-model="newDoc.nomorPeraturan" required type="text" placeholder="Nomor Peraturan (mis. Perbup No. ...)" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            <select x-model="newDoc.kategori" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
              <option>TPP</option><option>Cuti</option><option>Kenaikan Pangkat</option><option>Disiplin ASN</option><option>Mutasi</option><option>SOP Kepegawaian</option>
            </select>
            <input x-model="newDoc.pasalRujukan" type="text" placeholder="Pasal Rujukan (mis. Pasal 5 ayat 2)" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            <textarea x-model="newDoc.ringkasanIsi" required rows="3" placeholder="Ringkasan ketentuan regulasi..." class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"></textarea>
            <button type="submit" class="w-full py-2.5 text-sm font-semibold text-white bg-[#1e3a8a] hover:bg-[#0f172a] rounded-lg">
              <i class="fa-solid fa-cloud-arrow-up mr-1.5"></i>Unggah & Indeks ke pgvector
            </button>
          </form>
        </div>

        <div class="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
          <h2 class="text-base font-semibold mb-3">Daftar Dokumen Regulasi</h2>
          <table class="w-full text-xs text-left">
            <thead><tr class="border-b text-slate-500"><th class="py-2">Peraturan</th><th class="py-2">Kategori</th><th class="py-2 text-right">Aksi</th></tr></thead>
            <tbody class="divide-y">
              <template x-for="doc in documents" :key="doc.id">
                <tr>
                  <td class="py-2.5 pr-3"><p class="font-semibold" x-text="doc.nomorPeraturan"></p><p class="text-slate-500" x-text="doc.judul"></p></td>
                  <td class="py-2.5 pr-3" x-text="doc.kategori"></td>
                  <td class="py-2.5 text-right"><button @click="deleteDoc(doc.id)" class="text-red-600 hover:underline">Hapus</button></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
        <h2 class="text-base font-semibold mb-3">Log Riwayat Percakapan (FR-04)</h2>
        <table class="w-full text-xs text-left">
          <thead><tr class="border-b text-slate-500"><th class="py-2">Waktu</th><th class="py-2">Pegawai</th><th class="py-2">Pertanyaan</th><th class="py-2">Status</th><th class="py-2">Kepuasan</th></tr></thead>
          <tbody class="divide-y">
            <template x-for="log in logs" :key="log.id">
              <tr>
                <td class="py-2.5 font-mono tabular-nums" x-text="log.waktuAkses"></td>
                <td class="py-2.5 font-medium" x-text="log.namaPegawai"></td>
                <td class="py-2.5" x-text="log.pertanyaan"></td>
                <td class="py-2.5 text-emerald-700 font-medium" x-text="log.status"></td>
                <td class="py-2.5 font-medium" x-text="log.kepuasan"></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VIEW 3: PIMPINAN -->
    <div x-show="role === 'pimpinan'" x-cloak class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <p class="text-xs text-slate-500">Total Konsultasi Bulan Ini</p>
          <p class="text-3xl font-bold font-mono tabular-nums mt-1" x-text="(1475 + logs.length).toLocaleString('id-ID')"></p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <p class="text-xs text-slate-500">Tingkat Kepuasan Pegawai</p>
          <p class="text-3xl font-bold font-mono tabular-nums text-[#059669] mt-1">97,23%</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <p class="text-xs text-slate-500">Kategori Terpopuler</p>
          <p class="text-2xl font-bold text-[#1e3a8a] mt-1">TPP & Tunjangan</p>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 class="text-base font-semibold">Visualisasi Topik Pertanyaan Pegawai</h2>
        <template x-for="t in topics" :key="t.name">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="font-semibold" x-text="t.name"></span>
              <span class="font-mono tabular-nums" x-text="t.count + ' konsultasi'"></span>
            </div>
            <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-[#1e3a8a] rounded-full" :style="'width: ' + Math.round((t.count / 520) * 100) + '%'"></div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </main>

  <script>
    function sipkaApp() {
      return {
        role: 'pegawai',
        chatInput: '',
        isThinking: false,
        documents: ${serializedDocs},
        logs: ${serializedLogs},
        quickPrompts: [
          'Apa saja syarat cuti tahunan?',
          'Bagaimana prosedur kenaikan pangkat penata muda?',
          'Berapa ketentuan perhitungan TPP terbaru?'
        ],
        topics: [
          { name: 'TPP', count: 518 },
          { name: 'Cuti', count: 384 },
          { name: 'Kenaikan Pangkat', count: 276 },
          { name: 'Mutasi', count: 162 },
          { name: 'Disiplin ASN', count: 94 }
        ],
        newDoc: { judul: '', nomorPeraturan: '', kategori: 'TPP', pasalRujukan: '', ringkasanIsi: '' },
        messages: [
          {
            id: 'init-1',
            sender: 'bot',
            timestamp: '09:00',
            text: 'Selamat datang di ASRI-ASN — BPKAD Kab. Sidoarjo. Silakan ajukan pertanyaan seputar regulasi cuti, kenaikan pangkat, perhitungan TPP, atau disiplin ASN.',
            citation: null
          }
        ],
        resetChat() {
          this.messages = [this.messages[0]];
        },
        sendQuestion(q) {
          if (!q || !q.trim() || this.isThinking) return;
          const question = q.trim();
          this.chatInput = '';
          this.messages.push({ id: 'u-' + Date.now(), sender: 'user', text: question, timestamp: 'Baru saja' });
          this.isThinking = true;
          setTimeout(() => {
            const stop = new Set(['apa','apakah','bagaimana','berapa','saja','yang','dan','atau','di','ke','dari','untuk','pada','dalam','tentang','mengenai','dengan','adalah','terbaru','baru','ini','itu']);
            const tokens = question.toLowerCase().replace(/[^\\w\\s/-]/g, ' ').split(/\\s+/).filter(w => w.length >= 2 && !stop.has(w));
            let bestHit = null;
            let bestScore = -1;
            for (const doc of this.documents) {
              const chunks = (doc.chunks && doc.chunks.length) ? doc.chunks : [{ pasalLabel: doc.pasalRujukan, content: doc.ringkasanIsi }];
              for (const ch of chunks) {
                const hay = (doc.judul + ' ' + doc.nomorPeraturan + ' ' + doc.kategori + ' ' + ch.pasalLabel + ' ' + ch.content).toLowerCase();
                let sc = doc.isCustomUploaded ? 1.5 : 0;
                for (const t of tokens) { if (hay.includes(t)) sc += 3; }
                if (question.toLowerCase().includes(doc.nomorPeraturan.toLowerCase())) sc += 8;
                if (sc > bestScore) { bestScore = sc; bestHit = { doc, ch }; }
              }
            }
            const match = bestHit ? bestHit.doc : this.documents[0];
            const chunk = bestHit ? bestHit.ch : { pasalLabel: match.pasalRujukan, content: match.ringkasanIsi };
            this.messages.push({
              id: 'b-' + Date.now(),
              sender: 'bot',
              timestamp: 'Baru saja',
              text: 'Berdasarkan ' + match.judul + ' (' + match.nomorPeraturan + '):\\n\\n' + chunk.content,
              citation: {
                nomorPeraturan: match.nomorPeraturan,
                pasal: chunk.pasalLabel || match.pasalRujukan,
                cuplikan: chunk.content || match.cuplikanPasal
              }
            });
            this.logs.unshift({
              id: 'log-' + Date.now(),
              namaPegawai: 'ASN BPKAD (Sesi Aktif)',
              unitKerja: 'Sekretariat',
              pertanyaan: question,
              kategori: match.kategori,
              rujukanPasal: match.nomorPeraturan + ' ' + (chunk.pasalLabel || match.pasalRujukan),
              waktuAkses: '16 Nov 2026 · Baru saja',
              waktuResponsSec: 1.42,
              status: 'Terjawab',
              kepuasan: 'Puas'
            });
            this.isThinking = false;
          }, 700);
        },
        addDocument() {
          const text = this.newDoc.ringkasanIsi || '';
          const chunks = text.split(/\\n\\n+/).filter(Boolean).map((c, idx) => ({
            id: 'c-' + Date.now() + '-' + idx,
            pasalLabel: this.newDoc.pasalRujukan || 'Ketentuan #' + (idx + 1),
            content: c
          }));
          this.documents.unshift({
            id: 'doc-' + Date.now(),
            judul: this.newDoc.judul,
            nomorPeraturan: this.newDoc.nomorPeraturan,
            kategori: this.newDoc.kategori,
            namaFile: this.newDoc.nomorPeraturan.replace(/\\s+/g, '_') + '.pdf',
            ukuranFile: '1.5 MB',
            tanggalUnggah: '16 Nov 2026',
            jumlahChunk: Math.max(1, chunks.length),
            statusVector: 'Terindeks pgvector',
            pasalRujukan: this.newDoc.pasalRujukan || 'Pasal 1',
            ringkasanIsi: text,
            chunks: chunks,
            isCustomUploaded: true,
            kataKunci: [this.newDoc.kategori.toLowerCase(), ...this.newDoc.judul.toLowerCase().split(' ')],
            cuplikanPasal: (this.newDoc.pasalRujukan || 'Pasal 1') + ': ' + text
          });
          this.newDoc = { judul: '', nomorPeraturan: '', kategori: 'TPP', pasalRujukan: '', ringkasanIsi: '' };
        },
        deleteDoc(id) {
          this.documents = this.documents.filter(d => d.id !== id);
        }
      };
    }
  </script>
</body>
</html>`;
}
