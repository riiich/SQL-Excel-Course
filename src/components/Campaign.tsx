import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql, SQLite } from '@codemirror/lang-sql'
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronRight,
  Clipboard, Code2, Database, Eye, Gauge, GitMerge, HeartPulse, HelpCircle,
  Landmark, Lightbulb, LoaderCircle, Package, Play, RotateCcw,
  ShieldCheck, Sparkles, Store, Table2, Trophy, Utensils, X, Zap,
} from 'lucide-react'
import { campaignChapters, campaignMissionCount, getCampaignChallenge, getCampaignChapter } from '../data/campaign'
import { useSqlEngine } from '../hooks/useSqlEngine'
import { validateResult, type Validation } from '../lib/validate'
import type { CampaignChapter, CampaignChallenge, ProgressState, QueryResult, SqlValue } from '../types'

type Theme = 'dark' | 'light'

interface Props {
  chapterId?: string
  missionId?: string
  progress: ProgressState
  theme: Theme
  onProgress: (update: Partial<ProgressState> | ((current: ProgressState) => ProgressState)) => void
  onNavigate: (chapterId?: string, missionId?: string) => void
  onHome: () => void
}

const chapterIcons = {
  store: Store,
  utensils: Utensils,
  heart: HeartPulse,
  landmark: Landmark,
  trophy: Trophy,
  merge: GitMerge,
  package: Package,
  shield: ShieldCheck,
  gauge: Gauge,
  zap: Zap,
}

const missionKey = (id: string) => `campaign:${id}`

function starsFor(challenge: CampaignChallenge, progress: ProgressState) {
  if (!progress.campaignCompleted.includes(challenge.id)) return 0
  const hints = progress.hints[missionKey(challenge.id)] ?? 0
  if (progress.campaignRevealed.includes(challenge.id)) return 1
  return hints === 0 ? 3 : hints <= 3 ? 2 : 1
}

function xpFor(progress: ProgressState) {
  return campaignChapters.flatMap((item) => item.challenges).reduce((total, item) => {
    if (!progress.campaignCompleted.includes(item.id)) return total
    return total + 40 + item.level * 10 + starsFor(item, progress) * 5
  }, 0)
}

function rankFor(xp: number) {
  if (xp >= 3500) return 'SQL Specialist'
  if (xp >= 2000) return 'Lead Investigator'
  if (xp >= 900) return 'Data Investigator'
  return 'Field Analyst'
}

function chapterProgress(chapter: CampaignChapter, progress: ProgressState) {
  return chapter.challenges.filter((item) => progress.campaignCompleted.includes(item.id)).length
}

function Stars({ count }: { count: number }) {
  return <span className="campaign-stars" aria-label={`${count} of 3 stars`}>
    {[1, 2, 3].map((star) => <Sparkles key={star} size={13} className={star <= count ? 'earned' : ''} />)}
  </span>
}

