import { DocumentChunk } from '../utils/documentParser';

export type UserRole = 'pegawai' | 'admin' | 'pimpinan';

export type RegulationCategory =
  | 'TPP'
  | 'Cuti'
  | 'Kenaikan Pangkat'
  | 'Disiplin ASN'
  | 'Mutasi'
  | 'SOP Kepegawaian';

export interface KnowledgeDocument {
  id: string;
  judul: string;
  nomorPeraturan: string;
  kategori: RegulationCategory;
  namaFile: string;
  ukuranFile: string;
  tanggalUnggah: string;
  jumlahChunk: number;
  statusVector: 'Terindeks pgvector' | 'Pembaruan';
  pasalRujukan: string;
  ringkasanIsi: string;
  kataKunci: string[];
  cuplikanPasal: string;
  chunks: DocumentChunk[];
  isiLengkap?: string;
  isCustomUploaded?: boolean;
}

export interface CitationSource {
  nomorPeraturan: string;
  pasal: string;
  judulDokumen: string;
  kategori: RegulationCategory;
  cuplikan: string;
  skorRelevansi?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  citation?: CitationSource;
  responseTimeSec?: number;
  feedback?: 'puas' | 'kurang' | null;
  logId?: string;
}

export interface ConversationLog {
  id: string;
  namaPegawai: string;
  unitKerja: string;
  pertanyaan: string;
  kategori: RegulationCategory;
  rujukanPasal: string;
  waktuAkses: string;
  waktuResponsSec: number;
  status: 'Terjawab' | 'Perlu Tinjauan';
  kepuasan: 'Puas' | 'Kurang Tepat' | 'Belum Dinilai';
}

export const REGULATION_CATEGORIES: RegulationCategory[] = [
  'TPP',
  'Cuti',
  'Kenaikan Pangkat',
  'Disiplin ASN',
  'Mutasi',
  'SOP Kepegawaian',
];

