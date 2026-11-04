import { Fragment, useEffect, useRef, useState } from 'react'
import * as Select from '@radix-ui/react-select'
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Headphones,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'

const initialAnswers = {
  timely: '',
  behavior: '',
  damages: '',
  explanation: '',
  uncoveredDamageReason: '',
  assessment: '',
  delivery: '',
  deliveryDelayReason: '',
  deliveryDelayDetail: '',
  service: '',
  serviceDissatisfactionReason: '',
  overall: '',
  remarks: '',
}

const NO_RATING = 'no-rating'
const PRACTICE_STORAGE_KEY = 'claimdesk-practice-v2'

const questionGroups = [
  {
    questions: [
      { key: 'timely', number: '01', text: 'Was the survey conducted on time?', type: 'choice' },
      { key: 'behavior', number: '02', text: 'How would you rate the surveyor’s behaviour?', type: 'rating', hint: '1 = poor · 10 = excellent' },
    ],
  },
  {
    questions: [
      { key: 'damages', number: '03', text: 'Were all damages on the claim form approved by the surveyor?', type: 'choice' },
      { key: 'explanation', number: '04', text: 'Did the surveyor explain why any parts were not approved?', type: 'choice', options: ['Yes', 'No', 'Don’t know', 'N/A'] },
      { key: 'assessment', number: '05', text: 'How would you rate the claim assessment?', type: 'rating', hint: '1 = poor · 10 = excellent' },
    ],
  },
  {
    questions: [
      { key: 'delivery', number: '06', text: 'Was the vehicle delivered on the promised date?', type: 'choice' },
      { key: 'service', number: '07', text: 'Are you happy with the dealer or workshop service?', type: 'choice' },
      { key: 'overall', number: '08', text: 'How would you rate the overall claim experience?', type: 'rating', hint: '1 = poor · 10 = excellent' },
    ],
  },
]

const explanationDetailsQuestion = {
  key: 'uncoveredDamageReason',
  number: '04A',
  text: 'Damages not covered by the surveyor',
  type: 'choice',
  options: [
    'Old Damage/Rust in Damage parts',
    'One side damage covered',
    'Multiple Damage',
    'Cause of loss incorrectly mentioned in claim form',
    'Survey not response to customer',
    'Delay in claim intimation',
    'N/A',
  ],
}

const dissatisfactionQuestion = {
  key: 'dissatisfactionReason',
  number: '05A',
  text: 'Reasons for dissatisfaction with the surveyor (Apart from non approval of claim/damages)',
  type: 'choice',
  options: [
    'Delay in delivery order',
    'Non approval of claim/damages',
    'Delay in survey',
    'Service and delivery related',
    'Survey misbehaved',
    'Survey not respond to customer',
    'No specific reason shared',
    'N/A',
  ],
}

const serviceDissatisfactionQuestion = {
  key: 'serviceDissatisfactionReason',
  number: '07A',
  text: 'Reasons for dissatisfaction with dealer/Workshop',
  type: 'choice',
  options: [
    'Cashless facility not given',
    'Delay in claim initiating',
    'Delay in repair',
    'Did not get support for towing',
    'Initially refused to accept the car',
    'Lack of manpower',
    'Misbehaved by dealer personnel',
    'No response post submitting the car',
    'Parts not available',
    'Repair not done properly',
    'Space not available in workshop',
  ],
}

