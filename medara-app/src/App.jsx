import { useEffect, useRef, useState } from 'react'
import { createWorker } from 'tesseract.js'
import {
  AlertTriangle,
  Archive,
  ArrowDownWideNarrow,
  ArrowUpRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  ExternalLink,
  FileImage,
  Home,
  Info,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import './App.css'

const INVENTORY_KEY = 'medara.inventory.v1'
const PREFERENCES_KEY = 'medara.preferences.v1'
const PROFILE_KEY = 'medara.profile.v1'
const SFDA_SDI_URL = 'https://sdi.sfda.gov.sa/'

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function emptyForm() {
  return {
    name: '',
    quantity: 1,
    expiryDate: '',
    location: '',
    notes: '',
    confirmed: false,
    id: null,
  }
}

function daysUntil(dateValue) {
  if (!dateValue) return null
  const [year, month, day] = dateValue.split('-').map(Number)
  const expiry = Date.UTC(year, month - 1, day)
  const today = new Date()
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((expiry - todayUtc) / 86400000)
}

function formatDate(dateValue) {
  if (!dateValue) return 'Date not entered'
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function getExpiryState(record, reminderDays) {
  if (!record.expiryDate) return 'unknown'
  const days = daysUntil(record.expiryDate)
  if (days < 0) return 'expired'
  if (days <= reminderDays) return 'soon'
  return 'ok'
}

function App() {
  const [records, setRecords] = useState(() => readStorage(INVENTORY_KEY, []))
  const [displayName, setDisplayName] = useState(() => readStorage(PROFILE_KEY, ''))
  const [nameDraft, setNameDraft] = useState('')
  const [preferences, setPreferences] = useState(() => {
    const saved = readStorage(PREFERENCES_KEY, {})
    return { reminderDays: [7, 14, 30].includes(saved.reminderDays) ? saved.reminderDays : 14 }
  })
  const [page, setPage] = useState('home')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('expiry')
  const [form, setForm] = useState(emptyForm)
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [scanFile, setScanFile] = useState(null)
  const [scanPreview, setScanPreview] = useState('')
  const [ocrText, setOcrText] = useState('')
  const [ocrStatus, setOcrStatus] = useState('idle')
  const [scanName, setScanName] = useState('')
  const [scanQuantity, setScanQuantity] = useState(1)
  const [scanExpiry, setScanExpiry] = useState('')
  const [scanLocation, setScanLocation] = useState('')
  const [scanConfirmed, setScanConfirmed] = useState(false)
  const fileInput = useRef(null)

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(records))
  }, [records])

  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    return () => {
      if (scanPreview) URL.revokeObjectURL(scanPreview)
    }
  }, [scanPreview])

  const activeRecords = records.filter((record) => record.status === 'active')
  const expiringRecords = activeRecords.filter(
    (record) => getExpiryState(record, preferences.reminderDays) === 'soon',
  )
  const expiredRecords = activeRecords.filter(
    (record) => getExpiryState(record, preferences.reminderDays) === 'expired',
  )
  const nameCounts = activeRecords.reduce((counts, record) => {
    const key = record.name.trim().toLowerCase()
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
  const duplicateCount = Object.values(nameCounts).reduce(
    (total, count) => total + Math.max(0, count - 1),
    0,
  )
  const cabinetName = `${displayName}'s cabinet`
  const pageTitle = {
    home: 'Overview',
    cabinet: cabinetName,
    scan: 'Scan medicine',
    alerts: 'Alerts',
  }[page]
  const [todayLabel] = useState(() => new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase())

  function saveWelcomeName(event) {
    event.preventDefault()
    const name = nameDraft.trim()
    if (!name) return
    localStorage.setItem(PROFILE_KEY, JSON.stringify(name))
    setDisplayName(name)
  }

  function openNewRecord() {
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEditRecord(record) {
    setForm({ ...record, confirmed: true })
    setFormOpen(true)
  }

  function saveRecord(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.confirmed) return
    if (form.id) {
      setRecords((current) => current.map((record) =>
        record.id === form.id
          ? { ...record, ...form, name: form.name.trim(), quantity: Math.max(1, Number(form.quantity) || 1) }
          : record,
      ))
      setNotice('Cabinet record updated')
    } else {
      setRecords((current) => [{
        ...form,
        id: crypto.randomUUID(),
        name: form.name.trim(),
        quantity: Math.max(1, Number(form.quantity) || 1),
        status: 'active',
        source: 'Manual entry',
        dateAdded: new Date().toISOString(),
      }, ...current])
      setNotice('Added to your cabinet')
    }
    setFormOpen(false)
  }

  function removeRecord(record) {
    setRecords((current) => current.filter((item) => item.id !== record.id))
    setNotice('Cabinet record removed')
  }

  function setRecordStatus(record, status) {
    setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status } : item))
    setNotice(status === 'used' ? 'Marked as used' : 'Marked as discarded')
  }

  async function recognizeImage(file) {
    if (scanPreview) URL.revokeObjectURL(scanPreview)
    setScanFile(file)
    setScanPreview(URL.createObjectURL(file))
    setOcrText('')
    setOcrStatus('processing')
    try {
      const worker = await createWorker('eng')
      try {
        const result = await worker.recognize(file)
        setOcrText(result.data.text.trim())
        setOcrStatus(result.data.text.trim() ? 'done' : 'empty')
      } finally {
        await worker.terminate()
      }
    } catch {
      setOcrStatus('error')
    }
  }

  function saveScannedRecord(event) {
    event.preventDefault()
    if (!scanName.trim() || !scanConfirmed) return
    setRecords((current) => [{
      id: crypto.randomUUID(),
      name: scanName.trim(),
      quantity: Math.max(1, Number(scanQuantity) || 1),
      expiryDate: scanExpiry,
      location: scanLocation.trim(),
      notes: '',
      status: 'active',
      source: scanFile ? 'Image reviewed by user' : 'Manual entry',
      dateAdded: new Date().toISOString(),
    }, ...current])
    setScanFile(null)
    setScanPreview('')
    setOcrText('')
    setOcrStatus('idle')
    setScanName('')
    setScanQuantity(1)
    setScanExpiry('')
    setScanLocation('')
    setScanConfirmed(false)
    setNotice('Added as unverified to your cabinet')
    setPage('cabinet')
  }

  const visibleRecords = [...records]
    .filter((record) => record.status === 'active')
    .filter((record) => record.name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    .filter((record) => {
      if (statusFilter === 'all') return true
      if (statusFilter === 'missing') return !record.expiryDate
      return getExpiryState(record, preferences.reminderDays) === statusFilter
    })
    .sort((first, second) => {
      if (sortOrder === 'name') return first.name.localeCompare(second.name)
      if (!first.expiryDate) return 1
      if (!second.expiryDate) return -1
      return first.expiryDate.localeCompare(second.expiryDate)
    })

  const navItems = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'cabinet', label: cabinetName, icon: Package, count: activeRecords.length },
    { id: 'scan', label: 'Scan medicine', icon: Camera },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, count: expiringRecords.length + expiredRecords.length },
  ]

  if (!displayName) {
    return <WelcomePage name={nameDraft} setName={setNameDraft} onSubmit={saveWelcomeName} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => setPage('home')} aria-label="Medara overview">
          <span className="brand-mark"><Plus size={22} strokeWidth={2.8} /></span>
          <span className="brand-word">medara<span>.</span></span>
        </button>

        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              type="button"
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => setPage(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
              {count > 0 && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note-icon"><ShieldCheck size={17} /></div>
          <p>Product details are not verified in this prototype.</p>
          <span>TEST VERSION 0.1</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark"><Plus size={19} strokeWidth={2.8} /></span>
            <span className="brand-word">medara<span>.</span></span>
          </div>
          <div className="breadcrumb"><span>Medara</span><span className="breadcrumb-slash">/</span>{pageTitle}</div>
          <div className="topbar-right">
            <span className="local-badge"><span /> Local prototype</span>
            <span className="avatar" aria-label={`Local profile for ${displayName}`}>{displayName.charAt(0).toUpperCase()}</span>
          </div>
        </header>

        <div className="prototype-notice" role="note">
          <Info size={16} />
          <span>Test version: records stay in this browser only. No account or verified medicine catalog is connected.</span>
        </div>

        <div className="content-wrap">
          {page === 'home' && (
            <section className="page-section" aria-labelledby="overview-title">
              <div className="page-heading home-heading">
                <div>
                  <div className="eyebrow">{todayLabel}</div>
                  <h1 id="overview-title">Welcome, {displayName}</h1>
                  <p className="heading-subtitle">{cabinetName} at a glance.</p>
                </div>
                <button className="button button-primary" type="button" onClick={() => setPage('scan')}>
                  <Camera size={17} /> Scan medicine
                </button>
              </div>

              <div className="metric-grid">
                <MetricCard label="Packages tracked" value={activeRecords.reduce((total, record) => total + Number(record.quantity || 0), 0)} detail="In your cabinet" icon={Package} tone="green" />
                <MetricCard label="Expiring soon" value={expiringRecords.length} detail={`Next ${preferences.reminderDays} days`} icon={Clock3} tone="amber" />
                <MetricCard label="Expired" value={expiredRecords.length} detail="Check these packages" icon={AlertTriangle} tone="red" />
                <MetricCard label="Possible duplicates" value={duplicateCount} detail="Same name, separate entries" icon={ArrowDownWideNarrow} tone="blue" />
              </div>

              <div className="home-grid">
                <section className="panel attention-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="eyebrow">YOUR NEXT STEP</div>
                      <h2>Keep your cabinet up to date</h2>
                    </div>
                    <span className="panel-icon"><FileImage size={20} /></span>
                  </div>
                  <p className="panel-copy">Photograph a package to read its printed text, then enter the details you want to track. Product matching is not connected yet.</p>
                  <button className="button button-dark" type="button" onClick={() => setPage('scan')}>
                    <Camera size={17} /> Start a scan <ArrowUpRight size={16} />
                  </button>
                  <div className="attention-foot"><ShieldCheck size={15} /> You review every detail before saving</div>
                </section>

                <section className="panel list-panel">
                  <div className="panel-heading panel-heading-tight">
                    <div>
                      <div className="eyebrow">ATTENTION</div>
                      <h2>Expiration watch</h2>
                    </div>
                    <button className="text-button" type="button" onClick={() => setPage('alerts')}>See alerts <ArrowUpRight size={14} /></button>
                  </div>
                  {expiringRecords.length + expiredRecords.length === 0 ? (
                    <div className="quiet-empty"><span className="empty-check"><Check size={17} /></span><div><strong>Nothing needs attention</strong><span>Expiration alerts will appear here.</span></div></div>
                  ) : (
                    <div className="compact-list">
                      {[...expiredRecords, ...expiringRecords].slice(0, 4).map((record) => (
                        <CompactRecord key={record.id} record={record} reminderDays={preferences.reminderDays} onClick={() => { setPage('cabinet'); setSearchTerm(record.name) }} />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section className="panel recent-panel">
                <div className="panel-heading panel-heading-tight">
                  <div><div className="eyebrow">CABINET</div><h2>Recently added</h2></div>
                  <button className="text-button" type="button" onClick={() => setPage('cabinet')}>View cabinet <ArrowUpRight size={14} /></button>
                </div>
                {activeRecords.length === 0 ? (
                  <div className="empty-state compact-empty">
                    <div className="empty-illustration"><Package size={24} /></div>
                    <strong>Your cabinet is empty</strong>
                    <span>Scan a package or add a medicine manually to get started.</span>
                    <button className="button button-outline" type="button" onClick={() => setPage('cabinet')}><Plus size={16} /> Add medicine manually</button>
                  </div>
                ) : (
                  <RecordList records={activeRecords.slice(0, 4)} reminderDays={preferences.reminderDays} onEdit={openEditRecord} onRemove={removeRecord} onMarkUsed={(record) => setRecordStatus(record, 'used')} onMarkDiscarded={(record) => setRecordStatus(record, 'discarded')} />
                )}
              </section>
            </section>
          )}

          {page === 'cabinet' && (
            <section className="page-section" aria-labelledby="cabinet-title">
              <div className="page-heading">
                <div><div className="eyebrow">PERSONAL INVENTORY</div><h1 id="cabinet-title">{cabinetName}</h1><p className="heading-subtitle">Each entry is a separately tracked package.</p></div>
                <button className="button button-primary" type="button" onClick={openNewRecord}><Plus size={17} /> Add medicine</button>
              </div>
              <div className="toolbar panel">
                <label className="search-field"><Search size={17} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search your cabinet" aria-label="Search your cabinet" /></label>
                <div className="toolbar-controls">
                  <label className="select-wrap"><span className="sr-only">Filter by expiration</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="soon">Expiring soon</option><option value="expired">Expired</option><option value="missing">No date</option></select><ChevronDown size={15} /></label>
                  <label className="select-wrap sort-select"><span className="sr-only">Sort records</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="expiry">Expiration date</option><option value="name">Name</option></select><ChevronDown size={15} /></label>
                </div>
              </div>
              <section className="panel cabinet-panel">
                <div className="table-heading"><span>MEDICINE</span><span>QUANTITY</span><span>EXPIRATION</span><span>STATUS</span><span className="sr-only">Actions</span></div>
                {visibleRecords.length === 0 ? (
                  <div className="empty-state cabinet-empty"><div className="empty-illustration"><Search size={23} /></div><strong>{activeRecords.length ? 'No matching medicines' : 'Nothing in your cabinet yet'}</strong><span>{activeRecords.length ? 'Try another search or filter.' : 'Add a medicine to begin tracking packages and expiration dates.'}</span>{!activeRecords.length && <button className="button button-outline" type="button" onClick={openNewRecord}><Plus size={16} /> Add medicine</button>}</div>
                ) : (
                  <RecordList records={visibleRecords} reminderDays={preferences.reminderDays} onEdit={openEditRecord} onRemove={removeRecord} onMarkUsed={(record) => setRecordStatus(record, 'used')} onMarkDiscarded={(record) => setRecordStatus(record, 'discarded')} />
                )}
              </section>
              <section className="panel disposal-panel" aria-labelledby="disposal-title">
                <div className="disposal-copy">
                  <span className="disposal-icon"><Trash2 size={19} /></span>
                  <div>
                    <div className="eyebrow">SAFE DISPOSAL</div>
                    <h2 id="disposal-title">No longer need a package?</h2>
                    <p>We don’t have a verified list of medicine drop-off locations for Jeddah yet. Call SFDA to ask about the approved local disposal option, and confirm before visiting. Not every pharmacy accepts returned medicines.</p>
                    <a className="disposal-source" href="https://www.sfda.gov.sa/en/form/contact" target="_blank" rel="noreferrer">SFDA official contact details <ArrowUpRight size={14} /></a>
                  </div>
                </div>
                <a className="button button-outline disposal-action" href="tel:19999"><Phone size={16} /> Call SFDA · 19999</a>
              </section>
              <div className="page-footnote"><Info size={14} /> Medara cannot validate products yet. <a href={SFDA_SDI_URL} target="_blank" rel="noreferrer">Check a product in SFDA SDI <ExternalLink size={13} /></a></div>
            </section>
          )}

          {page === 'scan' && (
            <section className="page-section scan-section" aria-labelledby="scan-title">
              <div className="page-heading"><div><div className="eyebrow">PACKAGE RECOGNITION</div><h1 id="scan-title">Scan medicine</h1><p className="heading-subtitle">Read package text, then check the details yourself.</p></div></div>
              <div className="scan-layout">
                <div className="scan-main">
                  <section className="panel scan-upload-panel">
                    <div className="panel-heading"><div><div className="eyebrow">STEP 1</div><h2>Add a package photo</h2></div><span className="step-number">01</span></div>
                    {!scanFile ? (
                      <button className="upload-dropzone" type="button" onClick={() => fileInput.current?.click()}>
                        <span className="upload-icon"><Upload size={21} /></span>
                        <strong>Take a photo or choose an image</strong>
                        <span>JPG, PNG or WEBP · English OCR in this prototype</span>
                        <span className="button button-outline upload-choose"><Camera size={16} /> Choose image</span>
                      </button>
                    ) : (
                      <div className="selected-image">
                        <img src={scanPreview} alt="Selected medicine package" />
                        <div className="selected-image-meta"><FileImage size={17} /><span>{scanFile.name}</span><button type="button" className="icon-button" title="Remove photo" onClick={() => { setScanFile(null); setScanPreview(''); setOcrText(''); setOcrStatus('idle') }}><X size={16} /></button></div>
                      </div>
                    )}
                    <input ref={fileInput} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) recognizeImage(file); event.target.value = '' }} />
                    {ocrStatus === 'processing' && <div className="processing-line"><span className="spinner" /> Reading printed text in your browser…</div>}
                    {ocrStatus === 'error' && <div className="inline-message error-message"><CircleHelp size={16} /><span>Text recognition could not start. You can still enter the package details below.</span></div>}
                    {ocrStatus === 'empty' && <div className="inline-message"><Info size={16} /><span>No readable text found. Try a brighter, closer photo or enter the details manually.</span></div>}
                    <p className="privacy-note"><ShieldCheck size={14} /> The image is processed in your browser and is not sent to a Medara server.</p>
                  </section>

                  <section className="panel extracted-panel">
                    <div className="panel-heading"><div><div className="eyebrow">STEP 2</div><h2>Review package text</h2></div><span className="step-number">02</span></div>
                    <label className="field-label" htmlFor="ocr-text">Text detected from image</label>
                    <textarea id="ocr-text" rows="5" value={ocrText} onChange={(event) => setOcrText(event.target.value)} placeholder={ocrStatus === 'processing' ? 'Reading text…' : 'Detected text will appear here. You can correct it, or continue with manual entry.'} />
                    <div className="inline-message"><Info size={16} /><span>Text recognition reads visible characters only. It does not identify or verify a medicine.</span></div>
                  </section>
                </div>

                <form className="panel scan-details" onSubmit={saveScannedRecord}>
                  <div className="panel-heading"><div><div className="eyebrow">STEP 3</div><h2>Package details</h2></div><span className="step-number">03</span></div>
                  <div className="unverified-callout"><ShieldCheck size={17} /><span><strong>Not verified by Medara</strong>OCR reads package text but cannot confirm a product match.</span></div>
                  <label className="field-label" htmlFor="scan-name">Medicine name <span>Required</span></label>
                  <input id="scan-name" value={scanName} onChange={(event) => setScanName(event.target.value)} placeholder="Enter the name from the package" required />
                  <a className="sfda-search-link" href={SFDA_SDI_URL} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Search registered medicines on SFDA SDI</a>
                  <label className="field-label" htmlFor="scan-quantity">Number of packages</label>
                  <input id="scan-quantity" type="number" min="1" step="1" value={scanQuantity} onChange={(event) => setScanQuantity(event.target.value)} />
                  <label className="field-label" htmlFor="scan-expiry">Expiration date <span>Optional</span></label>
                  <input id="scan-expiry" type="date" value={scanExpiry} onChange={(event) => setScanExpiry(event.target.value)} />
                  <label className="field-label" htmlFor="scan-location">Storage location <span>Optional</span></label>
                  <input id="scan-location" value={scanLocation} onChange={(event) => setScanLocation(event.target.value)} placeholder="e.g. Hall cabinet" />
                  <label className="check-row"><input type="checkbox" checked={scanConfirmed} onChange={(event) => setScanConfirmed(event.target.checked)} /><span>I checked the package label. I understand Medara has not verified this product.</span></label>
                  <button className="button button-primary button-full" type="submit" disabled={!scanName.trim() || !scanConfirmed}><Plus size={17} /> Add as unverified</button>
                  <p className="form-disclaimer">No ingredients, storage guidance, or safety information will be generated for this entry.</p>
                </form>
              </div>
            </section>
          )}

          {page === 'alerts' && (
            <section className="page-section" aria-labelledby="alerts-title">
              <div className="page-heading"><div><div className="eyebrow">INVENTORY MONITORING</div><h1 id="alerts-title">Alerts</h1><p className="heading-subtitle">Based only on expiration dates you entered.</p></div></div>
              <section className="panel reminder-setting">
                <div className="reminder-copy"><span className="setting-icon"><CalendarDays size={18} /></span><div><strong>Expiration reminder window</strong><span>Show a reminder before the date you entered.</span></div></div>
                <label className="select-wrap reminder-select"><span className="sr-only">Reminder window</span><select value={preferences.reminderDays} onChange={(event) => setPreferences((current) => ({ ...current, reminderDays: Number(event.target.value) }))}><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></select><ChevronDown size={15} /></label>
              </section>
              <div className="alert-summary"><div><strong>{expiredRecords.length}</strong><span>Expired</span></div><div><strong>{expiringRecords.length}</strong><span>Expiring soon</span></div><div><strong>{activeRecords.filter((record) => !record.expiryDate).length}</strong><span>Missing date</span></div></div>
              <section className="panel alert-panel">
                <div className="panel-heading panel-heading-tight"><div><div className="eyebrow">EXPIRATION</div><h2>Packages to review</h2></div></div>
                {activeRecords.length === 0 ? (
                  <div className="empty-state compact-empty"><div className="empty-illustration"><CheckCircle2 size={23} /></div><strong>No package alerts</strong><span>Add a cabinet record with an expiration date to see reminders here.</span></div>
                ) : (
                  <div className="alert-record-list">
                    {[...expiredRecords, ...expiringRecords].map((record) => <AlertRecord key={record.id} record={record} reminderDays={preferences.reminderDays} onOpen={() => { setPage('cabinet'); setSearchTerm(record.name) }} />)}
                    {activeRecords.filter((record) => !record.expiryDate).length > 0 && <div className="missing-dates"><div className="missing-header"><CircleHelp size={16} /><strong>Expiration date not entered</strong></div>{activeRecords.filter((record) => !record.expiryDate).map((record) => <button type="button" key={record.id} className="missing-record" onClick={() => { setPage('cabinet'); setSearchTerm(record.name) }}>{record.name}<span>Open record <ArrowUpRight size={13} /></span></button>)}</div>}
                    {expiredRecords.length + expiringRecords.length === 0 && activeRecords.every((record) => record.expiryDate) && <div className="quiet-empty"><span className="empty-check"><Check size={17} /></span><div><strong>Nothing needs attention</strong><span>No entered expiration dates are within your reminder window.</span></div></div>}
                  </div>
                )}
              </section>
              <div className="page-footnote"><Info size={14} /> Medara does not know whether a package date was entered correctly. Confirm dates on the packaging.</div>
            </section>
          )}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)} aria-current={page === id ? 'page' : undefined}><Icon size={19} /><span>{id === 'cabinet' ? 'Cabinet' : id === 'scan' ? 'Scan' : label}</span></button>)}
      </nav>

      {formOpen && <RecordDialog form={form} setForm={setForm} onClose={() => setFormOpen(false)} onSubmit={saveRecord} />}
      {notice && <div className="toast" role="status"><CheckCircle2 size={17} />{notice}</div>}
    </div>
  )
}

