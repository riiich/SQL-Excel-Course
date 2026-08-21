import { useEffect, useMemo, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql, SQLite } from '@codemirror/lang-sql'
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, Circle,
  Clock3, Code2, Columns3, Database, FlaskConical, Lightbulb, LoaderCircle, Play, RefreshCw,
  RotateCcw, Table2, Terminal, X,
} from 'lucide-react'
import { getNextLesson } from '../data/curriculum'
import { getDeepDive } from '../data/deepDives'
import { exerciseProgressKey, getLabExercises } from '../data/labExercises'
import { useSqlEngine } from '../hooks/useSqlEngine'
import { validateResult, type Validation } from '../lib/validate'
import type { CurriculumModule, Lesson, ProgressState, QueryResult, SchemaItem } from '../types'

interface Props {
  lesson: Lesson
  initialStage: 'lesson' | 'lab'
  curriculum: CurriculumModule[]
  progress: ProgressState
  theme: 'dark' | 'light'
  onProgress: (update: Partial<ProgressState> | ((current: ProgressState) => ProgressState)) => void
  onNavigate: (lessonId: string, stage?: 'lesson' | 'lab') => void
  onHome: () => void
  labsOnly?: boolean
}

function friendlyError(raw: string) {
  if (/syntax error/i.test(raw)) return `SQLite found a syntax error. Check the clause immediately before the reported token.\n\n${raw}`
  if (/no such column/i.test(raw)) return `That column is not present at this point in the query. Check aliases and the schema.\n\n${raw}`
  if (/ambiguous column/i.test(raw)) return `More than one table has that column. Qualify it with a table alias.\n\n${raw}`
  if (/constraint failed/i.test(raw)) return `A database constraint rejected this change. Recheck keys, nullability, or CHECK rules.\n\n${raw}`
  return raw
}