export const INITIAL_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'doc-tpp-2025',
    judul: 'Pedoman Pemberian Tambahan Penghasilan Pegawai (TPP) ASN Kabupaten Sidoarjo',
    nomorPeraturan: 'Perbup Sidoarjo No. 49 Tahun 2025',
    kategori: 'TPP',
    namaFile: 'Perbup_Sidoarjo_49_2025_TPP_ASN.pdf',
    ukuranFile: '2.4 MB',
    tanggalUnggah: '12 Nov 2026',
    jumlahChunk: 68,
    statusVector: 'Terindeks pgvector',
    pasalRujukan: 'Pasal 12 ayat 3',
    ringkasanIsi:
      'Besaran TPP ASN BPKAD dihitung berdasarkan 60% aspek produktivitas kerja (pengisian e-Kinerja / SKP bulanan) dan 40% aspek disiplin kerja (rekapitulasi e-Presensi). Keterlambatan masuk kerja atau pulang cepat dikenakan pengurangan proporsional sesuai tingkat pelanggaran harian.',
    kataKunci: ['tpp', 'tambahan penghasilan', 'tunjangan', 'ekinerja', 'produktivitas'],
    cuplikanPasal:
      'Pasal 12 ayat (3): "Pembayaran komponen Tambahan Penghasilan Pegawai sebagaimana dimaksud pada ayat (1) ditetapkan dengan bobot 60% (enam puluh persen) berdasarkan penilaian produktivitas kerja melalui aplikasi kinerja dan 40% (empat puluh persen) berdasarkan kepatuhan disiplin kerja pegawai yang tercatat pada sistem presensi elektronik."',
    chunks: [
      {
        id: 'doc-tpp-2025-c1',
        pasalLabel: 'Pasal 12 ayat (3) — Komponen Bobot TPP',
        content:
          'Pembayaran komponen Tambahan Penghasilan Pegawai (TPP) ASN Kabupaten Sidoarjo ditetapkan dengan bobot 60% berdasarkan penilaian produktivitas kerja melalui aplikasi e-Kinerja / capaian SKP bulanan dan 40% berdasarkan kepatuhan disiplin kerja pegawai yang tercatat pada sistem presensi elektronik (e-Presensi).',
      },
      {
        id: 'doc-tpp-2025-c2',
        pasalLabel: 'Pasal 14 ayat (1)-(2) — Pemotongan & Pengurangan TPP',
        content:
          'Keterlambatan masuk kerja, pulang sebelum waktunya, atau tidak mengikuti apel pagi tanpa alasan yang sah dikenakan pengurangan proporsional pada komponen disiplin kerja sebesar 0,5% hingga 3% per kejadian sesuai kelas jabatan. ASN dengan capaian kinerja di bawah 85% mengalami penyesuaian pada komponen produktivitas kerja.',
      },
    ],
  },
  {
    id: 'doc-cuti-2024',
    judul: 'Tata Cara Pemberian Cuti Pegawai Negeri Sipil dan PPPK di Lingkungan Pemkab Sidoarjo',
    nomorPeraturan: 'Perbup Sidoarjo No. 18 Tahun 2024 jo. Perka BKN No. 24 Tahun 2017',
    kategori: 'Cuti',
    namaFile: 'Perbup_18_2024_Tata_Cara_Cuti_ASN.pdf',
    ukuranFile: '1.8 MB',
    tanggalUnggah: '08 Nov 2026',
    jumlahChunk: 54,
    statusVector: 'Terindeks pgvector',
    pasalRujukan: 'Pasal 6 ayat 1 dan ayat 2',
    ringkasanIsi:
      'Syarat cuti tahunan ASN meliputi: masa kerja minimal 1 tahun terus-menerus, kuota 12 hari kerja per tahun, pengajuan paling lambat 3 hari kerja sebelum pelaksanaan melalui e-Cuti, serta akumulasi sisa cuti tahun lalu maksimal 6 hari kerja.',
    kataKunci: ['cuti tahunan', 'cuti', 'ecuti', '12 hari'],
    cuplikanPasal:
      'Pasal 6 ayat (1): "PNS dan calon PNS yang telah bekerja paling kurang 1 (satu) tahun secara terus menerus berhak atas cuti tahunan selama 12 (dua belas) hari kerja." Ayat (2): "Permohonan cuti tahunan diajukan secara tertulis atau melalui sistem kepegawaian elektronik paling lambat 3 (tiga) hari kerja sebelum tanggal mulai cuti kepada pejabat yang berwenang."',
    chunks: [
      {
        id: 'doc-cuti-2024-c1',
        pasalLabel: 'Pasal 6 ayat (1)-(2) — Syarat & Kuota Cuti Tahunan',
        content:
          'PNS dan CPNS yang telah bekerja sekurang-kurangnya 1 (satu) tahun secara terus-menerus berhak atas Cuti Tahunan selama 12 (dua belas) hari kerja. Permohonan diajukan melalui aplikasi e-Cuti paling lambat 3 (tiga) hari kerja sebelum tanggal mulai cuti kepada atasan langsung (Kasubbag/Kabid). Sisa cuti tahun sebelumnya dapat diakumulasikan paling banyak 6 (enam) hari kerja.',
      },
      {
        id: 'doc-cuti-2024-c2',
        pasalLabel: 'Pasal 10 & Pasal 15 — Cuti Sakit dan Cuti Melahirkan',
        content:
          'PNS yang sakit lebih dari 1 hari sampai dengan 14 hari wajib melampirkan surat keterangan dokter. Untuk kelahiran anak pertama sampai dengan anak ketiga, PNS wanita berhak atas Cuti Melahirkan selama 3 (tiga) bulan dengan tetap menerima penghasilan penuh sesuai ketentuan.',
      },
    ],
  },
  {
    id: 'doc-kp-2024',
    judul: 'Pedoman Periodisasi Kenaikan Pangkat PNS dan Penyesuaian Ijazah Penata Muda',
    nomorPeraturan: 'Peraturan BKN No. 4 Tahun 2023 & Perbup Sidoarjo No. 31 Tahun 2024',
    kategori: 'Kenaikan Pangkat',
    namaFile: 'Juknis_Kenaikan_Pangkat_Penata_Muda_2024.pdf',
    ukuranFile: '3.1 MB',
    tanggalUnggah: '05 Nov 2026',
    jumlahChunk: 74,
    statusVector: 'Terindeks pgvector',
    pasalRujukan: 'Pasal 8 ayat 2',
    ringkasanIsi:
      'Kenaikan pangkat Penata Muda (III/a) dilaksanakan dalam 6 periode per tahun (Feb, Apr, Jun, Agu, Okt, Des) dengan syarat SK CPNS/PNS, SK Pangkat terakhir, SKP 2 tahun terakhir bernilai Baik, ijazah S-1/D-IV terakreditasi, izin/tugas belajar, dan sertifikat lulus UPKP.',
    kataKunci: ['kenaikan pangkat', 'penata muda', 'iii/a', 'upkp', 'penyesuaian ijazah'],
    cuplikanPasal:
      'Pasal 8 ayat (2): "Usul kenaikan pangkat Penata Muda golongan ruang III/a bagi PNS yang memperoleh ijazah Sarjana (S-1) atau Diploma IV wajib melampirkan surat tugas belajar atau izin belajar, fotokopi ijazah yang dilegalisir oleh pejabat berwenang, sertifikat lulus ujian dinas penyesuaian ijazah, serta dokumen penilaian kinerja dua tahun terakhir paling rendah bernilai Baik."',
    chunks: [
      {
        id: 'doc-kp-2024-c1',
        pasalLabel: 'Pasal 4 & Pasal 8 ayat (2) — Prosedur Kenaikan Pangkat Penata Muda (III/a)',
        content:
          'Periodisasi Kenaikan Pangkat PNS ditetapkan 6 kali dalam setahun: 1 Februari, 1 April, 1 Juni, 1 Agustus, 1 Oktober, dan 1 Desember. Usul kenaikan pangkat Penata Muda golongan ruang III/a wajib melampirkan SK CPNS & PNS, SK Pangkat terakhir, SKP 2 tahun terakhir minimal predikat Baik, surat izin belajar/tugas belajar, ijazah S-1/D-IV terakreditasi dilegalisir, serta sertifikat Lulus Ujian Penyesuaian Kenaikan Pangkat (UPKP). Berkas diverifikasi Subbag Kepegawaian BPKAD sebelum dikirim ke BKPSDM.',
      },
    ],
  },
  {
    id: 'doc-disiplin-2025',
    judul: 'Penegakan Disiplin Kerja dan Ketentuan Jam Kerja ASN BPKAD Kabupaten Sidoarjo',
    nomorPeraturan: 'PP No. 94 Tahun 2021 jo. Perbup Sidoarjo No. 12 Tahun 2025',
    kategori: 'Disiplin ASN',
    namaFile: 'Perbup_12_2025_Disiplin_Jam_Kerja_ASN.pdf',
    ukuranFile: '1.5 MB',
    tanggalUnggah: '02 Nov 2026',
    jumlahChunk: 42,
    statusVector: 'Terindeks pgvector',
    pasalRujukan: 'Pasal 4 ayat 2',
    ringkasanIsi:
      'Jam kerja efektif ASN BPKAD Kabupaten Sidoarjo adalah 37 jam 30 menit per minggu (Senin–Kamis 07.30–16.00 WIB, Jumat 07.00–15.00 WIB), dengan kewajiban rekam presensi pada titik koordinat kantor.',
    kataKunci: ['disiplin', 'jam kerja', 'presensi', 'sanksi'],
    cuplikanPasal:
      'Pasal 4 ayat (2): "Setiap ASN wajib memenuhi jumlah jam kerja efektif paling sedikit 37 (tiga puluh tujuh) jam 30 (tiga puluh) menit dalam 1 (satu) minggu tidak termasuk waktu istirahat, serta melakukan rekam kehadiran masuk dan pulang kerja pada titik koordinat kantor BPKAD."',
    chunks: [
      {
        id: 'doc-disiplin-2025-c1',
        pasalLabel: 'Pasal 4 ayat (2) & Pasal 7 — Jam Kerja & Disiplin ASN',
        content:
          'Setiap ASN BPKAD Kabupaten Sidoarjo wajib memenuhi jam kerja efektif minimal 37 jam 30 menit per minggu: Senin–Kamis pukul 07.30–16.00 WIB dan Jumat pukul 07.00–15.00 WIB, disertai presensi elektronik pada titik koordinat kantor. Ketidakhadiran tanpa alasan sah secara kumulatif lebih dari 3 hari kerja dalam setahun dikenakan sanksi disiplin bertahap mulai teguran lisan/tertulis hingga hukuman disiplin berat.',
      },
    ],
  },
  {
    id: 'doc-mutasi-2024',
    judul: 'Prosedur Alih Tugas dan Mutasi ASN Antar Perangkat Daerah Kabupaten Sidoarjo',
    nomorPeraturan: 'Perbup Sidoarjo No. 27 Tahun 2024',
    kategori: 'Mutasi',
    namaFile: 'Perbup_27_2024_Mutasi_Internal_Pemkab.pdf',
    ukuranFile: '1.2 MB',
    tanggalUnggah: '29 Okt 2026',
    jumlahChunk: 36,
    statusVector: 'Terindeks pgvector',
    pasalRujukan: 'Pasal 5 ayat 1 dan 3',
    ringkasanIsi:
      'Mutasi ASN antar perangkat daerah mensyaratkan masa tugas minimal 2 tahun pada OPD asal, surat persetujuan melepas Kepala BPKAD, surat bersedia menerima Kepala OPD tujuan sesuai ABK, dan penerbitan SK oleh BKPSDM.',
    kataKunci: ['mutasi', 'alih tugas', 'pindah opd', 'bkpsdm'],
    cuplikanPasal:
      'Pasal 5 ayat (1): "PNS yang mengajukan permohonan mutasi antar Perangkat Daerah wajib telah bertugas paling singkat 2 (dua) tahun terhitung sejak tanggal penetapan penempatan terakhir pada Perangkat Daerah asal." Ayat (3): "Permohonan dilampiri surat persetujuan Kepala Perangkat Daerah asal dan surat kesediaan menerima dari Kepala Perangkat Daerah tujuan."',
    chunks: [
      {
        id: 'doc-mutasi-2024-c1',
        pasalLabel: 'Pasal 5 ayat (1) dan ayat (3) — Syarat Mutasi Antar OPD',
        content:
          'PNS yang mengajukan mutasi atau alih tugas antar Perangkat Daerah wajib telah bertugas paling singkat 2 (dua) tahun di unit kerja asal (BPKAD Kab. Sidoarjo). Permohonan tertulis harus melampirkan surat persetujuan melepas dari Kepala BPKAD, surat kesediaan menerima dari Kepala OPD tujuan sesuai peta jabatan/ABK, serta diproses melalui verifikasi BKPSDM Kab. Sidoarjo.',
      },
    ],
  },
  {
    id: 'doc-sop-2025',
    judul: 'SOP Layanan Administrasi Kepegawaian Internal (KGB, Karis/Karsu, dan Pensiun)',
    nomorPeraturan: 'SOP BPKAD-KP-04 Tahun 2025',
    kategori: 'SOP Kepegawaian',
    namaFile: 'SOP_BPKAD_KP_04_Layanan_Kepegawaian.pdf',
    ukuranFile: '980 KB',
    tanggalUnggah: '24 Okt 2026',
    jumlahChunk: 28,
    statusVector: 'Terindeks pgvector',
    pasalRujukan: 'Bab III Bagian B Poin 2',
    ringkasanIsi:
      'Pengajuan Kenaikan Gaji Berkala (KGB) diproses 2 bulan sebelum TMT dengan melampirkan SK pangkat/KGB terakhir dan SKP tahun berjalan. Verifikasi berkas oleh Subbag Umum & Kepegawaian maksimal 2 hari kerja.',
    kataKunci: ['kgb', 'kenaikan gaji berkala', 'karis', 'karsu', 'pensiun'],
    cuplikanPasal:
      'Bab III Bagian B Poin 2: "Subbagian Umum dan Kepegawaian melakukan verifikasi kelengkapan berkas Kenaikan Gaji Berkala paling lambat 2 (dua) hari kerja sejak dokumen diunggah oleh pegawai pada sistem kepegawaian BPKAD."',
    chunks: [
      {
        id: 'doc-sop-2025-c1',
        pasalLabel: 'Bab III Bagian B Poin 2 — Layanan KGB & Administrasi Kepegawaian',
        content:
          'Pengajuan Kenaikan Gaji Berkala (KGB), Karis/Karsu, dan persiapan pensiun diproses oleh Subbagian Umum dan Kepegawaian BPKAD. Berkas KGB wajib diunggah 2 bulan sebelum TMT dengan lampiran SK pangkat/KGB terakhir dan SKP tahun berjalan. Verifikasi kelengkapan berkas diselesaikan maksimal 2 hari kerja sebelum diteruskan ke Bidang Perbendaharaan.',
      },
    ],
  },
];