function MetricCard({ label, value, detail, icon: Icon, tone }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={18} strokeWidth={1.9} /></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-detail">{detail}</div></div>
}

function WelcomePage({ name, setName, onSubmit }) {
  return (
    <main className="welcome-screen">
      <section className="welcome-intro">
        <div className="welcome-brand"><span className="brand-mark"><Plus size={22} strokeWidth={2.8} /></span><span className="brand-word">medara<span>.</span></span></div>
        <div className="welcome-intro-copy">
          <div className="eyebrow">A SMARTER HOME MEDICINE CABINET</div>
          <h1>Make room for a little more clarity.</h1>
          <p>Keep your household medicine list organized, one package at a time.</p>
        </div>
        <div className="welcome-decoration" aria-hidden="true"><span /><span /><span /></div>
        <div className="welcome-version">MEDARA · TEST VERSION 0.1</div>
      </section>
      <section className="welcome-entry">
        <div className="welcome-form-wrap">
          <div className="welcome-form-kicker"><span>01</span> YOUR PERSONAL CABINET</div>
          <h2>Welcome to Medara</h2>
          <p className="welcome-description">What should we call you? We’ll use your name for your cabinet.</p>
          <form className="welcome-form" onSubmit={onSubmit}>
            <label htmlFor="welcome-name">Your name</label>
            <input id="welcome-name" autoFocus autoComplete="given-name" maxLength={40} value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" required />
            <button className="button button-primary" type="submit" disabled={!name.trim()}>Create my cabinet <ArrowUpRight size={16} /></button>
          </form>
          <div className="welcome-privacy"><ShieldCheck size={15} /><span>Your name is saved in this browser only. This prototype does not create an account.</span></div>
        </div>
      </section>
    </main>
  )
}