function CampaignHub({ progress, onNavigate, onHome }: Pick<Props, 'progress' | 'onNavigate' | 'onHome'>) {
  const completed = progress.campaignCompleted.length
  const xp = xpFor(progress)
  const totalStars = campaignChapters.flatMap((item) => item.challenges).reduce((sum, item) => sum + starsFor(item, progress), 0)
  const nextChapter = campaignChapters.find((item) => chapterProgress(item, progress) < item.challenges.length) ?? campaignChapters[0]
  const nextMission = nextChapter.challenges.find((item) => !progress.campaignCompleted.includes(item.id)) ?? nextChapter.challenges[0]

  return <div className="campaign-page">
    <header className="topbar campaign-topbar">
      <button className="campaign-home-link" onClick={onHome}><ArrowLeft size={15} /> Dashboard</button>
      <div className="campaign-wordmark"><Trophy size={16} /> SQL OPS <span>CAMPAIGN</span></div>
      <div className="campaign-xp"><Sparkles size={14} /> {xp} XP</div>
    </header>

    <div className="campaign-hub-content">
      <section className="campaign-hero">
        <div>
          <div className="eyebrow"><span>DATA INVESTIGATION CAMPAIGN</span><i /></div>
          <h1>Every dataset<br /><em>has a story.</em></h1>
          <p>Take each case from first question to final finding. Inspect the evidence, write real SQL, and learn from every attempt without timers or lives.</p>
          <div className="campaign-hero-actions">
            <button className="button campaign-primary" onClick={() => onNavigate(nextChapter.id, nextMission.id)}>
              <Play size={16} fill="currentColor" /> Continue investigation <ArrowRight size={16} />
            </button>
            <button className="button campaign-topic-jump" onClick={() => onNavigate('routine-workshop', 'routines-1')}>
              <Code2 size={16} /> Practice stored procedures <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="campaign-dossier">
          <div className="dossier-stamp">FIELD DOSSIER</div>
          <div className="dossier-grid">
            <div><strong>{completed}</strong><span>missions cleared</span></div>
            <div><strong>{xp}</strong><span>experience points</span></div>
            <div><strong>{totalStars}</strong><span>stars earned</span></div>
            <div><strong>{campaignMissionCount}</strong><span>total missions</span></div>
          </div>
          <div className="dossier-progress"><span style={{ width: `${completed / campaignMissionCount * 100}%` }} /></div>
          <p>Hints are tools, not penalties. Stars reflect how independently you solved a case; every correct solution advances the campaign.</p>
        </div>
      </section>

      <section className="case-board">
        <div className="section-heading">
          <div><div className="eyebrow"><span>CASE BOARD</span><i /></div><h2>Choose your investigation</h2></div>
          <span className="case-board-note">5 missions per concept · difficulty rises left to right</span>
        </div>
        <div className="case-grid">
          {campaignChapters.map((item) => {
            const Icon = chapterIcons[item.icon as keyof typeof chapterIcons] ?? Database
            const done = chapterProgress(item, progress)
            const chapterStars = item.challenges.reduce((sum, challenge) => sum + starsFor(challenge, progress), 0)
            return <button key={item.id} className={`case-card ${done === 5 ? 'complete' : ''}`} style={{ '--case-accent': item.accent } as React.CSSProperties} onClick={() => onNavigate(item.id, item.challenges[Math.min(done, 4)].id)}>
              <div className="case-file-tab">CASE {item.number}</div>
              <div className="case-card-head"><span><Icon size={19} /></span><em>{done}/5 cleared</em></div>
              <small>{item.setting}</small>
              <h3>{item.title}</h3>
              <strong>{item.concept}</strong>
              <p>{item.synopsis}</p>
              <div className="case-concepts" aria-label={`Concepts covered: ${item.concepts.join(', ')}`}>
                {item.concepts.map((concept) => <span key={concept}>{concept}</span>)}
              </div>
              <div className="case-mission-dots">
                {item.challenges.map((challenge) => <i key={challenge.id} className={progress.campaignCompleted.includes(challenge.id) ? 'done' : progress.campaignOutcomes[challenge.id] === 'failed' ? 'failed' : ''}>{challenge.level}</i>)}
              </div>
              <footer><span><Sparkles size={13} /> {chapterStars}/15 stars</span><ChevronRight size={17} /></footer>
            </button>
          })}
        </div>
      </section>
    </div>
  </div>
}

function EvidenceLocker({ chapter, selected, onSelect }: { chapter: CampaignChapter; selected: string | null; onSelect: (name: string | null) => void }) {
  const table = chapter.tables.find((item) => item.name === selected)
  return <section className="evidence-locker">
    <div className="evidence-heading">
      <div><Database size={16} /><span>EVIDENCE LOCKER</span><small>Click a table to inspect its columns and source rows.</small></div>
      <span>{chapter.tables.length} table{chapter.tables.length === 1 ? '' : 's'}</span>
    </div>
    <div className="evidence-tabs">
      {chapter.tables.map((item) => <button key={item.name} className={selected === item.name ? 'active' : ''} onClick={() => onSelect(selected === item.name ? null : item.name)}><Table2 size={14} /><strong>{item.name}</strong><small>{item.rows.length} rows</small></button>)}
    </div>
    {table && <div className="evidence-viewer">
      <div className="evidence-viewer-head"><div><strong>{table.name}</strong><p>{table.description}</p></div><button onClick={() => onSelect(null)} aria-label="Close table"><X size={16} /></button></div>
      <div className="column-dictionary">
        {table.columns.map((column) => <div key={column.name}><code>{column.name}</code><span>{column.type}</span><p>{column.meaning}</p></div>)}
      </div>
      <div className="evidence-table-scroll">
        {table.rows.length ? <table><thead><tr>{table.columns.map((column) => <th key={column.name}>{column.name}</th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, cellIndex) => <td key={cellIndex} className={value === null ? 'null' : ''}>{value === null ? 'NULL' : String(value)}</td>)}</tr>)}</tbody></table> : <div className="empty-evidence">This table starts empty. Your SQL or a trigger will populate it.</div>}
      </div>
    </div>}
  </section>
}