const syllabusTopics = [
  { title: 'Contact Info', detail: 'Confirm the insured’s name and contact details, and check that they match the policy record.' },
  { title: 'Benefits we offer', detail: 'Explain the benefits available under this product and any limits or conditions that apply.' },
  { title: 'Risk Covered and Exclusions', detail: 'Summarize covered events, exclusions, deductibles, and limits using the policy wording.' },
  { title: 'Policy Types', detail: 'Outline the available policy types and what each one is intended to cover.' },
  { title: 'TP vs OD', detail: 'Third-party cover addresses legal liability to others; own-damage cover applies to damage to the insured vehicle, subject to terms.' },
  { title: 'CPA Opt out', detail: 'Explain owner-driver personal accident cover and any choices or eligibility rules in the current approved product guidance.' },
  { title: 'Discounts', detail: 'Describe eligible discounts and the requirements for receiving or keeping them.' },
  { title: 'NCB', detail: 'No-claim bonus is generally an own-damage renewal discount; explain eligibility and applicable steps under the policy.' },
  { title: 'IDV', detail: 'Insured Declared Value is a policy value used in certain total-loss or theft settlements; it is not a guaranteed payout.' },
  { title: 'DA', detail: 'Use the company’s approved product guide to explain DA, since the abbreviation can vary by product.' },
  { title: 'PCF', detail: 'Use the company’s approved product guide to explain PCF and how it applies to this policy.' },
  { title: 'Geographical Extensions', detail: 'Explain any extension beyond the standard coverage territory and the endorsement terms that apply.' },
  { title: 'Endorsement', detail: 'An endorsement is a formal change to policy details or terms; confirm when it takes effect.' },
  { title: 'Add-ons', detail: 'Describe optional extra covers, their premium, and their limits or exclusions.' },
  { title: 'ORA vs RSA', detail: 'Compare the on-road and roadside assistance services, limits, and conditions using the product wording.' },
]

const deliveryDelayQuestion = {
  key: 'deliveryDelayReason',
  number: '06A',
  text: 'Reason for Delay in Delivery of Vehicle',
  type: 'choice',
  options: ['Due to Customer', 'Due to Ins Co', 'Due to Workshop', 'External Factors', 'N/A'],
  placeholder: 'Select Any...',
}

const deliveryDelayDetailsByReason = {
  'Due to Customer': [
    'Customer out of station',
    "Didn't collect the vehicle",
    'Delay in document submission by the customer',
    'Other',
  ],
  'Due to Ins Co': [
    'Delay in claim approval from insurance company',
    'Delay in post repair',
    'Delay in the survey of vehicle',
    'Dispute in settlement Amount',
    'Document Verification pending',
    'Took long time to investigate the claim',
    'Repair estimate dispute in workshop & IC',
    'N/A',
  ],
  'Due to Workshop': [
    'Dispute in bill break up',
    'High workload at workshop',
    'Incomplete or delay in repair',
    'Non availability of mechanics',
    'Non availability in spare part',
  ],
  'External Factors': [
    'Holiday/Festival',
    'Natural Calamity - Rain/Flood',
    'NA',
  ],
  'N/A': [],
}

function getDeliveryDelayDetailQuestion(reason) {
  return {
    key: 'deliveryDelayDetail',
    number: '06B',
    text: `${reason} answer`,
    type: 'choice',
    options: deliveryDelayDetailsByReason[reason] ?? [],
    placeholder: 'Select Any...',
  }
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'calls', label: 'Call queue', icon: Headphones, count: '04' },
  { id: 'customers', label: 'Customers', icon: UsersRound },
  { id: 'claims', label: 'Claims', icon: ShieldCheck },
]

const tabs = ['Call Info', 'CRM', 'Additional CRM', 'History']

