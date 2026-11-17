import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface DocumentChunk {
  id: string;
  pasalLabel: string;
  content: string;
  pageHint?: number;
}

export interface ParsedFileResult {
  text: string;
  pageCount: number;
  warning?: string;
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export async function extractTextFromFile(file: File): Promise<ParsedFileResult> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let lastY: number | null = null;
        let line = '';
        const pageLines: string[] = [];

        for (const item of textContent.items) {
          if (!('str' in item)) continue;
          const currentY = item.transform ? item.transform[5] : null;
          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 4) {
            if (line.trim()) pageLines.push(line.trim());
            line = item.str;
          } else {
            line += (line && !line.endsWith(' ') && !item.str.startsWith(' ') ? ' ' : '') + item.str;
          }
          lastY = currentY;
        }
        if (line.trim()) pageLines.push(line.trim());

        const pageText = pageLines.join('\n').trim();
        if (pageText) {
          pages.push(`[Halaman ${i}]\n${pageText}`);
        }
      }

      const fullText = pages.join('\n\n').trim();
      if (!fullText || fullText.length < 20) {
        return {
          text: '',
          pageCount: pdf.numPages,
          warning:
            'PDF ini tampaknya berupa hasil pindaian gambar (scan) tanpa lapisan teks. Silakan salin atau ketikkan isi pasal/ketentuan utama pada kolom Ringkasan Isi agar tetap terindeks.',
        };
      }

      return {
        text: fullText,
        pageCount: pdf.numPages,
      };
    } catch (err) {
      console.error('PDF extraction error:', err);
      return {
        text: '',
        pageCount: 0,
        warning:
          'Gagal membaca struktur PDF secara otomatis. Pastikan file tidak terenkripsi kata sandi, atau isi ringkasan ketentuan secara manual.',
      };
    }
  }

  if (lowerName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')?.async('string');
      if (!docXml) {
        return {
          text: '',
          pageCount: 1,
          warning: 'Isi dokumen DOCX tidak ditemukan. Silakan isi ringkasan secara manual.',
        };
      }
      const withBreaks = docXml
        .replace(/<\/w:p>/g, '\n')
        .replace(/<w:tab\/>/g, ' ')
        .replace(/<w:br[^>]*\/>/g, '\n')
        .replace(/<[^>]+>/g, '');
      const cleaned = decodeXmlEntities(withBreaks)
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      return {
        text: cleaned,
        pageCount: Math.max(1, Math.ceil(cleaned.length / 2200)),
      };
    } catch (err) {
      console.error('DOCX extraction error:', err);
      return {
        text: '',
        pageCount: 0,
        warning: 'Gagal mengekstrak teks DOCX. Silakan tempel isi regulasi pada kolom ringkasan.',
      };
    }
  }

  // Fallback for TXT / MD / CSV / JSON
  try {
    const raw = await file.text();
    const cleaned = raw.trim();
    return {
      text: cleaned,
      pageCount: Math.max(1, Math.ceil(cleaned.length / 2200)),
    };
  } catch {
    return {
      text: '',
      pageCount: 0,
      warning: 'Format file tidak dapat dibaca sebagai teks. Gunakan PDF, DOCX, atau TXT.',
    };
  }
}

export function chunkRegulationText(
  rawText: string,
  fallbackPasal: string,
  docPrefix: string
): DocumentChunk[] {
  const cleaned = rawText.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const lines = cleaned.split('\n');
  const chunks: DocumentChunk[] = [];

  let currentPasal = fallbackPasal || 'Ketentuan Umum';
  let currentPage: number | undefined;
  let buffer: string[] = [];
  let bufferLen = 0;

  const pasalHeaderRegex =
    /^(pasal\s+\d+[a-z]?|bab\s+[ivxlcdm]+|bagian\s+\w+|ayat\s*\(\d+\)|menimbang|memutuskan|menetapkan)\b/i;
  const pageMarkerRegex = /^\[Halaman\s+(\d+)\]$/i;

  const flushBuffer = () => {
    const content = buffer.join('\n').trim();
    if (content.length >= 25) {
      chunks.push({
        id: `${docPrefix}-chunk-${chunks.length + 1}`,
        pasalLabel: currentPasal,
        content,
        pageHint: currentPage,
      });
    }
    buffer = [];
    bufferLen = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (bufferLen > 420) {
        flushBuffer();
      }
      continue;
    }

    const pageMatch = line.match(pageMarkerRegex);
    if (pageMatch) {
      currentPage = Number(pageMatch[1]);
      continue;
    }

    const pasalMatch = line.match(pasalHeaderRegex);
    if (pasalMatch && line.length < 120) {
      if (bufferLen > 80) {
        flushBuffer();
      }
      currentPasal = line.replace(/[:\s]+$/, '');
      buffer.push(line);
      bufferLen += line.length;
      continue;
    }

    buffer.push(line);
    bufferLen += line.length + 1;

    if (bufferLen >= 680) {
      flushBuffer();
    }
  }

  flushBuffer();

  // If text was short and produced 0 chunks because <25 chars, force at least 1 chunk
  if (chunks.length === 0 && cleaned.length > 0) {
    chunks.push({
      id: `${docPrefix}-chunk-1`,
      pasalLabel: currentPasal,
      content: cleaned,
      pageHint: currentPage,
    });
  }

  return chunks;
}