function ResultTable({ result }: { result: QueryResult | null }) {
  if (!result) return <div className="campaign-empty-result"><Code2 size={18} /><p>Run your query to inspect the result and grade the mission.</p></div>
  if (!result.columns.length) return <div className="campaign-empty-result"><Database size={18} /><p>Statement completed, but the final statement did not return a result set.</p></div>
  return <div className="campaign-result-scroll"><table><thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{result.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value: SqlValue, columnIndex) => <td key={columnIndex} className={value === null ? 'null' : ''}>{value === null ? 'NULL' : String(value)}</td>)}</tr>)}</tbody></table></div>
}

function CampaignWorkspace({ chapter, initialMissionId, progress, theme, onProgress, onNavigate }: { chapter: CampaignChapter; initialMissionId?: string } & Pick<Props, 'progress' | 'theme' | 'onProgress' | 'onNavigate'>) {
  const initialChallenge = getCampaignChallenge(chapter, initialMissionId)
  const challenge = initialChallenge
  const [draft, setDraft] = useState(progress.drafts[missionKey(initialChallenge.id)] ?? initialChallenge.starterSql)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [validation, setValidation] = useState<Validation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const { ready, run, reset } = useSqlEngine(chapter.setupSql)
  const Icon = chapterIcons[chapter.icon as keyof typeof chapterIcons] ?? Database
  const key = missionKey(challenge.id)
  const hintCount = progress.hints[key] ?? 0
  const revealed = progress.campaignRevealed.includes(challenge.id)
  const passed = progress.campaignCompleted.includes(challenge.id)
  const index = chapter.challenges.findIndex((item) => item.id === challenge.id)
  const nextChallenge = chapter.challenges[index + 1]
  const chapterDone = chapterProgress(chapter, progress)
  const definitionMode = challenge.validationMode === 'definition'

  const setMission = (item: CampaignChallenge) => onNavigate(chapter.id, item.id)

  const updateDraft = (value: string) => {
    setDraft(value)
    onProgress((current) => ({ ...current, drafts: { ...current.drafts, [key]: value }, lastCampaignChapter: chapter.id }))
  }

  const runQuery = async () => {
    if ((!ready && !definitionMode) || running) return
    setRunning(true)
    setError(null)
    setValidation(null)
    setResult(null)
    try {
      let nextResult: QueryResult
      let verdict: Validation
      if (definitionMode) {
        const normalizedDraft = draft.toUpperCase().replace(/\s+/g, ' ')
        const missingTerm = challenge.requiredTerms?.find((term) => !normalizedDraft.includes(term.toUpperCase()))
        const passedDefinition = !missingTerm
        nextResult = {
          columns: ['definition_check'],
          rows: [[passedDefinition ? 'Routine structure accepted' : `Missing: ${missingTerm}`]],
          duration: 0,
          affectedRows: 0,
        }
        verdict = passedDefinition
          ? { passed: true, title: 'Routine accepted', message: 'Your definition includes the required routine structure for this mission.' }
          : { passed: false, title: 'Check the routine structure', message: `Add or correct ${missingTerm}. Use the hints to identify where it belongs.` }
      } else {
        await reset()
        nextResult = await run(draft)
        verdict = validateResult(draft, nextResult, challenge)
      }
      setResult(nextResult)
      setValidation(verdict)
      onProgress((current) => ({
        ...current,
        attempts: { ...current.attempts, [key]: (current.attempts[key] ?? 0) + 1 },
        drafts: { ...current.drafts, [key]: draft },
        campaignOutcomes: { ...current.campaignOutcomes, [challenge.id]: verdict.passed ? 'passed' : 'failed' },
        campaignCompleted: verdict.passed && !current.campaignCompleted.includes(challenge.id) ? [...current.campaignCompleted, challenge.id] : current.campaignCompleted,
        lastCampaignChapter: chapter.id,
      }))
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'The query could not be executed.'
      setError(message)
      onProgress((current) => ({
        ...current,
        attempts: { ...current.attempts, [key]: (current.attempts[key] ?? 0) + 1 },
        campaignOutcomes: { ...current.campaignOutcomes, [challenge.id]: 'failed' },
        lastCampaignChapter: chapter.id,
      }))
    } finally {
      setRunning(false)
    }
  }

  const requestHelp = () => {
    if (hintCount < 5) {
      onProgress((current) => ({ ...current, hints: { ...current.hints, [key]: Math.min(5, (current.hints[key] ?? 0) + 1) } }))
      return
    }
    onProgress((current) => ({ ...current, campaignRevealed: current.campaignRevealed.includes(challenge.id) ? current.campaignRevealed : [...current.campaignRevealed, challenge.id] }))
  }

  return <div className="campaign-workspace">
    <aside className="campaign-sidebar">
      <button className="campaign-board-link" onClick={() => onNavigate()}><ArrowLeft size={15} /> Case board</button>
      <div className="campaign-agent-card"><Trophy size={21} /><div><small>FIELD RANK · {xpFor(progress)} XP</small><strong>{rankFor(xpFor(progress))}</strong></div></div>
      <div className="campaign-sidebar-label">ACTIVE CASES</div>
      <nav>
        {campaignChapters.map((item) => {
          const ItemIcon = chapterIcons[item.icon as keyof typeof chapterIcons] ?? Database
          const done = chapterProgress(item, progress)
          return <button key={item.id} className={`${item.id === chapter.id ? 'active' : ''} ${done === 5 ? 'complete' : ''}`} onClick={() => onNavigate(item.id, item.challenges[Math.min(done, 4)].id)}>
            <span><ItemIcon size={14} /></span><div><small>CASE {item.number}</small><strong>{item.title}</strong><em>{done}/5 missions</em></div>{done === 5 ? <Check size={14} /> : <ChevronRight size={14} />}
          </button>
        })}
      </nav>
    </aside>

    <main className="campaign-mission">
      <header className="campaign-mission-topbar">
        <div><Icon size={18} /><span>CASE {chapter.number}</span><strong>{chapter.title}</strong></div>
        <div><span>{chapterDone}/5 cleared</span><strong>{xpFor(progress)} XP</strong></div>
      </header>

      <div className="mission-content">
        <div className="mission-breadcrumb">{chapter.setting} <ChevronRight size={13} /> Mission {challenge.level} of 5</div>
        <section className="mission-briefing">
          <div className="mission-level">LEVEL {challenge.level}<span>{['Orientation','Field work','Analysis','Investigation','Capstone'][challenge.level - 1]}</span></div>
          <div><small>{challenge.prompt}</small><h1>{challenge.title}</h1><p>{challenge.briefing}</p></div>
          {passed && <div className="mission-cleared"><Check size={17} /> CLEARED <Stars count={starsFor(challenge, progress)} /></div>}
        </section>

        <div className="mission-track" aria-label="Mission progression">
          {chapter.challenges.map((item) => {
            const complete = progress.campaignCompleted.includes(item.id)
            const outcome = complete ? 'passed' : progress.campaignOutcomes[item.id]
            return <button key={item.id} className={`${item.id === challenge.id ? 'active' : ''} ${outcome === 'passed' ? 'passed' : outcome === 'failed' ? 'failed' : ''}`} onClick={() => setMission(item)}>
              <span>{complete ? <Check size={13} /> : item.level}</span><div><small>MISSION {item.level}</small><strong>{item.title}</strong></div>
            </button>
          })}
        </div>

        <section className="mission-objective">
          <div><span>YOUR OBJECTIVE</span><p>{challenge.task}</p></div>
          <div className="mission-skills">{challenge.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        </section>

        <EvidenceLocker chapter={chapter} selected={selectedTable} onSelect={setSelectedTable} />

        <section className="campaign-sql-workbench">
          <div className="campaign-editor-head"><span><Code2 size={15} /> MISSION QUERY <i>{definitionMode ? 'Routine definition · structure checked' : 'SQLite · reset before every run'}</i></span><button onClick={() => updateDraft(challenge.starterSql)}><RotateCcw size={13} /> Reset draft</button></div>
          <CodeMirror value={draft} height="270px" theme={theme} extensions={[sql({ dialect: SQLite })]} onChange={updateDraft} basicSetup={{ foldGutter: false, dropCursor: false, allowMultipleSelections: false, indentOnInput: true }} />
          <div className="campaign-editor-actions"><span>{progress.attempts[key] ?? 0} attempt{(progress.attempts[key] ?? 0) === 1 ? '' : 's'} · {definitionMode ? 'definition checked safely' : 'database resets safely'}</span><button className="button run" onClick={runQuery} disabled={(!ready && !definitionMode) || running}>{running ? <LoaderCircle className="spin" size={15} /> : <Play size={14} fill="currentColor" />}{running ? 'Checking…' : definitionMode ? 'Check definition' : ready ? 'Run & check' : 'Loading SQLite…'}</button></div>
        </section>

        <section className="campaign-results">
          <div className="campaign-results-head"><span><Table2 size={14} /> {definitionMode ? 'DEFINITION CHECK' : 'QUERY RESULT'}</span>{result && <small>{definitionMode ? 'required structure' : `${result.rows.length} row${result.rows.length === 1 ? '' : 's'} · ${result.duration.toFixed(1)} ms`}</small>}</div>
          {error ? <div className="campaign-query-error"><AlertTriangle size={18} /><div><strong>SQLite could not run this query</strong><pre>{error}</pre></div></div> : <ResultTable result={result} />}
        </section>

        {validation && <div className={`campaign-validation ${validation.passed ? 'passed' : 'failed'}`}>
          <span>{validation.passed ? <Check size={17} /> : <AlertTriangle size={17} />}</span><div><strong>{validation.title}</strong><p>{validation.message}</p></div>
          {validation.passed && nextChallenge && <button onClick={() => setMission(nextChallenge)}>Next mission <ArrowRight size={14} /></button>}
        </div>}

        <section className="campaign-help">
          <div className="campaign-help-head"><div><Lightbulb size={16} /><span>FIELD SUPPORT</span><small>{hintCount}/5 hints opened</small></div><button onClick={requestHelp} disabled={revealed || passed}>
            {hintCount < 5 ? <><HelpCircle size={14} /> Open subtle hint {hintCount + 1}</> : <><Eye size={14} /> Reveal answer + explanation</>}
          </button></div>
          {hintCount === 0 && !revealed && <p className="help-empty">Hints move from the underlying idea toward the query structure. Open only what helps you move again.</p>}
          {hintCount > 0 && <div className="campaign-hints">{challenge.hints.slice(0, hintCount).map((hint, hintIndex) => <div key={hint}><span>{hintIndex + 1}</span><p>{hint}</p></div>)}</div>}
        </section>

        {(revealed || passed) && <section className="campaign-debrief">
          <div className="debrief-head"><div><ShieldCheck size={19} /><span>{passed ? 'AFTER-ACTION DEBRIEF' : 'ANSWER REVEALED'}</span></div><button onClick={() => updateDraft(challenge.solutionSql)}><Clipboard size={13} /> Load answer into editor</button></div>
          <h2>Why this solution works</h2>
          <p>{challenge.explanation.summary}</p>
          <div className="debrief-grid">
            <pre><code>{challenge.solutionSql}</code></pre>
            <ol>{challenge.explanation.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </div>
          <div className="debrief-takeaway"><Sparkles size={15} /><div><strong>TRANSFERABLE IDEA</strong><p>{challenge.explanation.takeaway}</p></div></div>
        </section>}

        <footer className="campaign-mission-footer">
          <button disabled={index === 0} onClick={() => setMission(chapter.challenges[index - 1])}><ArrowLeft size={14} /> Previous mission</button>
          <span>Case {chapter.number} · {chapter.concept}</span>
          {nextChallenge ? <button onClick={() => setMission(nextChallenge)}>Next mission <ArrowRight size={14} /></button> : <button onClick={() => onNavigate()}>Return to case board <Trophy size={14} /></button>}
        </footer>
      </div>
    </main>
  </div>
}

export function Campaign({ chapterId, missionId, progress, theme, onProgress, onNavigate, onHome }: Props) {
  if (!chapterId) return <CampaignHub progress={progress} onNavigate={onNavigate} onHome={onHome} />
  const chapter = getCampaignChapter(chapterId)
  return <CampaignWorkspace key={`${chapter.id}:${missionId ?? 'first'}`} chapter={chapter} initialMissionId={missionId} progress={progress} theme={theme} onProgress={onProgress} onNavigate={onNavigate} />
}