function ExpiryBadge({ record, reminderDays }) {
  const state = getExpiryState(record, reminderDays)
  const label = state === 'expired' ? 'Expired' : state === 'soon' ? 'Expiring soon' : state === 'unknown' ? 'No date' : 'On track'
  return <span className={`status-badge ${state}`}><span />{label}</span>
}

function CompactRecord({ record, reminderDays, onClick }) {
  const state = getExpiryState(record, reminderDays)
  const days = daysUntil(record.expiryDate)
  return <button className="compact-record" type="button" onClick={onClick}><span className={`mini-status ${state}`}><AlertTriangle size={15} /></span><span className="compact-record-copy"><strong>{record.name}</strong><span>{state === 'expired' ? `Expired ${formatDate(record.expiryDate)}` : `Expires ${formatDate(record.expiryDate)} · ${days} days`}</span></span><ArrowUpRight size={15} /></button>
}

function RecordList({ records, reminderDays, onEdit, onRemove, onMarkUsed, onMarkDiscarded }) {
  return <div className="record-list">{records.map((record) => <article className="record-row" key={record.id}><div className="record-product"><span className="product-icon"><Package size={18} /></span><div className="record-title-wrap"><strong>{record.name}</strong><span className="record-meta">{record.location || 'Location not set'} <span>·</span> <span className="unverified-text">Not verified</span></span></div></div><div className="record-quantity"><span className="mobile-field-label">Qty</span>{record.quantity} {record.quantity === 1 ? 'package' : 'packages'}</div><div className="record-expiry"><span className="mobile-field-label">Expires</span>{formatDate(record.expiryDate)}</div><div className="record-status"><ExpiryBadge record={record} reminderDays={reminderDays} /></div><div className="record-actions"><button type="button" className="icon-button" title="Edit record" onClick={() => onEdit(record)}><Pencil size={15} /></button><button type="button" className="icon-button" title="Mark as used" onClick={() => onMarkUsed(record)}><Check size={16} /></button><button type="button" className="icon-button" title="Mark as discarded" onClick={() => onMarkDiscarded(record)}><Archive size={15} /></button><button type="button" className="icon-button danger-icon" title="Remove record" onClick={() => onRemove(record)}><Trash2 size={15} /></button></div><div className="record-mobile-actions"><button type="button" onClick={() => onEdit(record)}>Edit</button><button type="button" onClick={() => onMarkUsed(record)}>Mark used</button><button type="button" onClick={() => onMarkDiscarded(record)}>Discard</button><button type="button" onClick={() => onRemove(record)}>Remove</button></div></article>)}</div>
}

