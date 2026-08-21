import { useEffect, useState, type CSSProperties } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql, SQLite } from '@codemirror/lang-sql'
import {
  AlertTriangle, ArrowLeft, ArrowRight, BrainCircuit, Check, ChevronRight,
  Code2, Database, Eye, Flame, HelpCircle, Lightbulb, LoaderCircle, Play,
  RotateCcw, Sparkles, Table2, Trophy,
} from 'lucide-react'
import { challengeModules, challengeQuestionCount, getChallengeQuestion, getChallengeTopic } from '../data/challenges'
import { useSqlEngine } from '../hooks/useSqlEngine'
import { validateResult, type Validation } from '../lib/validate'
import type { ProgressState, QueryResult, SqlValue } from '../types'

interface Props {
  topicId?: string
  questionId?: string
  progress: ProgressState
  theme: 'dark' | 'light'
  onProgress: (update: Partial<ProgressState> | ((current: ProgressState) => ProgressState)) => void
  onNavigate: (topicId: string, questionId?: string) => void
  onHome: () => void
}

const progressKey = (id: string) => `challenge:${id}`

function ResultGrid({ result }: { result: QueryResult | null }) {
  if (!result) return <div className="challenge-empty"><Code2 size={19} /><span>Run your solution to see and grade the result.</span></div>
  if (!result.columns.length) return <div className="challenge-empty"><Database size={19} /><span>The statement ran, but its final statement returned no rows.</span></div>
  return <div className="challenge-result-scroll"><table><thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{result.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value: SqlValue, columnIndex) => <td key={columnIndex} className={value === null ? 'null' : ''}>{value === null ? 'NULL' : String(value)}</td>)}</tr>)}</tbody></table></div>
}

