import React, { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, TrendingUp } from 'lucide-react';
import { ConversationLog, RegulationCategory } from '../data/sipkaData';

interface PimpinanAnalyticsViewProps {
  logs: ConversationLog[];
}

type PeriodKey = 'bulan' | 'triwulan' | 'tahun';

interface TopicInsight {
  kategori: RegulationCategory;
  baseMonthlyCount: number;
  pasalDominan: string;
  isuUtama: string;
  rekomendasiPimpinan: string;
  pertumbuhan: string;
}

const TOPIC_INSIGHTS: TopicInsight[] = [
  {
    kategori: 'TPP',
    baseMonthlyCount: 518,
    pasalDominan: 'Perbup Sidoarjo No. 49 Tahun 2025 Pasal 12 ayat 3',
    isuUtama:
      'Pegawai paling sering menanyakan pembagian bobot 60% produktivitas e-Kinerja dan dampak keterlambatan presensi terhadap pemotongan TPP bulanan.',
    rekomendasiPimpinan:
      'Terbitkan memo pengingat batas akhir pengisian SKP harian sebelum tanggal 5 setiap bulan agar tidak terjadi pemotongan komponen produktivitas.',
    pertumbuhan: '+14,2%',
  },
  {
    kategori: 'Cuti',
    baseMonthlyCount: 384,
    pasalDominan: 'Perbup Sidoarjo No. 18 Tahun 2024 Pasal 6 ayat 1 & 2',
    isuUtama:
      'Pertanyaan terpusat pada batas waktu pengajuan H-3 via e-Cuti serta mekanisme penggabungan sisa cuti tahun sebelumnya maksimal 6 hari.',
    rekomendasiPimpinan:
      'Optimalkan persetujuan berjenjang atasan langsung pada aplikasi e-Cuti agar pengajuan mendesak terproses di bawah 24 jam.',
    pertumbuhan: '+8,6%',
  },
  {
    kategori: 'Kenaikan Pangkat',
    baseMonthlyCount: 276,
    pasalDominan: 'Peraturan BKN No. 4 Tahun 2023 Pasal 8 ayat 2',
    isuUtama:
      'Banyak ASN golongan II menanyakan syarat penyesuaian ijazah S-1 ke Penata Muda (III/a) dan jadwal 6 periode kenaikan pangkat terbaru.',
    rekomendasiPimpinan:
      'Jadwalkan klinik verifikasi berkas kenaikan pangkat bersama Subbag Umum & Kepegawaian 1 bulan sebelum batas periode BKPSDM.',
    pertumbuhan: '+11,4%',
  },
  {
    kategori: 'Mutasi',
    baseMonthlyCount: 162,
    pasalDominan: 'Perbup Sidoarjo No. 27 Tahun 2024 Pasal 5 ayat 1 & 3',
    isuUtama:
      'Pertanyaan berkisar pada syarat minimal masa tugas 2 tahun di BPKAD dan format surat persetujuan pelepasan antar perangkat daerah.',
    rekomendasiPimpinan:
      'Selaraskan peta kebutuhan jabatan (ABK) antar bidang sebelum memberikan persetujuan pindah tugas agar operasional anggaran tetap terjaga.',
    pertumbuhan: '+3,1%',
  },
  {
    kategori: 'Disiplin ASN',
    baseMonthlyCount: 94,
    pasalDominan: 'PP No. 94 Tahun 2021 jo. Perbup 12/2025 Pasal 4 ayat 2',
    isuUtama:
      'Konfirmasi ketentuan jam kerja efektif 37,5 jam per minggu dan toleransi koordinat titik presensi saat penugasan luar kantor.',
    rekomendasiPimpinan:
      'Sosialisasikan fitur unggah surat tugas dinas luar pada e-Presensi untuk menekan kesalahan pencatatan ketidakhadiran.',
    pertumbuhan: '-2,4%',
  },
  {
    kategori: 'SOP Kepegawaian',
    baseMonthlyCount: 48,
    pasalDominan: 'SOP BPKAD-KP-04 Tahun 2025 Bab III Bagian B',
    isuUtama:
      'Alur verifikasi Kenaikan Gaji Berkala (KGB) 2 bulan sebelum TMT serta kelengkapan berkas Karis/Karsu.',
    rekomendasiPimpinan:
      'Aktifkan notifikasi otomatis pengingat KGB dua bulan sebelum TMT bagi seluruh bidang di BPKAD.',
    pertumbuhan: '+5,0%',
  },
];