function loadPracticeData() {
  try {
    const saved = localStorage.getItem(PRACTICE_STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialAnswers
  } catch {
    return initialAnswers
  }
}

function LegacyApp() {
  const [answers, setAnswers] = useState(loadPracticeData)
  const [activeTab, setActiveTab] = useState('Additional CRM')
  const [activeNav, setActiveNav] = useState('calls')
  const [saveState, setSaveState] = useState('Saved locally')
  const [completed, setCompleted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setSaveState('Saving…')
    const timer = window.setTimeout(() => {
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(answers))
      setSaveState('Saved locally')
    }, 350)
    return () => window.clearTimeout(timer)
  }, [answers])

  const setAnswer = (key, value) => {
    setAnswers((current) => ({ ...current, [key]: value }))
    setCompleted(false)
  }

  const resetPractice = () => {
    setAnswers(initialAnswers)
    setCompleted(false)
    setActiveTab('Additional CRM')
    setMenuOpen(false)
  }

  const answeredCount = Object.keys(initialAnswers).filter((key) => {
    const value = answers[key]
    return value !== '' && value !== null && value !== undefined
  }).length

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Web Console home">
          <span className="brand-mark"><ShieldCheck size={19} strokeWidth={2.2} /></span>
          <span>Web Console<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-switcher" type="button">
          <span className="workspace-avatar">N</span>
          <span className="workspace-copy"><strong>Northstar Assist</strong><small>Support team</small></span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button
              className={`side-link ${activeNav === id ? 'active' : ''}`}
              key={id}
              onClick={() => setActiveNav(id)}
              type="button"
            >
              <Icon size={18} />
              <span>{label}</span>
              {count && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <button className="side-link settings-link" type="button" onClick={() => setActiveNav('settings')}>
          <Settings2 size={18} /><span>Settings</span>
        </button>
        <div className="agent-profile">
          <div className="agent-avatar">JR</div>
          <span className="agent-copy"><strong>Jordan Reyes</strong><small>Claims specialist</small></span>
          <MoreHorizontal size={18} />
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-brand" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Open menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="brand-mark"><ShieldCheck size={16} /></span>
            <span>Web Console<span className="brand-period">.</span></span>
          </button>
          <div className="breadcrumb"><span>Call queue</span><span className="crumb-slash">/</span><strong>Call review</strong></div>
          <div className="top-actions">
            <span className="practice-pill"><span /> Practice mode</span>
            <button className="icon-button search-button" type="button" aria-label="Search"><Search size={18} /></button>
            <button className="icon-button notification-button" type="button" aria-label="Notifications"><Bell size={18} /><i /></button>
          </div>
        </header>

        {menuOpen && (
          <div className="mobile-menu">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => { setActiveNav(id); setMenuOpen(false) }}>
                <Icon size={18} />{label}
              </button>
            ))}
          </div>
        )}

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> CUSTOMER SUPPORT <span className="eyebrow-slash">/</span> CLAIMS</div>
              <h1>Call review</h1>
              <p>Review the customer’s claim experience and record the outcome.</p>
            </div>
            <button className="back-button" type="button" onClick={() => setActiveNav('calls')}><ArrowLeft size={16} /><span>Back to queue</span></button>
          </div>

          <section className="call-card" aria-label="Active customer call">
            <div className="call-card-main">
              <div className="customer-avatar">AM</div>
              <div className="customer-details">
                <div className="customer-name-row"><h2>Arun Mehta</h2><span className="live-badge"><i /> IN PROGRESS</span></div>
                <p>Motor claim <span className="detail-divider">·</span> CLM-28419</p>
                <div className="customer-meta"><span><Phone size={13} /> +91 98765 43210</span><span><Clock3 size={13} /> 06:42</span><span><Activity size={13} /> Repair survey</span></div>
              </div>
            </div>
            <div className="call-card-actions">
              <button className="call-icon-button" type="button" title="Call options" aria-label="Call options"><MoreHorizontal size={20} /></button>
              <button className="end-call-button" type="button" onClick={() => setCompleted(true)}><Phone size={15} /><span>End call</span></button>
            </div>
          </section>

          <div className="tab-bar" role="tablist" aria-label="Call record sections">
            {tabs.map((tab) => (
              <button
                className={`record-tab ${activeTab === tab ? 'selected' : ''}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
                type="button"
              >{tab}{tab === 'Additional CRM' && <span className="tab-dot" />}</button>
            ))}
            <button className="tab-overflow" type="button" aria-label="More sections"><MoreHorizontal size={19} /></button>
          </div>

          <div className="record-layout">
            <section className="record-main">
              {activeTab === 'Additional CRM' ? (
                <>
                  <div className="section-heading">
                    <div>
                      <div className="section-kicker">POST-CALL SURVEY</div>
                      <h2>Claim experience</h2>
                      <p>Capture feedback about the survey, assessment and repair.</p>
                    </div>
                    <div className="completion-badge"><CheckCircle2 size={15} /><span>{answeredCount} of 9 complete</span></div>
                  </div>
                  <div className="progress-track" aria-label={`${answeredCount} of 9 fields complete`}><span style={{ width: `${(answeredCount / 9) * 100}%` }} /></div>
                  <div className="question-groups">
                    {questionGroups.map((group) => (
                      <section className="question-group" key={group.title}>
                        <h3>{group.title}</h3>
                        <div className="question-list">
                          {group.questions.map((question) => (
                            <Question
                              key={question.key}
                              question={question}
                              value={answers[question.key]}
                              onChange={(value) => setAnswer(question.key, value)}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                  <label className="remarks-field">
                    <span className="remarks-label"><MessageSquareText size={15} /> Agent notes <span>OPTIONAL</span></span>
                    <textarea
                      value={answers.remarks}
                      onChange={(event) => setAnswer('remarks', event.target.value)}
                      placeholder="Add context from the conversation…"
                      rows="3"
                    />
                  </label>
                  <div className="form-footer">
                    <span className="save-state"><span className="save-dot" />{saveState}</span>
                    <div className="form-actions">
                      <button className="text-action" type="button" onClick={resetPractice}>Reset practice</button>
                      <button className={`complete-button ${completed ? 'is-complete' : ''}`} type="button" onClick={() => setCompleted(true)}>
                        {completed ? <Check size={16} /> : <CheckCircle2 size={16} />}
                        {completed ? 'Call completed' : 'Complete call'}
                      </button>
                    </div>
                  </div>
                  {completed && <div className="completion-notice" role="status"><CheckCircle2 size={16} /> Practice call marked complete. Your answers are saved on this device.</div>}
                </>
              ) : (
                <OtherTab activeTab={activeTab} />
              )}
            </section>

            <aside className="record-aside">
              <div className="aside-card claim-summary">
                <div className="aside-heading"><h3>Claim summary</h3><button type="button" aria-label="Open claim"><ArrowUpRight size={16} /></button></div>
                <div className="summary-status"><span className="status-icon"><ShieldCheck size={17} /></span><span><strong>Under assessment</strong><small>Last updated 12 Jun 2025</small></span></div>
                <dl className="summary-list">
                  <div><dt>Policy number</dt><dd>POL-1084-2291</dd></div>
                  <div><dt>Vehicle</dt><dd>Hyundai Creta, 2022</dd></div>
                  <div><dt>Registration</dt><dd>KA 03 MN 4821</dd></div>
                  <div><dt>Workshop</dt><dd>Metro Auto Works</dd></div>
                </dl>
                <button className="view-claim-button" type="button" onClick={() => setActiveTab('CRM')}>View claim details <ArrowUpRight size={14} /></button>
              </div>
              <div className="aside-card activity-card">
                <div className="aside-heading"><h3>Recent activity</h3><button type="button" aria-label="View activity"><ArrowUpRight size={16} /></button></div>
                <div className="activity-item"><span className="activity-icon completed"><Check size={14} /></span><div><strong>Survey submitted</strong><small>12 Jun · 11:24 AM</small></div></div>
                <div className="activity-item"><span className="activity-icon call"><Phone size={13} /></span><div><strong>Outbound call started</strong><small>12 Jun · 11:18 AM</small></div></div>
                <div className="activity-item"><span className="activity-icon claim"><FileText size={13} /></span><div><strong>Claim assigned to you</strong><small>12 Jun · 10:52 AM</small></div></div>
                <button className="activity-link" type="button" onClick={() => setActiveTab('History')}>View full history <ArrowDown size={14} /></button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button type="button" onClick={() => setActiveNav('overview')}><LayoutDashboard size={19} /><span>Home</span></button>
        <button className="mobile-nav-active" type="button" onClick={() => setActiveNav('calls')}><Headphones size={19} /><span>Calls</span></button>
        <button type="button" onClick={() => setActiveNav('customers')}><UserRound size={19} /><span>People</span></button>
        <button type="button" onClick={() => setActiveNav('claims')}><ShieldCheck size={19} /><span>Claims</span></button>
      </nav>
    </div>
  )
}

function Question({ question, value, onChange }) {
  const isRating = question.type === 'rating'
  const options = isRating
    ? [
        ...Array.from({ length: 10 }, (_, index) => String(index + 1)).map((rating) => ({ value: rating, label: rating })),
        { value: NO_RATING, label: 'No rating' },
      ]
    : (question.options ?? ['Yes', 'No', 'Don’t know']).map((answer) => ({ value: answer, label: answer }))

  return (
    <div className={`question-row ${question.number.length > 2 ? 'follow-up-row' : ''}`}>
      <div className="question-copy">
        <span className="question-number">{question.number}</span>
        <div><p>{question.text}</p>{question.hint && <small>{question.hint}</small>}</div>
      </div>
      <Dropdown
        ariaLabel={`${isRating ? 'Rating' : 'Answer'}: ${question.text}`}
        value={value ?? (isRating ? 1 : '')}
        placeholder={question.placeholder ?? 'Choose an answer'}
        options={options}
        disabled={options.length === 0}
        onChange={(selectedValue) => onChange(isRating && selectedValue !== NO_RATING ? Number(selectedValue) : selectedValue)}
      />
    </div>
  )
}

function Dropdown({ ariaLabel, value, placeholder, options, disabled, onChange }) {
  return (
    <Select.Root value={String(value ?? '')} onValueChange={onChange}>
      <Select.Trigger className="dropdown-trigger" aria-label={ariaLabel} disabled={disabled}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild><ChevronDown className="dropdown-chevron" size={15} /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="dropdown-content" position="popper" sideOffset={4} align="start">
          <Select.Viewport className="dropdown-viewport">
            {options.map((option) => (
              <Select.Item className="dropdown-item" key={option.value} value={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="dropdown-indicator"><Check size={14} /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

function OtherTab({ activeTab }) {
  if (activeTab === 'History') {
    return (
      <div className="other-tab-content">
        <div className="section-kicker">CALL RECORD</div><h2>Call history</h2><p className="other-intro">Recent interactions linked to this customer and claim.</p>
        <div className="history-list">
          <div><span className="history-dot green" /><small>12 Jun 2025 · 11:18 AM</small><strong>Outbound claim follow-up</strong><p>Call in progress with Arun Mehta.</p></div>
          <div><span className="history-dot amber" /><small>12 Jun 2025 · 10:52 AM</small><strong>Claim assigned</strong><p>Assigned to Jordan Reyes for customer follow-up.</p></div>
          <div><span className="history-dot gray" /><small>11 Jun 2025 · 4:36 PM</small><strong>Survey report received</strong><p>Assessment documents added to claim file.</p></div>
        </div>
      </div>
    )
  }
  if (activeTab === 'CRM') {
    return (
      <div className="other-tab-content">
        <div className="section-kicker">CUSTOMER RECORD</div><h2>Customer details</h2><p className="other-intro">Contact information associated with this claim.</p>
        <div className="detail-grid">
          <div><span>Customer name</span><strong>Arun Mehta</strong></div><div><span>Phone number</span><strong>+91 98765 43210</strong></div>
          <div><span>Email address</span><strong>arun.mehta@example.test</strong></div><div><span>Preferred language</span><strong>English</strong></div>
          <div><span>Customer since</span><strong>March 2021</strong></div><div><span>Open claims</span><strong>1 active claim</strong></div>
        </div>
      </div>
    )
  }
  return (
    <div className="other-tab-content">
      <div className="section-kicker">CALL DETAILS</div><h2>Call information</h2><p className="other-intro">A quick overview of this customer support interaction.</p>
      <div className="detail-grid">
        <div><span>Call type</span><strong>Repair survey follow-up</strong></div><div><span>Direction</span><strong>Outbound</strong></div>
        <div><span>Queue</span><strong>Motor claims</strong></div><div><span>Lead ID</span><strong>LD-32871</strong></div>
        <div><span>Call number</span><strong>8907390</strong></div><div><span>Assigned agent</span><strong>Jordan Reyes</strong></div>
      </div>
      <div className="call-info-note"><Phone size={17} /><span><strong>Practice call</strong><small>No real call is being placed. Use the survey tab to record sample answers.</small></span></div>
    </div>
  )
}

function App() {
  const [answers, setAnswers] = useState(loadPracticeData)
  const [activePage, setActivePage] = useState(() => window.location.hash === '#page-two' ? 'page-two' : 'experience')
  const [saveState, setSaveState] = useState('Saved locally')
  const [completed, setCompleted] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const reviewDialogRef = useRef(null)

  useEffect(() => {
    const updatePage = () => setActivePage(window.location.hash === '#page-two' ? 'page-two' : 'experience')
    window.addEventListener('hashchange', updatePage)
    return () => window.removeEventListener('hashchange', updatePage)
  }, [])

  useEffect(() => {
    const dialog = reviewDialogRef.current
    if (!dialog) return
    if (summaryOpen && !dialog.open) dialog.showModal()
    if (!summaryOpen && dialog.open) dialog.close()
  }, [summaryOpen])

  useEffect(() => {
    if (!summaryOpen) return
    const bodyOverflow = document.body.style.overflow
    const documentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = bodyOverflow
      document.documentElement.style.overflow = documentOverflow
    }
  }, [summaryOpen])

  useEffect(() => {
    setSaveState('Saving…')
    const timer = window.setTimeout(() => {
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(answers))
      setSaveState('Saved locally')
    }, 350)
    return () => window.clearTimeout(timer)
  }, [answers])

  const setAnswer = (key, value) => {
    setAnswers((current) => {
      const next = { ...current, [key]: value }
      if (key === 'explanation' && value !== 'Yes') next.uncoveredDamageReason = ''
      if (key === 'assessment' && !(typeof value === 'number' && value < 7)) next.dissatisfactionReason = ''
      if (key === 'delivery' && value !== 'No') {
        next.deliveryDelayReason = ''
        next.deliveryDelayDetail = ''
      }
      if (key === 'deliveryDelayReason') next.deliveryDelayDetail = ''
      if (key === 'service' && value !== 'No') next.serviceDissatisfactionReason = ''
      return next
    })
    setCompleted(false)
    setSummaryOpen(false)
  }

  const visibleQuestions = questionGroups.flatMap((group) => group.questions)
  if (answers.explanation === 'Yes') visibleQuestions.splice(4, 0, explanationDetailsQuestion)
  const assessmentIndex = visibleQuestions.findIndex(({ key }) => key === 'assessment')
  if (typeof answers.assessment === 'number' && answers.assessment < 7) {
    visibleQuestions.splice(assessmentIndex + 1, 0, dissatisfactionQuestion)
  }
  const deliveryIndex = visibleQuestions.findIndex(({ key }) => key === 'delivery')
  if (answers.delivery === 'No') {
    visibleQuestions.splice(deliveryIndex + 1, 0, deliveryDelayQuestion)
    if (answers.deliveryDelayReason) {
      visibleQuestions.splice(deliveryIndex + 2, 0, getDeliveryDelayDetailQuestion(answers.deliveryDelayReason))
    }
  }
  const serviceIndex = visibleQuestions.findIndex(({ key }) => key === 'service')
  if (answers.service === 'No') visibleQuestions.splice(serviceIndex + 1, 0, serviceDissatisfactionQuestion)
  const questionCount = visibleQuestions.length
  const answeredCount = visibleQuestions.filter(({ key }) => {
    const value = answers[key]
    return value !== '' && value !== null && value !== undefined
  }).length

  const resetPractice = () => {
    setAnswers(initialAnswers)
    setCompleted(false)
    setSummaryOpen(false)
  }

  const getSummaryAnswer = (question) => {
    const value = answers[question.key]
    if (value === '' || value === null || value === undefined) return 'Not answered'
    if (question.type === 'rating') return value === NO_RATING ? 'No rating' : `${value} / 10`
    return value
  }

  return (
    <div className="practice-site">
      <header className="site-header">
        <div className="site-header-inner">
          <a className="site-brand" href="#claim-experience" aria-label="Web Console home">
            <span className="brand-mark"><ShieldCheck size={18} /></span>
            <span>Web Console<span className="brand-period">.</span></span>
          </a>
          <nav className="site-navigation" aria-label="Main navigation">
            <a href="#claim-experience" aria-current={activePage === 'experience' ? 'page' : undefined}>Claim experience</a>
            <a href="#page-two" aria-current={activePage === 'page-two' ? 'page' : undefined}>Syllabus</a>
            <details className="syllabus-quick-access">
              <summary><BookOpen size={15} /><span>Quick syllabus</span><ChevronDown size={14} /></summary>
              <section className="syllabus-quick-panel" aria-label="Basic policy syllabus quick reference">
                <header><span className="section-kicker">QUICK REFERENCE</span><h2>Basic policy syllabus</h2></header>
                <ol>
                  {syllabusTopics.map((topic, index) => (
                    <li key={topic.title}>
                      <span className="syllabus-topic-number">{String(index + 1).padStart(2, '0')}</span>
                      <div><strong>{topic.title}</strong><p>{topic.detail}</p></div>
                    </li>
                  ))}
                </ol>
              </section>
            </details>
          </nav>
          <span className="site-mode"><span /> Practice mode</span>
        </div>
      </header>

      <main className="site-main">
        {activePage === 'experience' ? (
          <section className="experience-card" aria-labelledby="experience-title">
            <div className="experience-heading">
              <div className="section-kicker">CLAIM SURVEY</div>
              <div className="experience-title-row">
                <h1 id="experience-title">Claim experience</h1>
                <span className="completion-badge"><CheckCircle2 size={15} />{answeredCount} of {questionCount} answered</span>
              </div>
              <p>Record the customer’s feedback about their claim.</p>
            </div>
            <div className="question-groups experience-form">
              {questionGroups.map((group) => (
                <section className="question-group" key={group.questions[0].key}>
                  <div className="question-list">
                    {group.questions.map((question) => (
                      <Fragment key={question.key}>
                        <Question
                          question={question}
                          value={answers[question.key]}
                          onChange={(value) => setAnswer(question.key, value)}
                        />
                        {question.key === 'explanation' && answers.explanation === 'Yes' && (
                          <Question
                            question={explanationDetailsQuestion}
                            value={answers[explanationDetailsQuestion.key]}
                            onChange={(value) => setAnswer(explanationDetailsQuestion.key, value)}
                          />
                        )}
                        {question.key === 'assessment' && typeof answers.assessment === 'number' && answers.assessment < 7 && (
                          <Question
                            question={dissatisfactionQuestion}
                            value={answers[dissatisfactionQuestion.key]}
                            onChange={(value) => setAnswer(dissatisfactionQuestion.key, value)}
                          />
                        )}
                        {question.key === 'delivery' && answers.delivery === 'No' && (
                          <Question
                            question={deliveryDelayQuestion}
                            value={answers[deliveryDelayQuestion.key]}
                            onChange={(value) => setAnswer(deliveryDelayQuestion.key, value)}
                          />
                        )}
                        {question.key === 'delivery' && answers.delivery === 'No' && answers.deliveryDelayReason && (
                          <Question
                            question={getDeliveryDelayDetailQuestion(answers.deliveryDelayReason)}
                            value={answers.deliveryDelayDetail}
                            onChange={(value) => setAnswer('deliveryDelayDetail', value)}
                          />
                        )}
                        {question.key === 'service' && answers.service === 'No' && (
                          <Question
                            question={serviceDissatisfactionQuestion}
                            value={answers[serviceDissatisfactionQuestion.key]}
                            onChange={(value) => setAnswer(serviceDissatisfactionQuestion.key, value)}
                          />
                        )}
                      </Fragment>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <label className="remarks-field">
              <span className="remarks-label"><MessageSquareText size={15} /> Agent notes <span>OPTIONAL</span></span>
              <textarea
                value={answers.remarks}
                onChange={(event) => setAnswer('remarks', event.target.value)}
                placeholder="Add a note about the customer’s feedback…"
                rows="3"
              />
            </label>
            <div className="practice-actions">
              <span className="save-state"><span className="save-dot" />{saveState}</span>
              <div className="form-actions">
                <button className="reset-form-button" type="button" onClick={resetPractice}><RotateCcw size={15} /><span>Reset form</span></button>
                <button className={`complete-button ${completed ? 'is-complete' : ''}`} type="button" onClick={() => { setCompleted(true); setSummaryOpen(true) }}>
                  {completed ? <Check size={16} /> : <CheckCircle2 size={16} />}
                  {completed ? 'Practice complete' : 'Finish practice'}
                </button>
              </div>
            </div>
            {completed && <div className="completion-notice" role="status"><CheckCircle2 size={16} /> Practice complete. Your answers are saved on this device.</div>}
            <dialog
              ref={reviewDialogRef}
              className="review-dialog"
              aria-labelledby="review-dialog-title"
              onCancel={(event) => { event.preventDefault(); setSummaryOpen(false) }}
              onClick={(event) => { if (event.target === event.currentTarget) setSummaryOpen(false) }}
            >
              <div className="review-dialog-inner">
                <header className="review-dialog-header">
                  <div>
                    <div className="section-kicker">PRACTICE REVIEW</div>
                    <h2 id="review-dialog-title">Your answers</h2>
                    <p>{visibleQuestions.length} questions in this practice</p>
                  </div>
                  <button className="review-close" type="button" aria-label="Close review" onClick={() => setSummaryOpen(false)}><X size={19} /></button>
                </header>
                <div className="review-dialog-body">
                  <div className="review-answer-list">
                    {visibleQuestions.map((question) => (
                      <div className="review-answer-row" key={question.key}>
                        <span className="review-question-number">{question.number}</span>
                        <div className="review-answer-copy">
                          <p>{question.text}</p>
                          <strong>{getSummaryAnswer(question)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                  {answers.remarks?.trim() && (
                    <div className="review-notes">
                      <span>Agent notes</span>
                      <p>{answers.remarks}</p>
                    </div>
                  )}
                </div>
                <footer className="review-dialog-footer">
                  <span><span className="save-dot" />Saved locally</span>
                  <div className="review-dialog-actions">
                    <button className="review-reset-button" type="button" onClick={resetPractice}><RotateCcw size={14} /><span>Reset form</span></button>
                    <button className="review-save-button" type="button" onClick={() => setSummaryOpen(false)}>Save</button>
                  </div>
                </footer>
              </div>
            </dialog>
          </section>
        ) : (
          <section className="second-page-placeholder" aria-labelledby="second-page-title">
            <div className="section-kicker">BASIC SYLLABUS</div>
            <h1 id="second-page-title">Policy topics</h1>
            <p>Use these short notes as a guide. Confirm coverage, limits, and eligibility in the current policy wording.</p>
            <ol className="syllabus-list">
              {syllabusTopics.map((topic, index) => (
                <li key={topic}>
                  <span className="syllabus-topic-number">{String(index + 1).padStart(2, '0')}</span>
                  <div><strong>{topic.title}</strong><p>{topic.detail}</p></div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span>Web Console practice</span>
        <span>Created by Indrajit Bhowmick</span>
      </footer>
    </div>
  )
}

export default App