function SchemaTable({ item }: { item: SchemaItem }) {
  const [open, setOpen] = useState(false)
  const columns = useMemo(() => {
    const body = item.sql.match(/\((.*)\)/s)?.[1] ?? ''
    return body.split(',').map((part) => part.trim().split(/\s+/)[0]?.replace(/["`[\]]/g, '')).filter(Boolean)
  }, [item.sql])
  return (
    <div className="schema-table">
      <button onClick={() => setOpen(!open)}><span><Table2 size={14} />{item.name}</span><ChevronDown size={14} className={open ? 'rotated' : ''} /></button>
      {open && <div className="schema-columns">{columns.map((column) => <span key={column}><Columns3 size={11} />{column}</span>)}</div>}
    </div>
  )
}

export function LessonWorkspace({ lesson, initialStage, curriculum, progress, theme, onProgress, onNavigate, onHome, labsOnly = false }: Props) {
  const labExercises = useMemo(() => getLabExercises(lesson), [lesson])
  const deepDive = useMemo(() => getDeepDive(lesson.id), [lesson.id])
  const [stage, setStage] = useState<'lesson' | 'lab'>(labsOnly ? 'lab' : initialStage)
  const [activeExercise, setActiveExercise] = useState(0)
  const exercise = labExercises[activeExercise]
  const exerciseKey = exerciseProgressKey(lesson.id, activeExercise)
  const [draft, setDraft] = useState(progress.drafts[exerciseKey] ?? exercise.starterSql)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [validation, setValidation] = useState<Validation | null>(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [schemaOpen, setSchemaOpen] = useState(true)
  const [mobileCurriculum, setMobileCurriculum] = useState(false)
  const { ready, run, reset, schema, restart } = useSqlEngine(exercise.setupSql)
  const hintCount = progress.hints[exerciseKey] ?? 0
  const completedLabCount = labExercises.filter((_, index) => progress.completedExercises.includes(exerciseProgressKey(lesson.id, index))).length
  const isExerciseComplete = progress.completedExercises.includes(exerciseKey)
  const nextLesson = getNextLesson(lesson.id)

  useEffect(() => {
    onProgress((current) => ({ ...current, lastLesson: lesson.id }))
  }, [lesson.id, onProgress])

  useEffect(() => setStage(labsOnly ? 'lab' : initialStage), [initialStage, labsOnly])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void handleRun()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const updateDraft = (value: string) => {
    setDraft(value)
    onProgress((current) => ({ ...current, drafts: { ...current.drafts, [exerciseKey]: value } }))
  }

  const selectExercise = (index: number) => {
    const nextKey = exerciseProgressKey(lesson.id, index)
    setActiveExercise(index)
    setDraft(progress.drafts[nextKey] ?? labExercises[index].starterSql)
    setResult(null)
    setValidation(null)
    setError('')
  }

  const handleRun = async () => {
    if (!ready || running || !draft.trim()) return
    setRunning(true)
    setError('')
    setValidation(null)
    try {
      await reset()
      const queryResult = await run(draft)
      const verdict = validateResult(draft, queryResult, exercise)
      setResult(queryResult)
      setValidation(verdict)
      onProgress((current) => {
        const completedExercises = verdict.passed && !current.completedExercises.includes(exerciseKey)
          ? [...current.completedExercises, exerciseKey]
          : current.completedExercises
        const lessonFinished = labExercises.every((_, index) => completedExercises.includes(exerciseProgressKey(lesson.id, index)))
        const completed = lessonFinished && !current.completed.includes(lesson.id) ? [...current.completed, lesson.id] : current.completed
        return {
          ...current,
          completed,
          completedExercises,
          labOutcomes: { ...current.labOutcomes, [lesson.id]: verdict.passed ? 'passed' : 'failed' },
          attempts: { ...current.attempts, [exerciseKey]: (current.attempts[exerciseKey] ?? 0) + 1 },
          drafts: { ...current.drafts, [exerciseKey]: draft },
          lastLesson: lesson.id,
        }
      })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'The query could not be executed.'
      setError(friendlyError(message))
      setResult(null)
      if (/stopped after/i.test(message)) void restart().catch(() => undefined)
      onProgress((current) => ({
        ...current,
        labOutcomes: { ...current.labOutcomes, [lesson.id]: 'failed' },
        attempts: { ...current.attempts, [exerciseKey]: (current.attempts[exerciseKey] ?? 0) + 1 },
      }))
    } finally {
      setRunning(false)
    }
  }

  const revealHint = () => {
    if (hintCount >= exercise.hints.length) return
    onProgress((current) => ({ ...current, hints: { ...current.hints, [exerciseKey]: hintCount + 1 } }))
  }

  const resetDraft = async () => {
    updateDraft(exercise.starterSql)
    setResult(null)
    setValidation(null)
    setError('')
    await reset()
  }

  const showSolution = () => updateDraft(exercise.solutionSql)

  const openLab = () => {
    const firstIncomplete = labExercises.findIndex((_, index) => !progress.completedExercises.includes(exerciseProgressKey(lesson.id, index)))
    selectExercise(firstIncomplete === -1 ? 0 : firstIncomplete)
    setStage('lab')
    onNavigate(lesson.id, 'lab')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openLesson = () => {
    setStage('lesson')
    onNavigate(lesson.id, 'lesson')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const advanceAfterPass = () => {
    if (activeExercise < labExercises.length - 1) {
      selectExercise(activeExercise + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (nextLesson) {
      onNavigate(nextLesson.id)
    }
  }

  return (
    <div className="lesson-shell">
      <aside className={`curriculum-panel ${mobileCurriculum ? 'mobile-open' : ''}`}>
        <div className="curriculum-header">
          <button className="mini-wordmark" onClick={onHome}>{'{'}Q{'}'}<span>QUERYCRAFT</span></button>
          <button className="mobile-close" onClick={() => setMobileCurriculum(false)}><X size={18} /></button>
        </div>
        <div className="curriculum-title"><span>{labsOnly ? 'SQL LABS' : 'CURRICULUM'}</span><small>{labsOnly ? `${progress.completedExercises.length} questions passed` : `${progress.completed.length} / ${curriculum.length} mastered`}</small></div>
        <div className="curriculum-list">
          {curriculum.map((module) => {
            const item = module.lessons[0]
            const itemExercises = getLabExercises(item)
            const passedQuestions = itemExercises.filter((_, index) => progress.completedExercises.includes(exerciseProgressKey(item.id, index))).length
            const complete = progress.completed.includes(item.id)
            const labOutcome = passedQuestions === itemExercises.length ? 'passed' : progress.labOutcomes[item.id]
            const lessonActive = item.id === lesson.id && stage === 'lesson'
            const labActive = item.id === lesson.id && stage === 'lab'
            return (
              <div className="curriculum-group" key={module.id}>
                {!labsOnly && <button className={`curriculum-item ${lessonActive ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={() => { if (item.id === lesson.id) openLesson(); else onNavigate(item.id, 'lesson'); setMobileCurriculum(false) }}>
                  <span className="curriculum-marker">{complete ? <Check size={12} /> : lessonActive ? <span className="pulse-dot" /> : <Circle size={9} />}</span>
                  <span className="curriculum-copy"><small>{item.number.replace(/^0/, '')}</small><strong>{module.title}</strong><em>{item.title}</em></span>
                  {lessonActive && <ChevronRight size={14} />}
                </button>}
                <button className={`curriculum-item lab-link ${labActive ? 'active' : ''} ${passedQuestions === itemExercises.length ? 'complete' : ''} ${labOutcome === 'passed' ? 'lab-passed' : labOutcome === 'failed' ? 'lab-failed' : ''}`} onClick={() => { if (item.id === lesson.id) openLab(); else onNavigate(item.id, 'lab'); setMobileCurriculum(false) }}>
                  <span className="curriculum-marker">{passedQuestions === itemExercises.length ? <Check size={12} /> : <FlaskConical size={13} />}</span>
                  <span className="curriculum-copy lab-copy">
                    <strong>{item.number.replace(/^0/, '')} -- {labsOnly ? item.title : 'SQL LAB'}</strong>
                    <em>
                      {labOutcome === 'failed'
                        ? `Latest attempt needs work · ${passedQuestions} / ${itemExercises.length} passed`
                        : `${passedQuestions} / ${itemExercises.length} questions passed`}
                    </em>
                  </span>
                  {labActive && <ChevronRight size={14} />}
                </button>
              </div>
            )
          })}
        </div>
        <div className="curriculum-foot"><span><Database size={13} /> SQLite / in-browser</span><i className={ready ? 'online' : ''} /></div>
      </aside>

      <section className="lesson-main">
        <header className="lesson-topbar">
          <div>
            <button className="mobile-curriculum-button" onClick={() => setMobileCurriculum(true)}><BookOpen size={17} /> {labsOnly ? 'SQL Labs' : 'Path'}</button>
            <button onClick={onHome}>{labsOnly ? 'SQL Labs' : 'Curriculum'}</button><ChevronRight size={12} /><span>{labsOnly ? 'Practice' : `Module ${lesson.number.split('.')[0]}`}</span><ChevronRight size={12} /><strong>{lesson.title}</strong>
          </div>
          <div className="lesson-meta">
            {labsOnly ? <div className="lab-only-label"><FlaskConical size={14} /> SQL LABS ONLY</div> : <div className="stage-switcher" aria-label="Lesson progress">
              <button className={stage === 'lesson' ? 'active' : ''} onClick={openLesson}><span>1</span> Learn</button>
              <i />
              <button className={stage === 'lab' ? 'active' : ''} onClick={openLab}><span>2</span> Lab</button>
            </div>}
            <span className={`difficulty ${lesson.difficulty.toLowerCase()}`}>{lesson.difficulty}</span><span><Clock3 size={13} /> {lesson.duration} min</span>
          </div>
        </header>

        <div className={`lesson-columns ${stage === 'lesson' ? 'lesson-only' : 'lab-only'}`}>
          {stage === 'lesson' && (
          <article className="lesson-content">
            <div className="lesson-intro">
              <div className="eyebrow"><span>{lesson.eyebrow}</span><i /></div>
              <div className="lesson-number">{lesson.number}</div>
              <h1>{lesson.title}</h1>
              <p>{lesson.summary}</p>
              <div className="concept-pills">{lesson.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div>
            </div>

            <section className="lesson-section">
              <h2><span>01</span> Concept</h2>
              <ul className="idea-list">{lesson.keyIdeas.map((idea) => <li key={idea}><i />{idea}</li>)}</ul>
            </section>

            <section className="lesson-section mechanics-section">
              <h2><span>02</span> How the mechanics work</h2>
              <p className="section-overview">{deepDive.overview}</p>
              <div className="mechanics-list">
                {deepDive.mechanics.map((mechanic, index) => (
                  <article className="mechanic-card" key={`${mechanic.part}-${mechanic.title}`}>
                    <div className="mechanic-index">{String(index + 1).padStart(2, '0')}</div>
                    <div className="mechanic-copy">
                      <code>{mechanic.part}</code>
                      <h3>{mechanic.title}</h3>
                      <p>{mechanic.explanation}</p>
                      <aside><strong>Why it’s used</strong><span>{mechanic.why}</span></aside>
                      <pre>{mechanic.example}</pre>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="lesson-section real-world-section">
              <h2><span>03</span> Real-world examples</h2>
              <div className="real-world-grid">
                {lesson.realWorldExamples.map((example) => (
                  <article className="real-world-card" key={example.title}>
                    <div className="real-world-context">{example.context}</div>
                    <h3>{example.title}</h3>
                    <div className="example-purpose"><strong>Purpose</strong><p>{example.purpose}</p></div>
                    <div className="example-query"><div><span>IN PRACTICE</span><button onClick={() => navigator.clipboard?.writeText(example.code)}>copy</button></div><pre>{example.code}</pre></div>
                  </article>
                ))}
              </div>
            </section>

            <section className="lesson-section">
              <h2><span>04</span> Core pattern</h2>
              <div className="code-example">
                <div><span>pattern.sql</span><button onClick={() => navigator.clipboard?.writeText(lesson.syntax)}>copy</button></div>
                <pre>{lesson.syntax}</pre>
              </div>
            </section>

            <aside className="pro-tip"><Lightbulb size={17} /><div><strong>Field note</strong><p>{lesson.proTip}</p></div></aside>

            <section className="lesson-section uses-section">
              <h2><span>05</span> Ways you can use it</h2>
              <div className="use-case-grid">
                {deepDive.useCases.map((useCase) => <article key={useCase.title}><h3>{useCase.title}</h3><p>{useCase.description}</p></article>)}
              </div>
              <aside className="pitfalls-panel">
                <div><X size={15} /><strong>Common mistakes</strong></div>
                <ul>{deepDive.pitfalls.map((pitfall) => <li key={pitfall}>{pitfall}</li>)}</ul>
              </aside>
            </section>

            {deepDive.reference && (
              <section className="lesson-section reference-section">
                <h2><span>06</span> {deepDive.referenceTitle}</h2>
                <p className="section-overview">{deepDive.referenceIntro}</p>
                <div className="reference-grid">
                  {deepDive.reference.map((item) => (
                    <article className="reference-card" key={`${item.category}-${item.name}`}>
                      <div><span>{item.category}</span><code>{item.name}</code></div>
                      <p>{item.purpose}</p>
                      <pre>{item.example}</pre>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="lesson-section objectives">
              <h2><span>{deepDive.reference ? '07' : '06'}</span> You’ll be able to</h2>
              {lesson.objectives.map((objective) => <div key={objective}><Check size={13} />{objective}</div>)}
            </section>

            <section className="lab-bridge">
              <div className="lab-bridge-icon"><Terminal size={22} /></div>
              <div>
                <span>CONCEPTS LOADED</span>
                <h2>Put the idea to work.</h2>
                <p>The lab gives you a real dataset, schema, SQL editor, graded results, and progressive hints.</p>
              </div>
              <button className="button primary" onClick={openLab}>
                Start lab <ArrowRight size={15} />
              </button>
            </section>
          </article>
          )}

          {stage === 'lab' && (
          <section className="lab-panel">
            {!labsOnly && <button className="back-to-lesson" onClick={openLesson}><ArrowLeft size={13} /> Review lesson</button>}
            <div className="lab-heading">
              <div><span className="lab-step">QUESTION {activeExercise + 1} OF {labExercises.length}</span><h2>{exercise.prompt}</h2></div>
              {isExerciseComplete && <span className="complete-badge"><Check size={13} /> solved</span>}
            </div>
            <p className="task-copy">{exercise.task}</p>

            <div className="lab-question-nav" aria-label="Lab questions">
              {labExercises.map((item, index) => {
                const complete = progress.completedExercises.includes(exerciseProgressKey(lesson.id, index))
                return <button key={item.prompt} className={`${index === activeExercise ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={() => selectExercise(index)}><span>{complete ? <Check size={12} /> : index + 1}</span><div><small>{index === 0 ? 'Warm-up' : index === 1 ? 'Core mission' : 'Extension'}</small><strong>{item.prompt.replace(/^(Warm-up|Extension):\s*/, '')}</strong></div></button>
              })}
              <div className="lab-progress"><strong>{completedLabCount}/{labExercises.length}</strong><span>passed</span></div>
            </div>

            <div className="schema-section">
              <button onClick={() => setSchemaOpen(!schemaOpen)}><span><Database size={14} /> Dataset schema</span><ChevronDown size={14} className={schemaOpen ? 'rotated' : ''} /></button>
              {schemaOpen && <div className="schema-list">{schema.map((item) => <SchemaTable item={item} key={item.name} />)}</div>}
            </div>

            <div className="editor-wrap">
              <div className="editor-toolbar">
                <span><Code2 size={13} /> query.sql <i>{progress.drafts[exerciseKey] ? 'draft saved' : 'starter'}</i></span>
                <button onClick={resetDraft} title="Reset query"><RotateCcw size={13} /> Reset</button>
              </div>
              <CodeMirror
                value={draft}
                height="250px"
                extensions={[sql({ dialect: SQLite })]}
                onChange={updateDraft}
                theme={theme}
                basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, autocompletion: true }}
                aria-label="SQL query editor"
              />
              <div className="editor-actions">
                <span><kbd>⌘</kbd> + <kbd>↵</kbd> to run</span>
                <button className="button run" onClick={handleRun} disabled={!ready || running}>
                  {running ? <LoaderCircle size={15} className="spin" /> : <Play size={14} fill="currentColor" />}
                  {running ? 'Running' : 'Run query'}
                </button>
              </div>
            </div>

            <div className="results-panel">
              <div className="results-heading">
                <span><Terminal size={13} /> Result</span>
                {result && <small>{result.rows.length} row{result.rows.length === 1 ? '' : 's'} · {result.duration.toFixed(1)} ms</small>}
              </div>
              {!result && !error ? <div className="empty-result"><Play size={18} /><p>Run your query to inspect the result.</p></div> : null}
              {error && <div className="query-error"><X size={16} /><pre>{error}</pre></div>}
              {result && <div className="table-scroll"><table><thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{result.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, cellIndex) => <td key={cellIndex} className={value === null ? 'null' : ''}>{value === null ? 'NULL' : String(value)}</td>)}</tr>)}</tbody></table></div>}
            </div>

            {validation && <div className={`validation ${validation.passed ? 'passed' : 'failed'}`}>
              <div className="validation-icon">{validation.passed ? <Check size={18} /> : <RefreshCw size={17} />}</div>
              <div><strong>{validation.title}</strong><p>{validation.message}</p></div>
              {validation.passed && (activeExercise < labExercises.length - 1 || nextLesson) && <button onClick={advanceAfterPass}>{activeExercise < labExercises.length - 1 ? 'Next question' : 'Next lesson'} <ArrowRight size={14} /></button>}
            </div>}

            <div className="help-row">
              <div className="hint-stack">
                {exercise.hints.slice(0, hintCount).map((hint, index) => <div className="hint" key={hint}><span>{index + 1}</span><p>{hint}</p></div>)}
              </div>
              <div className="help-actions">
                <button onClick={revealHint} disabled={hintCount >= exercise.hints.length}><Lightbulb size={14} /> {hintCount ? 'Another hint' : 'Reveal a hint'} <small>{hintCount}/{exercise.hints.length}</small></button>
                <button onClick={showSolution}>Show solution</button>
              </div>
            </div>

            <div className="lesson-nav">
              <button onClick={onHome}><ArrowLeft size={14} /> Back to curriculum</button>
              <span>{progress.attempts[exerciseKey] ?? 0} attempt{(progress.attempts[exerciseKey] ?? 0) === 1 ? '' : 's'} on this question</span>
            </div>
          </section>
          )}
        </div>
      </section>
    </div>
  )
}