const PERIOD_MULTIPLIER: Record<PeriodKey, { factor: number; label: string }> = {
  bulan: { factor: 1, label: 'November 2026' },
  triwulan: { factor: 2.85, label: 'Triwulan IV 2026' },
  tahun: { factor: 10.4, label: 'Tahun Berjalan 2026' },
};

const WEEKLY_TREND = [
  { label: 'Minggu 1', total: 312 },
  { label: 'Minggu 2', total: 368 },
  { label: 'Minggu 3', total: 405 },
  { label: 'Minggu 4 (Berjalan)', total: 397 },
];

export const PimpinanAnalyticsView: React.FC<PimpinanAnalyticsViewProps> = ({ logs }) => {
  const [period, setPeriod] = useState<PeriodKey>('bulan');
  const [selectedTopic, setSelectedTopic] = useState<RegulationCategory>('TPP');

  // Count live additions from user session logs beyond the initial 7 logs
  const extraLogs = Math.max(0, logs.length - 7);

  const topicStats = useMemo(() => {
    const mult = PERIOD_MULTIPLIER[period].factor;
    return TOPIC_INSIGHTS.map((item) => {
      const liveExtrasInCat = logs
        .slice(0, extraLogs)
        .filter((l) => l.kategori === item.kategori).length;
      const count = Math.round(item.baseMonthlyCount * mult) + liveExtrasInCat;
      return {
        ...item,
        count,
      };
    }).sort((a, b) => b.count - a.count);
  }, [period, logs, extraLogs]);

  const totalConsultations = useMemo(
    () => topicStats.reduce((sum, t) => sum + t.count, 0),
    [topicStats]
  );

  const maxTopicCount = Math.max(...topicStats.map((t) => t.count), 1);
  const topCategory = topicStats[0];
  const activeInsight =
    topicStats.find((t) => t.kategori === selectedTopic) || topicStats[0];

  const avgResponseTime = useMemo(() => {
    if (logs.length === 0) return 1.64;
    return logs.reduce((s, l) => s + l.waktuResponsSec, 0) / logs.length;
  }, [logs]);

  const maxWeekly = Math.max(...WEEKLY_TREND.map((w) => w.total));

  return (
    <div className="space-y-6">
      {/* Executive Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Ringkasan Analitik Konsultasi Kepegawaian Pimpinan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi tren pertanyaan ASN BPKAD Kabupaten Sidoarjo · Periode {PERIOD_MULTIPLIER[period].label}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {(
            [
              { key: 'bulan', label: 'Bulan Ini' },
              { key: 'triwulan', label: 'Triwulan' },
              { key: 'tahun', label: 'Tahun 2026' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriod(item.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                period === item.key
                  ? 'bg-[#1e3a8a] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executive KPI Cards */}
      <section aria-label="Metrik Eksekutif Pimpinan" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Total Konsultasi ({PERIOD_MULTIPLIER[period].label})</p>
          <p className="text-3xl font-bold text-slate-900 mt-1.5 font-mono tabular-nums">
            {totalConsultations.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-[#047857] font-medium mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+11,8% dibanding periode lalu</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Tingkat Kepuasan Pegawai</p>
          <p className="text-3xl font-bold text-[#059669] mt-1.5 font-mono tabular-nums">
            97,23%
          </p>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Berdasarkan evaluasi umpan balik ASN</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Kategori Konsultasi Terpopuler</p>
          <p className="text-2xl font-bold text-[#1e3a8a] mt-2 truncate">
            {topCategory.kategori}
          </p>
          <p className="text-xs text-slate-500 mt-1.5 font-mono tabular-nums">
            {topCategory.count.toLocaleString('id-ID')} pertanyaan ({((topCategory.count / totalConsultations) * 100).toFixed(1)}%)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Rata-rata Kecepatan Jawab</p>
          <p className="text-3xl font-bold text-slate-900 mt-1.5 font-mono tabular-nums">
            {avgResponseTime.toFixed(2)} dtk
          </p>
          <p className="text-xs text-slate-500 mt-1.5">
            Target layanan &lt; 3,00 detik terpenuhi
          </p>
        </div>
      </section>

      {/* Topic Frequency Bar Visualization + Policy Evaluation Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Horizontal Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Distribusi Topik Pertanyaan Pegawai
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik batang topik untuk meninjau pasal yang paling sering ditanyakan dan rekomendasi kebijakan
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#1e3a8a] shrink-0" />
          </div>

          <div className="mt-5 space-y-4">
            {topicStats.map((topic) => {
              const pctOfTotal = ((topic.count / totalConsultations) * 100).toFixed(1);
              const barWidth = Math.max(8, Math.round((topic.count / maxTopicCount) * 100));
              const isSelected = activeInsight.kategori === topic.kategori;

              return (
                <button
                  key={topic.kategori}
                  type="button"
                  onClick={() => setSelectedTopic(topic.kategori)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-[#1e3a8a] bg-blue-50/40'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-2">
                    <span className="font-semibold text-slate-900">{topic.kategori}</span>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-slate-500">{pctOfTotal}%</span>
                      <span className="font-semibold text-slate-900">
                        {topic.count.toLocaleString('id-ID')} tanya
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSelected ? 'bg-[#10b981]' : 'bg-[#1e3a8a]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Policy Evaluation & Weekly Volume Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0f172a] text-white rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <p className="text-xs text-emerald-400 font-medium">
                  Evaluasi Kebijakan Topik Terpilih
                </p>
                <h3 className="text-lg font-semibold mt-0.5">{activeInsight.kategori}</h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-300">
                {activeInsight.pertumbuhan} MoM
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-xs leading-relaxed">
              <div>
                <p className="text-slate-400 font-medium">Pasal Paling Sering Dirujuk</p>
                <p className="text-white font-semibold mt-1">{activeInsight.pasalDominan}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Pola Pertanyaan ASN BPKAD</p>
                <p className="text-slate-200 mt-1">{activeInsight.isuUtama}</p>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <p className="text-emerald-400 font-semibold">Rekomendasi Tindak Lanjut Pimpinan</p>
                <p className="text-slate-100 mt-1">{activeInsight.rekomendasiPimpinan}</p>
              </div>
            </div>
          </div>

          {/* Weekly Trend Bars */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Tren Konsultasi Mingguan (November 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total pertanyaan masuk per minggu dari seluruh bidang BPKAD
            </p>

            <div className="mt-5 grid grid-cols-4 gap-3 items-end h-36 pt-4 border-b border-slate-200">
              {WEEKLY_TREND.map((week, idx) => {
                const heightPct = Math.round((week.total / maxWeekly) * 100);
                const val =
                  idx === WEEKLY_TREND.length - 1 ? week.total + extraLogs : week.total;
                return (
                  <div key={week.label} className="flex flex-col items-center h-full justify-end">
                    <span className="text-[11px] font-mono font-semibold text-slate-700 tabular-nums mb-1.5">
                      {val}
                    </span>
                    <div
                      className={`w-full max-w-[44px] rounded-t-md transition-all ${
                        idx === WEEKLY_TREND.length - 1 ? 'bg-[#10b981]' : 'bg-[#1e3a8a]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-4 gap-3 mt-2 text-center">
              {WEEKLY_TREND.map((week) => (
                <span key={week.label} className="text-[11px] text-slate-500 leading-tight">
                  {week.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
