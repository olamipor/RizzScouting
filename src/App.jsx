import { useEffect, useMemo, useState } from 'react';
import Dexie from 'dexie';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileDown,
  Mail,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  UserRound,
  Users,
} from 'lucide-react';

const db = new Dexie('rizzscouting-db');
db.version(1).stores({
  contacts: '++id, email, company, status, dateAdded, labels',
  templates: '++id, name, subject, body, updatedAt',
  sends: '++id, status, contactEmail, sentAt, templateName',
  activity: '++id, type, message, createdAt',
});

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'extract', label: 'Extract' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'templates', label: 'Templates' },
  { id: 'settings', label: 'Settings' },
];

const STATUS_OPTIONS = ['All', 'New', 'Contacted', 'Replied', 'Bounced'];

const seedContacts = [
  { id: 1, name: 'Maya Chen', email: 'maya@northstarlabs.io', company: 'Northstar Labs', status: 'New', dateAdded: '2026-08-19', labels: ['AI'], source: 'manual' },
  { id: 2, name: 'Samir Patel', email: 'samir@harborpeak.co', company: 'Harbor Peak', status: 'Contacted', dateAdded: '2026-08-18', labels: ['SaaS'], source: 'manual' },
  { id: 3, name: 'Alicia Gomez', email: 'alicia@bluelake.dev', company: 'Blue Lake', status: 'Replied', dateAdded: '2026-08-17', labels: ['Product'], source: 'manual' },
  { id: 4, name: 'Daniel Kim', email: 'daniel@moonbeam.ai', company: 'Moonbeam AI', status: 'New', dateAdded: '2026-08-16', labels: ['AI'], source: 'manual' },
  { id: 5, name: 'Jules Martin', email: 'jules@relayhq.com', company: 'Relay HQ', status: 'Bounced', dateAdded: '2026-08-15', labels: ['Outreach'], source: 'manual' },
];

const initialTemplates = [
  { id: 1, name: 'Founder warm intro', subject: 'Quick question for {{company}}', body: 'Hi {{first_name}},\n\nI came across {{company}} and wanted to reach out with a quick idea for improving your outbound motion.\n\nWould you be open to a 10-minute chat next week?\n\nBest,\nAlex' },
  { id: 2, name: 'Product reply', subject: 'A better workflow for {{company}}', body: 'Hey {{first_name}},\n\nI noticed {{company}} is evaluating funnels and retention. We built a lightweight outreach sprint that shortens the path from signal to meeting.\n\nHappy to share a quick example.\n\n— Alex' },
];

const initialSends = [
  { id: 1, contactEmail: 'maya@northstarlabs.io', templateName: 'Founder warm intro', status: 'sent', sentAt: '2026-08-22' },
  { id: 2, contactEmail: 'samir@harborpeak.co', templateName: 'Founder warm intro', status: 'pending', sentAt: '2026-08-23' },
  { id: 3, contactEmail: 'alicia@bluelake.dev', templateName: 'Product reply', status: 'replied', sentAt: '2026-08-20' },
  { id: 4, contactEmail: 'daniel@moonbeam.ai', templateName: 'Founder warm intro', status: 'failed', sentAt: '2026-08-19' },
];

const initialActivity = [
  { id: 1, type: 'extraction', message: 'Extracted 14 leads from product page content', createdAt: '2026-08-23T09:30:00Z' },
  { id: 2, type: 'send', message: 'Sent campaign to 12 leads', createdAt: '2026-08-23T08:45:00Z' },
  { id: 3, type: 'reply', message: 'Alicia Gomez replied from Blue Lake', createdAt: '2026-08-21T16:10:00Z' },
  { id: 4, type: 'bounce', message: '1 bounced email removed from active queue', createdAt: '2026-08-20T11:00:00Z' },
];

const monthlySpread = [
  { day: 'May', sent: 18 },
  { day: 'Jun', sent: 24 },
  { day: 'Jul', sent: 40 },
  { day: 'Aug', sent: 66 },
  { day: 'Sep', sent: 58 },
  { day: 'Oct', sent: 72 },
  { day: 'Nov', sent: 81 },
];