export const INITIAL_LOGS: ConversationLog[] = [
  {
    id: 'log-101',
    namaPegawai: 'Rina Kusuma, S.E.',
    unitKerja: 'Bidang Anggaran',
    pertanyaan: 'Berapa ketentuan perhitungan TPP terbaru dan bobot produktivitas kerja?',
    kategori: 'TPP',
    rujukanPasal: 'Perbup Sidoarjo No. 49 Tahun 2025 Pasal 12 ayat 3',
    waktuAkses: '16 Nov 2026 · 09:42',
    waktuResponsSec: 1.34,
    status: 'Terjawab',
    kepuasan: 'Puas',
  },
  {
    id: 'log-102',
    namaPegawai: 'Ahmad Fauzi, A.Md.',
    unitKerja: 'Bidang Perbendaharaan',
    pertanyaan: 'Apa saja syarat cuti tahunan dan batas pengajuannya?',
    kategori: 'Cuti',
    rujukanPasal: 'Perbup Sidoarjo No. 18 Tahun 2024 Pasal 6 ayat 1 dan ayat 2',
    waktuAkses: '16 Nov 2026 · 09:18',
    waktuResponsSec: 1.52,
    status: 'Terjawab',
    kepuasan: 'Puas',
  },
  {
    id: 'log-103',
    namaPegawai: 'Dewi Lestari, S.Ak.',
    unitKerja: 'Bidang Akuntansi',
    pertanyaan: 'Bagaimana prosedur kenaikan pangkat penata muda III/a penyesuaian ijazah?',
    kategori: 'Kenaikan Pangkat',
    rujukanPasal: 'Peraturan BKN No. 4 Tahun 2023 Pasal 8 ayat 2',
    waktuAkses: '16 Nov 2026 · 08:55',
    waktuResponsSec: 1.88,
    status: 'Terjawab',
    kepuasan: 'Puas',
  },
  {
    id: 'log-104',
    namaPegawai: 'Budi Santoso, S.Sos.',
    unitKerja: 'Bidang Pengelolaan Aset',
    pertanyaan: 'Bagaimana syarat mutasi antar perangkat daerah di Pemkab Sidoarjo?',
    kategori: 'Mutasi',
    rujukanPasal: 'Perbup Sidoarjo No. 27 Tahun 2024 Pasal 5 ayat 1 dan 3',
    waktuAkses: '16 Nov 2026 · 08:30',
    waktuResponsSec: 1.65,
    status: 'Terjawab',
    kepuasan: 'Puas',
  },
  {
    id: 'log-105',
    namaPegawai: 'Siti Aminah, S.E.',
    unitKerja: 'Sekretariat BPKAD',
    pertanyaan: 'Apakah jam kerja efektif ASN selama bulan biasa sama dengan hari Jumat?',
    kategori: 'Disiplin ASN',
    rujukanPasal: 'Perbup Sidoarjo No. 12 Tahun 2025 Pasal 4 ayat 2',
    waktuAkses: '16 Nov 2026 · 08:11',
    waktuResponsSec: 1.29,
    status: 'Terjawab',
    kepuasan: 'Puas',
  },
  {
    id: 'log-106',
    namaPegawai: 'Hendra Wijaya, S.Kom.',
    unitKerja: 'Bidang Pendapatan & Pelaporan',
    pertanyaan: 'Kapan berkas KGB harus diserahkan sebelum TMT berlaku?',
    kategori: 'SOP Kepegawaian',
    rujukanPasal: 'SOP BPKAD-KP-04 Tahun 2025 Bab III Bagian B Poin 2',
    waktuAkses: '15 Nov 2026 · 15:47',
    waktuResponsSec: 2.04,
    status: 'Terjawab',
    kepuasan: 'Kurang Tepat',
  },
  {
    id: 'log-107',
    namaPegawai: 'Nurul Hidayati, S.E.',
    unitKerja: 'Bidang Anggaran',
    pertanyaan: 'Apakah sisa cuti tahun lalu bisa diambil bersama cuti tahun ini?',
    kategori: 'Cuti',
    rujukanPasal: 'Perbup Sidoarjo No. 18 Tahun 2024 Pasal 6 ayat 1 dan ayat 2',
    waktuAkses: '15 Nov 2026 · 14:22',
    waktuResponsSec: 1.48,
    status: 'Terjawab',
    kepuasan: 'Puas',
  },
];

