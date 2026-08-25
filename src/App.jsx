import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Minimal single-screen bulk email collector
// - Paste or upload files (csv, txt, xlsx, pdf)
// - Extract emails via regex, dedupe, show count and list
// - Copy all / Download CSV / Download TXT / Clear

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function extractEmailsFromText(text) {
  if (!text) return [];
  const matches = text.match(EMAIL_REGEX) || [];
  return Array.from(new Set(matches.map((e) => e.toLowerCase())));
}

async function extractTextFromPDF(file) {
  // pdfjs-dist: read as array buffer and extract text content from all pages
  const data = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((s) => s.str);
    fullText += strings.join(' ') + '\n';
  }
  return fullText;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('rizzscouting-theme') || 'system');
  const [effectiveTheme, setEffectiveTheme] = useState('light');

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const eff = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    setEffectiveTheme(eff);
    document.documentElement.dataset.theme = eff;
    document.documentElement.style.colorScheme = eff;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', eff === 'dark' ? '#0f172a' : '#f8fafc');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('rizzscouting-theme', theme);
  }, [theme]);

  const [textInput, setTextInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const count = emails.length;

  // Chunked parsing to avoid UI freezing
  const parseTextChunked = (text) => {
    setProcessing(true);
    const allEmails = new Set();
    const CHUNK_SIZE = 20000; // characters
    const chunks = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) chunks.push(text.slice(i, i + CHUNK_SIZE));

    let idx = 0;
    const step = () => {
      const chunk = chunks[idx++];
      if (chunk) {
        const found = extractEmailsFromText(chunk);
        found.forEach((e) => allEmails.add(e));
        // update intermediate results to show live count
        setEmails((prev) => {
          const next = new Set(prev);
          found.forEach((e) => next.add(e));
          return Array.from(next);
        });
        // schedule next
        setTimeout(() => {
          if (idx < chunks.length) step();
          else {
            setProcessing(false);
            setEmails(Array.from(allEmails));
          }
        }, 0);
      } else {
        setProcessing(false);
        setEmails(Array.from(allEmails));
      }
    };

    // reset then start
    setEmails([]);
    step();
  };

  // handle paste: extract quickly
  const onPaste = (e) => {
    const clipboard = e.clipboardData || window.clipboardData;
    const text = clipboard.getData('text');
    if (!text) return;
    e.preventDefault();
    parseTextChunked(text);
    setTextInput(text);
  };

  // handle manual input change (user typing or pasting without paste event)
  const onChangeText = (e) => {
    setTextInput(e.target.value);
    parseTextChunked(e.target.value);
  };

  // handle files: accept multiple
  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setProcessing(true);
    const foundSet = new Set(emails);

    for (const file of Array.from(fileList)) {
      const name = file.name.toLowerCase();
      try {
        if (name.endsWith('.csv') || name.endsWith('.txt')) {
          const text = await file.text();
          extractEmailsFromText(text).forEach((e) => foundSet.add(e));
        } else if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.xlsm')) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array' });
          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const txt = XLSX.utils.sheet_to_csv(sheet);
            extractEmailsFromText(txt).forEach((e) => foundSet.add(e));
          });
        } else if (name.endsWith('.pdf')) {
          try {
            const txt = await extractTextFromPDF(file);
            extractEmailsFromText(txt).forEach((e) => foundSet.add(e));
          } catch (err) {
            // PDF parsing may fail on some files; skip gracefully
            console.warn('PDF parse failed', err);
          }
        } else {
          // fallback: try reading as text
          const text = await file.text();
          extractEmailsFromText(text).forEach((e) => foundSet.add(e));
        }
      } catch (err) {
        console.warn('Failed to process file', file.name, err);
      }
    }

    setEmails(Array.from(foundSet));
    setProcessing(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const onBrowse = (e) => {
    const files = e.target.files;
    handleFiles(files);
    e.target.value = '';
  };

  const copyAll = async () => {
    if (!emails.length) return;
    const text = emails.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied ' + emails.length + ' emails');
    } catch (err) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      alert('Copied ' + emails.length + ' emails');
    }
  };

  const download = (type) => {
    if (!emails.length) return;
    let content = '';
    let mime = 'text/plain';
    let ext = 'txt';
    if (type === 'csv') {
      content = emails.map((e) => `"${e}"`).join('\n');
      mime = 'text/csv';
      ext = 'csv';
    } else {
      content = emails.join('\n');
      ext = 'txt';
      mime = 'text/plain';
    }

    const blob = new Blob([content], { type: mime + ';charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rizzscouting-emails.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setTextInput('');
    setEmails([]);
  };

  const preventDefault = (e) => e.preventDefault();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: effectiveTheme === 'dark' ? '#0f172a' : '#f8fafc' }}>
      <div className="w-full max-w-3xl bg-white dark:bg-[#1e293b] rounded-xl shadow-lg p-4" style={{ background: effectiveTheme === 'dark' ? '#1e293b' : '#ffffff' }}>
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg" style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>
              <div className="text-white font-bold text-xl text-center leading-10">R</div>
            </div>
            <h1 className="text-lg font-bold" style={{ color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a' }}>RizzScouting</h1>
          </div>

          <div>
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label="Toggle theme"
              className="px-3 py-2 rounded-md"
              style={{ background: 'transparent', color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a' }}
            >
              {effectiveTheme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        <main>
          <label className="block text-sm font-medium mb-2" style={{ color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a' }}>Paste emails or text here</label>
          <textarea
            onPaste={onPaste}
            onChange={onChangeText}
            value={textInput}
            placeholder="Paste hundreds or thousands of emails here — one per line, comma-separated, or messy text"
            className="w-full rounded-md p-3 mb-3"
            rows={8}
            style={{ background: effectiveTheme === 'dark' ? '#0f172a' : '#ffffff', color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a', border: `1px solid ${effectiveTheme === 'dark' ? '#334155' : '#e2e8f0'}` }}
          />

          <div
            onDrop={onDrop}
            onDragOver={preventDefault}
            onDragEnter={preventDefault}
            className="w-full rounded-md p-6 mb-3 text-center"
            style={{ border: `2px dashed ${effectiveTheme === 'dark' ? '#334155' : '#e2e8f0'}`, background: effectiveTheme === 'dark' ? 'rgba(16,185,129,0.02)' : 'transparent', color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a' }}
          >
            <div className="mb-2">Drag & drop files here (csv, txt, xlsx, pdf) or</div>
            <div>
              <input ref={fileInputRef} type="file" multiple onChange={onBrowse} className="hidden" id="fileInput" />
              <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="px-4 py-2 rounded-md" style={{ background: effectiveTheme === 'dark' ? '#10b981' : '#059669', color: '#fff' }}>Browse files</button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div style={{ color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a' }}><strong>{count.toLocaleString()}</strong> emails found</div>
            <div className="flex gap-2">
              <button onClick={copyAll} className="px-3 py-2 rounded-md" style={{ background: effectiveTheme === 'dark' ? '#10b981' : '#059669', color: '#fff' }}>Copy all</button>
              <button onClick={() => download('csv')} className="px-3 py-2 rounded-md" style={{ background: effectiveTheme === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${effectiveTheme === 'dark' ? '#334155' : '#e2e8f0'}`, color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a' }}>Download .csv</button>
              <button onClick={() => download('txt')} className="px-3 py-2 rounded-md" style={{ background: effectiveTheme === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${effectiveTheme === 'dark' ? '#334155' : '#e2e8f0'}`, color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a' }}>Download .txt</button>
              <button onClick={clearAll} className="px-3 py-2 rounded-md" style={{ background: '#ef4444', color: '#fff' }}>Clear all</button>
            </div>
          </div>

          <div style={{ maxHeight: '320px', overflow: 'auto', borderRadius: 8, border: `1px solid ${effectiveTheme === 'dark' ? '#334155' : '#e2e8f0'}`, padding: 8, background: effectiveTheme === 'dark' ? '#0f172a' : '#ffffff' }}>
            {processing && <div style={{ color: effectiveTheme === 'dark' ? '#94a3b8' : '#475569' }}>Processing...</div>}
            {!processing && emails.length === 0 && <div style={{ color: effectiveTheme === 'dark' ? '#94a3b8' : '#475569' }}>No emails yet</div>}
            {!processing && emails.length > 0 && (
              <ul className="text-sm" style={{ color: effectiveTheme === 'dark' ? '#f1f5f9' : '#0f172a' }}>
                {emails.map((e) => <li key={e} className="p-1 border-b" style={{ borderColor: effectiveTheme === 'dark' ? '#334155' : '#e2e8f0' }}>{e}</li>)}
              </ul>
            )}
          </div>

          <p className="mt-3 text-xs" style={{ color: effectiveTheme === 'dark' ? '#94a3b8' : '#475569' }}>All processing happens locally in your browser. No data is uploaded.</p>
        </main>
      </div>
    </div>
  );
}