function AlertRecord({ record, reminderDays, onOpen }) {
  const state = getExpiryState(record, reminderDays)
  const days = daysUntil(record.expiryDate)
  return <article className={`alert-record ${state}`}><span className={`alert-symbol ${state}`}><AlertTriangle size={18} /></span><div className="alert-record-copy"><strong>{record.name}</strong><span>{state === 'expired' ? `Expired ${formatDate(record.expiryDate)}` : `Expires ${formatDate(record.expiryDate)} · ${days} ${days === 1 ? 'day' : 'days'} left`}</span></div><ExpiryBadge record={record} reminderDays={reminderDays} /><button type="button" className="icon-button" title="Open cabinet record" onClick={onOpen}><ArrowUpRight size={16} /></button></article>
}

function RecordDialog({ form, setForm, onClose, onSubmit }) {
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="record-dialog" role="dialog" aria-modal="true" aria-labelledby="record-dialog-title"><div className="dialog-heading"><div><div className="eyebrow">CABINET ENTRY</div><h2 id="record-dialog-title">{form.id ? 'Edit package' : 'Add medicine'}</h2></div><button type="button" className="icon-button" title="Close dialog" onClick={onClose}><X size={18} /></button></div><form onSubmit={onSubmit}><label className="field-label" htmlFor="form-name">Medicine name <span>Required</span></label><input id="form-name" autoFocus value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Enter name from the package" required /><label className="field-label" htmlFor="form-quantity">Number of packages</label><input id="form-quantity" type="number" min="1" step="1" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} /><label className="field-label" htmlFor="form-expiry">Expiration date <span>Optional</span></label><input id="form-expiry" type="date" value={form.expiryDate || ''} onChange={(event) => update('expiryDate', event.target.value)} /><label className="field-label" htmlFor="form-location">Storage location <span>Optional</span></label><input id="form-location" value={form.location || ''} onChange={(event) => update('location', event.target.value)} placeholder="e.g. Hall cabinet" /><label className="field-label" htmlFor="form-notes">Notes <span>Optional</span></label><textarea id="form-notes" rows="2" value={form.notes || ''} onChange={(event) => update('notes', event.target.value)} placeholder="Personal inventory note" /><div className="unverified-callout dialog-callout"><ShieldCheck size={17} /><span><strong>Not verified</strong>This entry is for inventory tracking only.</span></div><label className="check-row"><input type="checkbox" checked={Boolean(form.confirmed)} onChange={(event) => update('confirmed', event.target.checked)} /><span>I checked the package label and understand Medara has not verified this product.</span></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit" disabled={!form.name.trim() || !form.confirmed}>{form.id ? 'Save changes' : 'Add to cabinet'}</button></div></form></section></div>
}

export default App