export const QUICK_PROMPTS = [
  'Apa saja syarat cuti tahunan?',
  'Bagaimana prosedur kenaikan pangkat penata muda?',
  'Berapa ketentuan perhitungan TPP terbaru?',
  'Apa aturan disiplin jam kerja ASN Sidoarjo?',
  'Bagaimana syarat mutasi antar perangkat daerah?',
];

export interface RagResult {
  answer: string;
  citation: CitationSource;
  matchedCategory: RegulationCategory;
  responseTimeSec: number;
  status: 'Terjawab' | 'Perlu Tinjauan';
}

const STOPWORDS = new Set([
  'apa',
  'apakah',
  'bagaimana',
  'siapa',
  'kapan',
  'dimana',
  'mengapa',
  'kenapa',
  'berapa',
  'saja',
  'yang',
  'dan',
  'atau',
  'di',
  'ke',
  'dari',
  'untuk',
  'pada',
  'dalam',
  'tentang',
  'mengenai',
  'menurut',
  'sesuai',
  'dengan',
  'adalah',
  'ialah',
  'yaitu',
  'bisa',
  'dapat',
  'boleh',
  'harus',
  'wajib',
  'jika',
  'apabila',
  'bila',
  'kalau',
  'mohon',
  'tolong',
  'jelaskan',
  'sebutkan',
  'terkait',
  'soal',
  'cara',
  'aturan',
  'ketentuan',
  'regulasi',
  'dokumen',
  'peraturan',
  'terbaru',
  'baru',
  'ini',
  'itu',
  'saya',
  'kami',
  'kita',
  'nya',
  'ada',
  'tidak',
  'belum',
  'sudah',
  'bpkad',
  'sidoarjo',
  'kabupaten',
  'pemkab',
  'asn',
  'pns',
  'pegawai',
]);