export function ChallengeWorkspace({ topicId, questionId, progress, theme, onProgress, onNavigate, onHome }: Props) {
  const topic = getChallengeTopic(topicId)
  const question = getChallengeQuestion(topic.id, questionId)
  const questionIndex = topic.questions.findIndex((item) => item.id === question.id)
  const key = progressKey(question.id)
  const [draft, setDraft] = useState(progress.drafts[key] ?? question.starterSql)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [validation, setValidation] = useState<Validation | null>(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const { ready, run, reset, schema } = useSqlEngine(question.setupSql)
  const definitionMode = question.validationMode === 'definition'
  const hintCount = progress.hints[key] ?? 0
  const revealed = progress.challengeRevealed.includes(question.id)
  const passed = progress.challengeCompleted.includes(question.id)
  const completedTotal = progress.challengeCompleted.length
  const completedInTopic = topic.questions.filter((item) => progress.challengeCompleted.includes(item.id)).length
  const nextQuestion = topic.questions[questionIndex + 1]

  useEffect(() => {
    onProgress((current) => ({ ...current, lastChallengeTopic: topic.id }))
  }, [onProgress, topic.id])

  const updateDraft = (value: string) => {
    setDraft(value)
    onProgress((current) => ({ ...current, drafts: { ...current.drafts, [key]: value } }))
  }

  const openTopic = (nextTopicId: string) => {
    const nextTopic = getChallengeTopic(nextTopicId)
    const firstIncomplete = nextTopic.questions.find((item) => !progress.challengeCompleted.includes(item.id)) ?? nextTopic.questions[0]
    onNavigate(nextTopic.id, firstIncomplete.id)
  }

  const runChallenge = async () => {
    if (running || (!ready && !definitionMode) || !draft.trim()) return
    setRunning(true)
    setError('')
    setValidation(null)
    setResult(null)
    try {
      let nextResult: QueryResult
      let verdict: Validation
      if (definitionMode) {
        const normalized = draft.toUpperCase().replace(/\s+/g, ' ')
        const missing = question.requiredTerms?.find((term) => !normalized.includes(term.toUpperCase()))
        nextResult = { columns: ['definition_check'], rows: [[missing ? `Missing: ${missing}` : 'Routine structure accepted']], duration: 0, affectedRows: 0 }
        verdict = missing
          ? { passed: false, title: 'Check the routine structure', message: `Add or correct ${missing}.` }
          : { passed: true, title: 'Challenge passed', message: 'Your routine contains the required structure.' }
      } else {
        await reset()
        nextResult = await run(draft)
        verdict = validateResult(draft, nextResult, question)
      }
      setResult(nextResult)
      setValidation(verdict)
      onProgress((current) => ({
        ...current,
        attempts: { ...current.attempts, [key]: (current.attempts[key] ?? 0) + 1 },
        drafts: { ...current.drafts, [key]: draft },
        challengeOutcomes: { ...current.challengeOutcomes, [question.id]: verdict.passed ? 'passed' : 'failed' },
        challengeCompleted: verdict.passed && !current.challengeCompleted.includes(question.id) ? [...current.challengeCompleted, question.id] : current.challengeCompleted,
        lastChallengeTopic: topic.id,
      }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'SQLite could not run this solution.')
      onProgress((current) => ({
        ...current,
        attempts: { ...current.attempts, [key]: (current.attempts[key] ?? 0) + 1 },
        challengeOutcomes: { ...current.challengeOutcomes, [question.id]: 'failed' },
      }))
    } finally {
      setRunning(false)
    }
  }

  const requestHint = () => {
    if (hintCount < question.hints.length) {
      onProgress((current) => ({ ...current, hints: { ...current.hints, [key]: (current.hints[key] ?? 0) + 1 } }))
      return
    }
    onProgress((current) => ({ ...current, challengeRevealed: current.challengeRevealed.includes(question.id) ? current.challengeRevealed : [...current.challengeRevealed, question.id] }))
  }

  return <div className="challenge-shell">
    <aside className="challenge-sidebar">
      <button className="challenge-back" onClick={onHome}><ArrowLeft size={15} /> Dashboard</button>
      <div className="challenge-brand"><BrainCircuit size={22} /><div><small>SQL PRACTICE</small><strong>CHALLENGE YOURSELF</strong></div></div>
      <div className="challenge-total"><div><span>{completedTotal}</span><small>of {challengeQuestionCount} passed</small></div><i><b style={{ width: `${completedTotal / challengeQuestionCount * 100}%` }} /></i></div>
      <nav>
        {challengeModules.map((module) => <section key={module.id} style={{ '--challenge-accent': module.accent } as CSSProperties}>
          <header><span>MODULE {module.index}</span><strong>{module.title}</strong></header>
          {module.topics.map((item) => {
            const done = item.questions.filter((entry) => progress.challengeCompleted.includes(entry.id)).length
            const failed = item.questions.some((entry) => progress.challengeOutcomes[entry.id] === 'failed' && !progress.challengeCompleted.includes(entry.id))
            return <button key={item.id} className={`${item.id === topic.id ? 'active' : ''} ${done === 3 ? 'complete' : ''} ${failed ? 'failed' : ''}`} onClick={() => openTopic(item.id)}>
              <span>{done === 3 ? <Check size={13} /> : item.number}</span><div><strong>{item.title}</strong><small>{done}/3 passed</small></div><ChevronRight size={14} />
            </button>
          })}
        </section>)}
      </nav>
    </aside>

    <main className="challenge-main">
      <header className="challenge-topbar"><div><BrainCircuit size={18} /><span>CHALLENGE YOURSELF</span><strong>{topic.title}</strong></div><div><Trophy size={15} /> {completedTotal}/{challengeQuestionCount}</div></header>
      <div className="challenge-content">
        <div className="challenge-breadcrumb">Module challenge <ChevronRight size={13} /> {topic.number} · {topic.title}</div>
        <section className="challenge-heading">
          <div className={`challenge-difficulty ${question.difficulty.toLowerCase()}`}><Flame size={15} /> {question.difficulty}</div>
          <div><small>{question.mode.toUpperCase()} · QUESTION {questionIndex + 1} OF 3</small><h1>{question.title}</h1><p>{topic.summary}</p></div>
          <div className="challenge-topic-score"><strong>{completedInTopic}/3</strong><span>topic passed</span></div>
        </section>

        <div className="challenge-question-nav">
          {topic.questions.map((item, index) => {
            const complete = progress.challengeCompleted.includes(item.id)
            const failed = progress.challengeOutcomes[item.id] === 'failed' && !complete
            return <button key={item.id} className={`${item.id === question.id ? 'active' : ''} ${complete ? 'complete' : ''} ${failed ? 'failed' : ''}`} onClick={() => onNavigate(topic.id, item.id)}><span>{complete ? <Check size={13} /> : index + 1}</span><div><small>{item.mode} · {item.difficulty}</small><strong>{item.title}</strong></div></button>
          })}
        </div>

        <section className="challenge-objective"><div><span>YOUR CHALLENGE</span><p>{question.task}</p></div><div>{question.skills.map((skill) => <code key={skill}>{skill}</code>)}</div></section>

        {!!schema.length && <section className="challenge-schema"><header><Database size={15} /><span>AVAILABLE TABLES</span></header><div>{schema.filter((item) => item.type === 'table' && !item.name.startsWith('sqlite_')).map((item) => <span key={item.name}><Table2 size={13} />{item.name}</span>)}</div></section>}

        <section className="challenge-editor">
          <div className="challenge-editor-head"><span><Code2 size={15} /> challenge.sql <i>{definitionMode ? 'structure check' : 'SQLite · resets before each run'}</i></span><button onClick={() => updateDraft(question.starterSql)}><RotateCcw size={13} /> Reset</button></div>
          <CodeMirror value={draft} height="300px" theme={theme} extensions={[sql({ dialect: SQLite })]} onChange={updateDraft} basicSetup={{ foldGutter: false, dropCursor: false, allowMultipleSelections: false, indentOnInput: true }} />
          <div className="challenge-editor-actions"><span>{progress.attempts[key] ?? 0} attempt{(progress.attempts[key] ?? 0) === 1 ? '' : 's'}</span><button className="button run" disabled={running || (!ready && !definitionMode)} onClick={runChallenge}>{running ? <LoaderCircle className="spin" size={15} /> : <Play size={14} fill="currentColor" />}{running ? 'Checking…' : definitionMode ? 'Check definition' : 'Run & check'}</button></div>
        </section>

        <section className="challenge-results"><header><span><Table2 size={14} /> {definitionMode ? 'DEFINITION CHECK' : 'QUERY RESULT'}</span>{result && <small>{result.rows.length} row{result.rows.length === 1 ? '' : 's'}</small>}</header>{error ? <div className="challenge-error"><AlertTriangle size={18} /><pre>{error}</pre></div> : <ResultGrid result={result} />}</section>

        {validation && <div className={`challenge-validation ${validation.passed ? 'passed' : 'failed'}`}><span>{validation.passed ? <Check size={17} /> : <AlertTriangle size={17} />}</span><div><strong>{validation.title}</strong><p>{validation.message}</p></div>{validation.passed && nextQuestion && <button onClick={() => onNavigate(topic.id, nextQuestion.id)}>Next challenge <ArrowRight size={14} /></button>}</div>}

        <section className="challenge-help"><header><div><Lightbulb size={16} /><span>CHALLENGE SUPPORT</span><small>{hintCount}/{question.hints.length} hints</small></div><button onClick={requestHint} disabled={revealed || passed}>{hintCount < question.hints.length ? <><HelpCircle size={14} /> Hint {hintCount + 1}</> : <><Eye size={14} /> Reveal answer</>}</button></header>{hintCount > 0 && <div>{question.hints.slice(0, hintCount).map((hint, index) => <p key={hint}><b>{index + 1}</b>{hint}</p>)}</div>}</section>

        {(revealed || passed) && <section className="challenge-answer"><header><span><Sparkles size={16} /> SOLUTION BREAKDOWN</span><button onClick={() => updateDraft(question.solutionSql)}>Load solution</button></header><pre><code>{question.solutionSql}</code></pre><ol>{question.explanation.map((step) => <li key={step}>{step}</li>)}</ol></section>}
      </div>
    </main>
  </div>
}