const funnelData = [
  { name: 'Extracted', value: 142, fill: '#10b981' },
  { name: 'Contacted', value: 82, fill: '#34d399' },
  { name: 'Replied', value: 21, fill: '#a7f3d0' },
];

const themeTints = {
  dark: { bg: '#0f172a', surface: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8' },
  light: { bg: '#f8fafc', surface: '#ffffff', border: '#e2e8f0', text: '#0f172a', muted: '#475569' },
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function extractEntities(rawText) {
  const text = rawText || '';
  const emails = [...new Set((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((email) => email.toLowerCase()))];
  const nameMatches = [...text.matchAll(/(?:hello|hi|hey)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g)];
  const names = [...new Set(nameMatches.map((match) => match[1]))];
  const companies = [...new Set((text.match(/\b[A-Z][A-Za-z0-9&.-]+(?:\s+[A-Z][A-Za-z0-9&.-]+){0,2}\b/g) || []).filter((candidate) => !['Hello', 'Hi', 'Hey', 'Email', 'Info', 'Contact'].includes(candidate)).slice(0, 5))];

  return emails.map((email, index) => ({
    id: makeId(),
    name: names[index] || 'New prospect',
    email,
    company: companies[index] || 'Unspecified company',
    status: 'New',
    dateAdded: new Date().toISOString().slice(0, 10),
    labels: ['Auto-imported'],
    source: 'extractor',
  }));
}

function parseCsvContacts(rawCsv) {
  const rows = rawCsv
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .slice(1)
    .flatMap((line) => line.split(','))
    .map((value) => value.trim())
    .filter((value) => value.includes('@'));

  return [...new Set(rows.map((email) => ({
    id: makeId(),
    name: 'Imported lead',
    email: email.toLowerCase(),
    company: 'Imported company',
    status: 'New',
    dateAdded: new Date().toISOString().slice(0, 10),
    labels: ['CSV'],
    source: 'csv',
  })))];
}

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('system');
  const [contacts, setContacts] = useState(seedContacts);
  const [templates, setTemplates] = useState(initialTemplates);
  const [sends, setSends] = useState(initialSends);
  const [activity, setActivity] = useState(initialActivity);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [maxPerDay, setMaxPerDay] = useState(50);
  const [templateForm, setTemplateForm] = useState({ name: 'New quick outreach', subject: 'Quick question for {{company}}', body: 'Hi {{first_name}},\n\nI found {{company}} and thought your team might be evaluating outreach.\n\nWould you be open to a quick chat?\n\nBest,\nAlex' });
  const [extractionInput, setExtractionInput] = useState('Example: hello Maya, northstarlabs.io, hello@northstarlabs.io');
  const [extractedCount, setExtractedCount] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('rizzscouting-theme') || 'system';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : savedTheme);

    const bootData = async () => {
      const allContacts = await db.contacts.toArray();
      const allTemplates = await db.templates.toArray();
      const allSends = await db.sends.toArray();
      const allActivity = await db.activity.toArray();

      if (allContacts.length) setContacts(allContacts);
      if (allTemplates.length) setTemplates(allTemplates);
      if (allSends.length) setSends(allSends);
      if (allActivity.length) setActivity(allActivity);
    };

    bootData().catch(() => {});

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const saved = localStorage.getItem('rizzscouting-theme');
      if (saved === 'system' || !saved) {
        setTheme(media.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', onChange);

    const onInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', onInstallPrompt);

    return () => {
      media.removeEventListener('change', onChange);
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const effectiveTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    document.documentElement.dataset.theme = effectiveTheme;
    document.documentElement.style.colorScheme = effectiveTheme;
    document.querySelector('meta[name="theme-color"]').setAttribute('content', effectiveTheme === 'dark' ? '#0f172a' : '#f8fafc');
    localStorage.setItem('rizzscouting-theme', theme);
  }, [theme]);

  useEffect(() => {
    db.contacts.clear().then(() => db.contacts.bulkPut(contacts));
  }, [contacts]);

  useEffect(() => {
    db.templates.clear().then(() => db.templates.bulkPut(templates));
  }, [templates]);

  useEffect(() => {
    db.sends.clear().then(() => db.sends.bulkPut(sends));
  }, [sends]);

  useEffect(() => {
    db.activity.clear().then(() => db.activity.bulkPut(activity));
  }, [activity]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = !searchTerm || `${contact.name} ${contact.email} ${contact.company}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
      const matchesCompany = companyFilter === 'All' || contact.company === companyFilter;
      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [contacts, searchTerm, statusFilter, companyFilter]);

  const companyOptions = ['All', ...new Set(contacts.map((contact) => contact.company))];

  const sentToday = useMemo(() => sends.filter((send) => send.status === 'sent' && send.sentAt === new Date().toISOString().slice(0, 10)).length, [sends]);
  const remainingToday = Math.max(maxPerDay - sentToday, 0);

  const totalReplies = useMemo(() => contacts.filter((contact) => contact.status === 'Replied').length, [contacts]);
  const totalBounces = useMemo(() => contacts.filter((contact) => contact.status === 'Bounced').length, [contacts]);
  const totalNew = useMemo(() => contacts.filter((contact) => contact.status === 'New').length, [contacts]);
  const liveExtractionCount = useMemo(() => extractEntities(extractionInput).length, [extractionInput]);

  const sendChartData = useMemo(() => {
    return monthlySpread.map((entry, index) => ({
      name: entry.day,
      sent: entry.sent,
      replied: Math.max(6, Math.round(entry.sent * (0.22 + index * 0.02))),
    }));
  }, []);

  const handleToggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectContact = (id) => {
    setSelectedContactIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
  };

  const handleBulkAction = (action) => {
    if (!selectedContactIds.length) return;

    if (action === 'delete') {
      setContacts((current) => current.filter((contact) => !selectedContactIds.includes(contact.id)));
      setSelectedContactIds([]);
      setActivity((current) => [{ id: makeId(), type: 'delete', message: `${selectedContactIds.length} contacts removed`, createdAt: new Date().toISOString() }, ...current].slice(0, 10));
      return;
    }

    if (action === 'segment') {
      setContacts((current) => current.map((contact) =>
        selectedContactIds.includes(contact.id) ? { ...contact, labels: [...new Set([...contact.labels, 'Campaign']) ] } : contact
      ));
      setSelectedContactIds([]);
    }
  };

  const handleExtract = () => {
    const nextCandidates = extractEntities(extractionInput);
    const unique = nextCandidates.filter((candidate) => !contacts.some((contact) => contact.email === candidate.email));

    setContacts((current) => [...unique, ...current]);
    setExtractedCount(unique.length);
    setActivity((current) => [{ id: makeId(), type: 'extraction', message: `Extracted ${unique.length} new lead${unique.length === 1 ? '' : 's'}`, createdAt: new Date().toISOString() }, ...current].slice(0, 10));
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const imported = parseCsvContacts(text);
    const unique = imported.filter((candidate) => !contacts.some((contact) => contact.email === candidate.email));
    setContacts((current) => [...unique, ...current]);
    setExtractedCount(unique.length);
    setActivity((current) => [{ id: makeId(), type: 'import', message: `Imported ${unique.length} leads from CSV`, createdAt: new Date().toISOString() }, ...current].slice(0, 10));
    event.target.value = '';
  };

  const handleSaveTemplate = () => {
    const trimmed = templateForm.name.trim();
    if (!trimmed) return;
    const nextTemplate = {
      id: Date.now(),
      name: trimmed,
      subject: templateForm.subject,
      body: templateForm.body,
      updatedAt: new Date().toISOString(),
    };
    setTemplates((current) => [nextTemplate, ...current]);
    setTemplateForm({ name: '', subject: '', body: '' });
  };

  const handleQueueSend = () => {
    const newEntry = {
      id: Date.now(),
      contactEmail: contacts[0]?.email || 'lead@demo.com',
      templateName: templates[0]?.name || 'Founder warm intro',
      status: 'pending',
      sentAt: new Date().toISOString().slice(0, 10),
    };
    setSends((current) => [newEntry, ...current]);
    setActivity((current) => [{ id: makeId(), type: 'send', message: 'Queued a new outbound send', createdAt: new Date().toISOString() }, ...current].slice(0, 10));
  };

  const exportContacts = () => {
    const rows = ['name,email,company,status,dateAdded,labels'];
    contacts.forEach((contact) => {
      rows.push(`${contact.name},${contact.email},${contact.company},${contact.status},${contact.dateAdded},${contact.labels.join('|')}`);
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rizzscouting-contacts.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedCount = selectedContactIds.length;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand-wrap">
          <div className="brand-mark">R</div>
          <div>
            <div className="brand-name">RizzScouting</div>
            <div className="brand-tag">Lightning outreach</div>
          </div>
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
            >
              <span className="nav-dot" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-title">Today</div>
          <div className="metric-row">
            <span>Send limit</span>
            <strong>{remainingToday}/{maxPerDay}</strong>
          </div>
          <div className="mini-progress">
            <span style={{ width: `${Math.min((sentToday / maxPerDay) * 100, 100)}%` }} />
          </div>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div className="mobile-menu" onClick={() => setSidebarOpen((open) => !open)}>
            <span />
            <span />
            <span />
          </div>

          <label className="search-box">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search contacts or companies"
            />
          </label>

          <div className="topbar-actions">
            <div className="send-limit-pill">
              <span className="pill-label">Remaining</span>
              <strong>{remainingToday}</strong>
            </div>

            <button className="icon-button" onClick={handleToggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="icon-button" aria-label="Notifications">
              <Bell size={16} />
            </button>

            <button className="profile-chip">
              <div className="profile-avatar">AR</div>
              <div>
                <strong>Alex R.</strong>
                <small>Owner</small>
              </div>
            </button>
          </div>
        </header>

        <main className="content">
          {activeView === 'dashboard' && (
            <>
              <section className="page-header">
                <div>
                  <p className="eyebrow">Overview</p>
                  <h1>Outreach dashboard</h1>
                </div>
                <button className="primary-btn" onClick={handleQueueSend}>Queue a send</button>
              </section>

              <section className="kpi-grid">
                <div className="card stat-card">
                  <div className="stat-meta"><Users size={16} /> Total contacts</div>
                  <div className="stat-value">{contacts.length}</div>
                  <span className="stat-trend positive">+12.4% this week</span>
                </div>
                <div className="card stat-card">
                  <div className="stat-meta"><Mail size={16} /> Emails sent today</div>
                  <div className="stat-value">{sentToday}</div>
                  <span className="stat-trend positive">{remainingToday} left</span>
                </div>
                <div className="card stat-card">
                  <div className="stat-meta"><CheckCircle2 size={16} /> Reply rate</div>
                  <div className="stat-value">{Math.round((totalReplies / Math.max(contacts.length, 1)) * 100)}%</div>
                  <span className="stat-trend neutral">Healthy pipeline</span>
                </div>
                <div className="card stat-card">
                  <div className="stat-meta"><ArrowUpRight size={16} /> Bounce rate</div>
                  <div className="stat-value">{Math.round((totalBounces / Math.max(contacts.length, 1)) * 100)}%</div>
                  <span className="stat-trend warning">Monitor list health</span>
                </div>
              </section>

              <section className="two-col">
                <div className="card chart-card">
                  <div className="card-header">
                    <h3>Outbound volume</h3>
                    <span>Last 7 months</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={sendChartData}>
                      <defs>
                        <linearGradient id="sentFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" stroke="var(--muted)" />
                      <YAxis stroke="var(--muted)" />
                      <Tooltip />
                      <Area type="monotone" dataKey="sent" stroke="#10b981" fill="url(#sentFill)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="card chart-card">
                  <div className="card-header">
                    <h3>Funnel</h3>
                    <span>Lead flow</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={funnelData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={4}>
                        {funnelData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="funnel-legend">
                    {funnelData.map((entry) => (
                      <div key={entry.name} className="legend-row">
                        <span className="legend-dot" style={{ background: entry.fill }} />
                        {entry.name}
                        <strong>{entry.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="two-col bottom-grid">
                <div className="card chart-card">
                  <div className="card-header">
                    <h3>Campaign samples</h3>
                    <span>Weekly send mix</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={sendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" stroke="var(--muted)" />
                      <YAxis stroke="var(--muted)" />
                      <Tooltip />
                      <Bar dataKey="replied" radius={[8, 8, 0, 0]} fill="#34d399" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card feed-card">
                  <div className="card-header">
                    <h3>Recent activity</h3>
                    <span>Last 10 actions</span>
                  </div>
                  <div className="activity-list">
                    {activity.map((entry) => (
                      <div key={entry.id} className="activity-item">
                        <div className={`activity-bullet ${entry.type}`} />
                        <div>
                          <strong>{entry.message}</strong>
                          <small>{new Date(entry.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {activeView === 'contacts' && (
            <>
              <section className="page-header">
                <div>
                  <p className="eyebrow">CRM-lite</p>
                  <h1>Contact list</h1>
                </div>
                <div className="header-actions">
                  <button className="secondary-btn" onClick={exportContacts}><FileDown size={16} /> Export CSV</button>
                  <button className="primary-btn" onClick={() => handleBulkAction('segment')}><Plus size={16} /> Add to campaign</button>
                </div>
              </section>

              <div className="card panel-card">
                <div className="toolbar-row">
                  <div className="toolbar-group">
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <select value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)}>
                      {companyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="toolbar-group right">
                    <button className="secondary-btn" onClick={() => handleBulkAction('delete')}><Trash2 size={16} /> Delete</button>
                    <span className="selected-indicator">{selectedCount} selected</span>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th><input type="checkbox" checked={selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0} onChange={() => setSelectedContactIds(filteredContacts.length ? filteredContacts.map((contact) => contact.id) : [])} /></th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Company</th>
                        <th>Status</th>
                        <th>Labels</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id}>
                          <td><input type="checkbox" checked={selectedContactIds.includes(contact.id)} onChange={() => handleSelectContact(contact.id)} /></td>
                          <td><div className="contact-name"><UserRound size={14} /> {contact.name}</div></td>
                          <td>{contact.email}</td>
                          <td>{contact.company}</td>
                          <td><span className={`status-badge ${String(contact.status).toLowerCase()}`}>{contact.status}</span></td>
                          <td>{contact.labels.join(', ')}</td>
                          <td>{contact.dateAdded}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeView === 'extract' && (
            <>
              <section className="page-header">
                <div>
                  <p className="eyebrow">Smart extraction</p>
                  <h1>Extract new prospects</h1>
                </div>
                <div className="header-actions">
                  <span className="count-pill">{liveExtractionCount} ready to extract</span>
                </div>
              </section>

              <div className="card panel-card extractor-panel">
                <div className="extract-grid">
                  <div className="field-group">
                    <label>URL / page source</label>
                    <input value={extractionInput} onChange={(event) => setExtractionInput(event.target.value)} placeholder="https://example.com or pasted text" />
                  </div>
                  <div className="field-group">
                    <label>CSV / list</label>
                    <label className="upload-button">
                      <Upload size={16} /> Upload list
                      <input type="file" accept=".csv,text/csv,.txt" onChange={handleCsvUpload} />
                    </label>
                  </div>
                </div>

                <div className="field-group">
                  <label>Raw text or webpage text</label>
                  <textarea value={extractionInput} onChange={(event) => setExtractionInput(event.target.value)} rows={12} />
                </div>

                <div className="extract-actions">
                  <button className="primary-btn" onClick={handleExtract}>Extract contacts</button>
                  <button className="secondary-btn" onClick={() => setExtractionInput('')}>Clear</button>
                </div>
              </div>
            </>
          )}

          {activeView === 'campaigns' && (
            <>
              <section className="page-header">
                <div>
                  <p className="eyebrow">Outbound</p>
                  <h1>Campaign sending</h1>
                </div>
                <div className="header-actions">
                  <label className="limit-field">
                    Max per day
                    <input type="number" value={maxPerDay} onChange={(event) => setMaxPerDay(Number(event.target.value || 0))} />
                  </label>
                </div>
              </section>

              <div className="card panel-card">
                <div className="limit-summary">
                  <div>
                    <small>Daily limits</small>
                    <strong>{remainingToday} sends remaining</strong>
                  </div>
                  <div>
                    <small>Current queue</small>
                    <strong>{sends.filter((send) => send.status === 'pending').length} pending</strong>
                  </div>
                  <div>
                    <small>Replied</small>
                    <strong>{sends.filter((send) => send.status === 'replied').length}</strong>
                  </div>
                </div>

                <div className="queue-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Template</th>
                        <th>Status</th>
                        <th>Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sends.map((send) => (
                        <tr key={send.id}>
                          <td>{send.contactEmail}</td>
                          <td>{send.templateName}</td>
                          <td><span className={`status-badge ${String(send.status).toLowerCase()}`}>{send.status}</span></td>
                          <td>{send.sentAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeView === 'templates' && (
            <>
              <section className="page-header">
                <div>
                  <p className="eyebrow">Content</p>
                  <h1>Template library</h1>
                </div>
                <button className="primary-btn" onClick={handleSaveTemplate}>Save template</button>
              </section>

              <div className="card panel-card template-layout">
                <div className="template-form">
                  <div className="field-group">
                    <label>Name</label>
                    <input value={templateForm.name} onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))} />
                  </div>
                  <div className="field-group">
                    <label>Subject</label>
                    <input value={templateForm.subject} onChange={(event) => setTemplateForm((current) => ({ ...current, subject: event.target.value }))} />
                  </div>
                  <div className="field-group">
                    <label>Body</label>
                    <textarea value={templateForm.body} onChange={(event) => setTemplateForm((current) => ({ ...current, body: event.target.value }))} rows={12} />
                  </div>
                  <div className="merge-field-chips">
                    {['{{first_name}}', '{{company}}', '{{title}}', '{{city}}'].map((field) => (
                      <button key={field} className="chip" onClick={() => setTemplateForm((current) => ({ ...current, body: `${current.body}${current.body ? '\n' : ''}${field}` }))}>{field}</button>
                    ))}
                  </div>
                </div>

                <div className="template-list">
                  {templates.map((template) => (
                    <div key={template.id} className="template-item">
                      <div className="template-title-row">
                        <strong>{template.name}</strong>
                        <span>{template.subject}</span>
                      </div>
                      <p>{template.body.slice(0, 120)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeView === 'settings' && (
            <>
              <section className="page-header">
                <div>
                  <p className="eyebrow">Configuration</p>
                  <h1>Workspace settings</h1>
                </div>
              </section>

              <div className="settings-grid">
                <div className="card panel-card">
                  <h3>Appearance</h3>
                  <div className="segmented-control">
                    <button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}>Light</button>
                    <button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}>Dark</button>
                    <button className={theme === 'system' ? 'selected' : ''} onClick={() => setTheme('system')}>System</button>
                  </div>
                </div>

                <div className="card panel-card">
                  <h3>Install app</h3>
                  {installPrompt ? (
                    <button className="primary-btn" onClick={() => installPrompt.prompt()}>Install RizzScouting</button>
                  ) : (
                    <p className="muted">Use the browser install prompt to add this app to your home screen.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