function stemIndonesianToken(word: string): string {
  let w = word.toLowerCase().trim();
  if (w.length <= 4) return w;

  // Strip common suffixes
  w = w.replace(/(nya|lah|kah)$/, '');
  if (w.length > 5) {
    w = w.replace(/(kan|an)$/, '');
  }
  // Strip common prefixes (lightweight morphological normalization)
  w = w.replace(/^(meng|meny|mem|men|me|peng|peny|pem|pen|per|ber|ter|di|ke|se)/, '');
  return w.length >= 3 ? w : word.toLowerCase();
}

function tokenizeQuery(text: string): { rawTokens: string[]; stemmedTokens: string[] } {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s/-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));

  const rawTokens = Array.from(new Set(words));
  const stemmedTokens = Array.from(new Set(words.map(stemIndonesianToken)));
  return { rawTokens, stemmedTokens };
}

function buildBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

export function querySipkaKnowledgeBase(
  query: string,
  documents: KnowledgeDocument[]
): RagResult {
  const normalizedQuery = query.toLowerCase().trim();
  const { rawTokens, stemmedTokens } = tokenizeQuery(normalizedQuery);
  const queryWordsAll = normalizedQuery
    .replace(/[^\w\s/-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  const bigrams = buildBigrams(queryWordsAll.filter((w) => !STOPWORDS.has(w)));

  // Flatten all chunks across all documents for IDF computation
  const allChunkEntries: Array<{
    doc: KnowledgeDocument;
    chunk: DocumentChunk;
    combinedText: string;
    stemmedSet: Set<string>;
  }> = [];

  for (const doc of documents) {
    const docChunks: DocumentChunk[] =
      doc.chunks && doc.chunks.length > 0
        ? doc.chunks
        : [
            {
              id: `${doc.id}-fallback-chunk`,
              pasalLabel: doc.pasalRujukan || 'Ketentuan Utama',
              content: doc.ringkasanIsi || doc.cuplikanPasal,
            },
          ];

    for (const chunk of docChunks) {
      const combinedText =
        `${doc.judul} ${doc.nomorPeraturan} ${doc.kategori} ${chunk.pasalLabel} ${chunk.content}`.toLowerCase();
      const wordsInChunk = combinedText
        .replace(/[^\w\s/-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 2);
      const stemmedSet = new Set<string>();
      for (const w of wordsInChunk) {
        stemmedSet.add(w);
        stemmedSet.add(stemIndonesianToken(w));
      }
      allChunkEntries.push({ doc, chunk, combinedText, stemmedSet });
    }
  }

  // Compute IDF for each stemmed query token
  const totalChunks = Math.max(1, allChunkEntries.length);
  const idfMap = new Map<string, number>();
  for (const st of stemmedTokens) {
    const df = allChunkEntries.filter((entry) => entry.stemmedSet.has(st)).length;
    const idf = Math.log(1 + (totalChunks - df + 0.5) / (df + 0.5)) + 0.5;
    idfMap.set(st, idf);
  }

  // Score every chunk
  const scoredChunks = allChunkEntries.map((entry) => {
    const { doc, chunk, combinedText, stemmedSet } = entry;
    const chunkOnlyLower = `${chunk.pasalLabel} ${chunk.content}`.toLowerCase();
    const docMetaLower = `${doc.judul} ${doc.nomorPeraturan} ${doc.kategori}`.toLowerCase();

    let score = 0;
    let matchedTokenCount = 0;

    // 1. Exact raw token match inside chunk content (weighted by IDF)
    for (let i = 0; i < rawTokens.length; i++) {
      const raw = rawTokens[i];
      const st = stemmedTokens[i];
      const idf = idfMap.get(st) ?? 1;

      if (chunkOnlyLower.includes(raw)) {
        score += 3.2 * idf;
        matchedTokenCount++;
      } else if (stemmedSet.has(st)) {
        score += 2.2 * idf;
        matchedTokenCount++;
      } else if (docMetaLower.includes(raw)) {
        score += 2.0 * idf;
        matchedTokenCount++;
      }
    }

    // 2. Exact bigram phrase bonus
    for (const bg of bigrams) {
      if (chunkOnlyLower.includes(bg)) {
        score += 5.5;
      } else if (docMetaLower.includes(bg)) {
        score += 4.0;
      }
    }

    // 3. Regulation number / Pasal / Year explicit match
    const numberMatches = normalizedQuery.match(/\b(pasal\s+\d+|\d{2,4})\b/g) || [];
    for (const nm of numberMatches) {
      if (combinedText.includes(nm)) {
        score += 7.0;
      }
    }

    // 4. Explicit file name / document title / category match
    if (normalizedQuery.includes(doc.nomorPeraturan.toLowerCase())) {
      score += 12.0;
    }
    if (normalizedQuery.includes(doc.kategori.toLowerCase())) {
      score += 3.0;
    }

    // 5. Custom uploaded documents get a slight recency & priority boost when they actually match query terms
    if (doc.isCustomUploaded && matchedTokenCount >= 1) {
      score += 2.2 + matchedTokenCount * 0.6;
    }

    return {
      doc,
      chunk,
      score,
      matchedTokenCount,
    };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const topHit = scoredChunks[0];
  const simulatedLatency = Number((1.05 + Math.random() * 1.1).toFixed(2));

  if (topHit && topHit.score >= 2.2 && topHit.matchedTokenCount >= 1) {
    const winningDoc = topHit.doc;

    // Collect top 2 relevant chunks from the SAME winning document for rich synthesis
    const sameDocTopChunks = scoredChunks
      .filter((item) => item.doc.id === winningDoc.id && item.score >= topHit.score * 0.45)
      .slice(0, 2);

    const primaryChunk = sameDocTopChunks[0].chunk;
    const secondaryChunk = sameDocTopChunks[1]?.chunk;

    let answerBody = '';
    if (sameDocTopChunks.length > 1 && secondaryChunk && secondaryChunk.id !== primaryChunk.id) {
      answerBody =
        `Berdasarkan **${winningDoc.judul}** (*${winningDoc.nomorPeraturan}*), berikut ketentuan yang relevan dengan pertanyaan Anda:\n\n` +
        `**${primaryChunk.pasalLabel}**\n${primaryChunk.content}\n\n` +
        `**${secondaryChunk.pasalLabel}**\n${secondaryChunk.content}`;
    } else {
      answerBody =
        `Berdasarkan **${winningDoc.judul}** (*${winningDoc.nomorPeraturan}*), berikut ketentuan pada **${primaryChunk.pasalLabel}**:\n\n` +
        `${primaryChunk.content}`;
    }

    return {
      answer: answerBody,
      citation: {
        nomorPeraturan: winningDoc.nomorPeraturan,
        pasal: primaryChunk.pasalLabel,
        judulDokumen: winningDoc.judul,
        kategori: winningDoc.kategori,
        cuplikan: primaryChunk.content,
        skorRelevansi: Math.min(99, Math.round(62 + Math.min(37, topHit.score * 2.4))),
      },
      matchedCategory: winningDoc.kategori,
      responseTimeSec: simulatedLatency,
      status: 'Terjawab',
    };
  }

  const fallbackDoc = documents[0] || INITIAL_DOCUMENTS[0];
  return {
    answer:
      'Maaf, pertanyaan Anda belum menemukan kecocokan pasal yang cukup spesifik pada dokumen regulasi yang terindeks saat ini.\n\n' +
      'Coba sertakan kata kunci spesifik dari regulasi yang dimaksud (misalnya topik **cuti melahirkan**, **bobot TPP**, **penata muda**, **mutasi**, atau **nomor peraturan/pasal** yang baru saja Anda unggah).',
    citation: {
      nomorPeraturan: fallbackDoc.nomorPeraturan,
      pasal: fallbackDoc.pasalRujukan,
      judulDokumen: fallbackDoc.judul,
      kategori: fallbackDoc.kategori,
      cuplikan: fallbackDoc.cuplikanPasal,
    },
    matchedCategory: fallbackDoc.kategori,
    responseTimeSec: simulatedLatency,
    status: 'Perlu Tinjauan',
  };
}
