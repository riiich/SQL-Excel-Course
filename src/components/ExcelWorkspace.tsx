import { useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, Circle,
  Clipboard, FileSpreadsheet, FlaskConical, Lightbulb, Play, RotateCcw,
  Sigma, Table2, X,
} from 'lucide-react'
import { excelExerciseKey, excelLessons, getNextExcelLesson } from '../data/excelCurriculum'
import type { ExcelFormulaExercise, ExcelLesson, ExcelSheet, ProgressState } from '../types'

interface Props {
  lesson: ExcelLesson
  initialStage: 'lesson' | 'lab'
  progress: ProgressState
  onProgress: (update: Partial<ProgressState> | ((current: ProgressState) => ProgressState)) => void
  onNavigate: (lessonId: string, stage?: 'lesson' | 'lab') => void
  onHome: () => void
}

const normalizeFormula = (value: string) => value.replace(/[\s\n]+/g, '').replace(/[“”]/g, '"').toUpperCase()
const isMatchingFormula = (value: string, exercise: ExcelFormulaExercise) => {
  const possibilities = [exercise.solutionFormula, ...(exercise.acceptedFormulas ?? [])].map(normalizeFormula)
  return possibilities.includes(normalizeFormula(value))
}

function WorkbookViewer({ sheets }: { sheets: ExcelSheet[] }) {
  const [activeName, setActiveName] = useState(sheets[0].name)
  const sheet = sheets.find((item) => item.name === activeName) ?? sheets[0]
  return <section className="excel-workbook">
    <div className="excel-workbook-head"><span><FileSpreadsheet size={16} /> WORKBOOK REFERENCE</span><small>Source values are read-only for this lab.</small></div>
    <div className="excel-sheet-tabs">{sheets.map((item) => <button key={item.name} onClick={() => setActiveName(item.name)} className={item.name === sheet.name ? 'active' : ''}><Table2 size={14} /> {item.name}{item.tableName && <em>{item.tableName}</em>}</button>)}</div>
    <div className="excel-sheet-description"><strong>{sheet.name}</strong><p>{sheet.description}</p></div>
    <div className="excel-table-scroll"><table><thead><tr><th aria-label="row number" /><>{sheet.columns.map((column) => <th key={column.key}><span>{column.key}</span>{column.label}</th>)}</></tr></thead><tbody>{sheet.rows.map((row, rowIndex) => <tr key={rowIndex}><th>{rowIndex + 2}</th>{row.map((value, cellIndex) => <td key={sheet.columns[cellIndex].key} className={value === null ? 'null' : ''}>{value === null ? '—' : String(value)}</td>)}</tr>)}</tbody></table></div>
    <div className="excel-column-guide">{sheet.columns.map((column) => <span key={column.key}><b>{column.key}</b><strong>{column.label}</strong><em>{column.meaning}</em></span>)}</div>
  </section>
}

export function ExcelWorkspace({ lesson, initialStage, progress, onProgress, onNavigate, onHome }: Props) {
  const [stage, setStage] = useState<'lesson' | 'lab'>(initialStage)
  const [activeExercise, setActiveExercise] = useState(0)
  const [mobileCurriculum, setMobileCurriculum] = useState(false)
  const exercise = lesson.exercises[activeExercise]
  const exerciseKey = excelExerciseKey(lesson.id, activeExercise)
  const [formula, setFormula] = useState(progress.drafts[exerciseKey] ?? exercise.starterFormula)
  const [checked, setChecked] = useState(false)
  const [passed, setPassed] = useState(false)
  const hintCount = progress.hints[exerciseKey] ?? 0
  const nextLesson = getNextExcelLesson(lesson.id)
  const completedQuestions = lesson.exercises.filter((_, index) => progress.excelCompletedExercises.includes(excelExerciseKey(lesson.id, index))).length
  const complete = progress.excelCompleted.includes(lesson.id)

  useEffect(() => {
    onProgress((current) => ({ ...current, lastExcelLesson: lesson.id }))
  }, [lesson.id, onProgress])

  useEffect(() => setStage(initialStage), [initialStage])

  const openLesson = () => {
    setStage('lesson')
    onNavigate(lesson.id, 'lesson')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectExercise = (index: number) => {
    const next = lesson.exercises[index]
    setActiveExercise(index)
    setFormula(progress.drafts[excelExerciseKey(lesson.id, index)] ?? next.starterFormula)
    setChecked(false)
    setPassed(false)
  }

  const openLab = () => {
    const firstIncomplete = lesson.exercises.findIndex((_, index) => !progress.excelCompletedExercises.includes(excelExerciseKey(lesson.id, index)))
    selectExercise(firstIncomplete === -1 ? 0 : firstIncomplete)
    setStage('lab')
    onNavigate(lesson.id, 'lab')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateFormula = (value: string) => {
    setFormula(value)
    onProgress((current) => ({ ...current, drafts: { ...current.drafts, [exerciseKey]: value } }))
  }

  const checkFormula = () => {
    const valid = isMatchingFormula(formula, exercise)
    setChecked(true)
    setPassed(valid)
    onProgress((current) => {
      const completedExercises = valid && !current.excelCompletedExercises.includes(exerciseKey)
        ? [...current.excelCompletedExercises, exerciseKey]
        : current.excelCompletedExercises
      const allComplete = lesson.exercises.every((_, index) => completedExercises.includes(excelExerciseKey(lesson.id, index)))
      return {
        ...current,
        excelCompletedExercises: completedExercises,
        excelCompleted: allComplete && !current.excelCompleted.includes(lesson.id) ? [...current.excelCompleted, lesson.id] : current.excelCompleted,
        excelOutcomes: { ...current.excelOutcomes, [lesson.id]: valid ? 'passed' : 'failed' },
        attempts: { ...current.attempts, [exerciseKey]: (current.attempts[exerciseKey] ?? 0) + 1 },
        drafts: { ...current.drafts, [exerciseKey]: formula },
        lastExcelLesson: lesson.id,
      }
    })
  }

  const revealHint = () => {
    if (hintCount >= exercise.hints.length) return
    onProgress((current) => ({ ...current, hints: { ...current.hints, [exerciseKey]: Math.min(exercise.hints.length, (current.hints[exerciseKey] ?? 0) + 1) } }))
  }

  const labOutcome = completedQuestions === lesson.exercises.length ? 'passed' : progress.excelOutcomes[lesson.id]

  return <div className="excel-shell">
    <aside className={`excel-curriculum ${mobileCurriculum ? 'mobile-open' : ''}`}>
      <div className="curriculum-header"><button className="mini-wordmark excel-wordmark" onClick={onHome}><Sigma size={17} /><span>EXCEL LAB</span></button><button className="mobile-close" onClick={() => setMobileCurriculum(false)}><X size={18} /></button></div>
      <div className="curriculum-title"><span>EXCEL COURSE</span><small>{progress.excelCompleted.length} / {excelLessons.length} mastered</small></div>
      <div className="curriculum-list">
        {excelLessons.map((item) => {
          const itemDone = progress.excelCompleted.includes(item.id)
          const passedCount = item.exercises.filter((_, index) => progress.excelCompletedExercises.includes(excelExerciseKey(item.id, index))).length
          const itemOutcome = passedCount === item.exercises.length ? 'passed' : progress.excelOutcomes[item.id]
          const lessonActive = item.id === lesson.id && stage === 'lesson'
          const labActive = item.id === lesson.id && stage === 'lab'
          return <div className="curriculum-group" key={item.id}>
            <button className={`curriculum-item ${lessonActive ? 'active' : ''} ${itemDone ? 'complete' : ''}`} onClick={() => { if (item.id === lesson.id) openLesson(); else onNavigate(item.id, 'lesson'); setMobileCurriculum(false) }}>
              <span className="curriculum-marker">{itemDone ? <Check size={12} /> : lessonActive ? <span className="pulse-dot" /> : <Circle size={9} />}</span>
              <span className="curriculum-copy"><small>{item.number.replace(/^0/, '')}</small><strong>{item.title}</strong><em>{item.eyebrow}</em></span>{lessonActive && <ChevronRight size={14} />}
            </button>
            <button className={`curriculum-item lab-link ${labActive ? 'active' : ''} ${passedCount === item.exercises.length ? 'complete' : ''} ${itemOutcome === 'passed' ? 'lab-passed' : itemOutcome === 'failed' ? 'lab-failed' : ''}`} onClick={() => { if (item.id === lesson.id) openLab(); else onNavigate(item.id, 'lab'); setMobileCurriculum(false) }}>
              <span className="curriculum-marker">{passedCount === item.exercises.length ? <Check size={12} /> : <FlaskConical size={13} />}</span>
              <span className="curriculum-copy lab-copy"><strong>{item.number.replace(/^0/, '')} -- EXCEL LAB</strong><em>{itemOutcome === 'failed' ? `Latest attempt needs work · ${passedCount} / ${item.exercises.length} passed` : `${passedCount} / ${item.exercises.length} formulas passed`}</em></span>{labActive && <ChevronRight size={14} />}
            </button>
          </div>
        })}
      </div>
      <div className="curriculum-foot"><span><i className="online" /> Formula practice ready</span><span>{progress.excelCompletedExercises.length} / {excelLessons.length * 3}</span></div>
    </aside>

    <main className="excel-main">
      <header className="excel-topbar">
        <div><button className="mobile-curriculum-button" onClick={() => setMobileCurriculum(true)}><BookOpen size={15} /> Excel curriculum</button><FileSpreadsheet size={15} /><span>EXCEL COURSE</span><ChevronRight size={14} /><strong>{lesson.title}</strong></div>
        <div className="excel-stage-switcher"><button className={stage === 'lesson' ? 'active' : ''} onClick={openLesson}><span>1</span> Learn</button><i /><button className={stage === 'lab' ? 'active' : ''} onClick={openLab}><span>2</span> Formula lab</button></div>
      </header>

      {stage === 'lesson' ? <article className="excel-lesson-content">
        <section className="excel-intro"><div><span>EXCEL {lesson.number.replace(/^0/, '')}</span><span>{lesson.duration} MIN</span><span>{lesson.difficulty}</span></div><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="concept-pills">{lesson.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div></section>
        <section className="excel-objectives"><h2>By the end, you’ll be able to</h2>{lesson.objectives.map((objective) => <div key={objective}><Check size={15} />{objective}</div>)}</section>
        <section className="excel-section"><div className="excel-section-heading"><span>CONCEPT</span><h2>How the mechanics work</h2></div><div className="excel-mechanics">{lesson.mechanics.map((mechanic) => <article key={mechanic.title}><span>{mechanic.part}</span><div><h3>{mechanic.title}</h3><p>{mechanic.explanation}</p><aside><strong>WHY IT MATTERS</strong><p>{mechanic.why}</p></aside><pre>{mechanic.example}</pre></div></article>)}</div></section>
        <section className="excel-section"><div className="excel-section-heading"><span>FORMULA IN PRACTICE</span><h2>When each formula becomes powerful</h2><p>Every formula below includes a practical situation and the result it produces from this lesson’s workbook.</p></div><div className="excel-spotlight-grid">{lesson.formulaSpotlights.map((spotlight) => <article key={spotlight.formula}><code>{spotlight.formula}</code><div><strong>POWER</strong><p>{spotlight.powerful}</p></div><div><strong>USE IT WHEN</strong><p>{spotlight.whenToUse}</p></div><div><strong>PRACTICAL EXAMPLE</strong><p>{spotlight.practicalExample}</p></div><footer><span>RESULT</span><strong>{spotlight.result}</strong></footer></article>)}</div></section>
        <section className="excel-real-world"><div><span>{lesson.realWorldExample.context}</span><h2>{lesson.realWorldExample.title}</h2><p>{lesson.realWorldExample.purpose}</p></div><pre>{lesson.realWorldExample.formula}</pre></section>
        <section className="excel-pro-tip"><Lightbulb size={18} /><div><strong>PRACTICAL TIP</strong><p>{lesson.proTip}</p></div></section>
        <section className="excel-lab-bridge"><div><FlaskConical size={24} /></div><div><span>FORMULA LAB</span><h2>Use the workbook, not a blank example.</h2><p>Inspect the same source rows used in the examples, write the formula, and see the calculated outcome when it passes.</p></div><button className="button primary" onClick={openLab}>Open formula lab <ArrowRight size={15} /></button></section>
      </article> : <article className="excel-lab-content">
        <button className="excel-back" onClick={openLesson}><ArrowLeft size={14} /> Back to lesson</button>
        <header className="excel-lab-heading"><div><span>FORMULA LAB · {lesson.number.replace(/^0/, '')}</span><h1>{lesson.title}</h1><p>Write the formula for the target cell. The workbook reference stays visible so you can reason from actual values.</p></div>{complete && <div className="complete-badge"><Check size={13} /> Lesson mastered</div>}</header>
        <div className="excel-question-nav">{lesson.exercises.map((item, index) => { const itemComplete = progress.excelCompletedExercises.includes(excelExerciseKey(lesson.id, index)); return <button key={item.id} className={`${activeExercise === index ? 'active' : ''} ${itemComplete ? 'complete' : ''}`} onClick={() => selectExercise(index)}><span>{itemComplete ? <Check size={13} /> : index + 1}</span><div><small>FORMULA {index + 1}</small><strong>{item.title}</strong></div></button> })}<div className="excel-lab-progress"><strong>{completedQuestions}/{lesson.exercises.length}</strong><span>passed</span></div></div>
        <section className="excel-task"><div><span>TARGET CELL</span><strong>{exercise.targetCell}</strong></div><p>{exercise.task}</p></section>
        <WorkbookViewer sheets={lesson.workbook} />
        <section className="formula-editor"><div className="formula-editor-head"><span><Sigma size={16} /> FORMULA BAR <i>Enter a formula beginning with =</i></span><button onClick={() => { updateFormula(exercise.starterFormula); setChecked(false); setPassed(false) }}><RotateCcw size={13} /> Reset</button></div><div className="formula-input-row"><span>fx</span><input value={formula} onChange={(event) => updateFormula(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') checkFormula() }} aria-label={`Formula for ${exercise.targetCell}`} spellCheck={false} autoCapitalize="off" /><button className="button run" onClick={checkFormula}><Play size={14} fill="currentColor" /> Check formula</button></div></section>
        {checked && <section className={`formula-result ${passed ? 'passed' : 'failed'}`}><span>{passed ? <Check size={18} /> : <Circle size={16} />}</span><div><strong>{passed ? 'Formula accepted' : 'Not quite yet'}</strong><p>{passed ? `Excel returns: ${String(exercise.expectedValue)}. ${exercise.resultNote}` : 'Check the function, cell references, punctuation, and required arguments. Your formula can use different spacing, but it needs the requested logic.'}</p></div>{passed && activeExercise < lesson.exercises.length - 1 && <button onClick={() => selectExercise(activeExercise + 1)}>Next formula <ArrowRight size={14} /></button>}</section>}
        <section className="excel-help"><div><Lightbulb size={16} /><span>HINTS</span><small>{hintCount}/{exercise.hints.length} opened</small><button onClick={revealHint} disabled={hintCount >= exercise.hints.length}><ChevronDown size={14} /> Reveal next hint</button></div>{hintCount > 0 && <div>{exercise.hints.slice(0, hintCount).map((hint, index) => <p key={hint}><b>{index + 1}</b>{hint}</p>)}</div>}{hintCount === exercise.hints.length && !passed && <button className="excel-show-answer" onClick={() => updateFormula(exercise.solutionFormula)}><Clipboard size={14} /> Put the explained answer in the formula bar</button>}</section>
        {(passed || hintCount === exercise.hints.length) && <section className="excel-answer"><div><span>{passed ? 'WHY THIS WORKS' : 'EXPLAINED ANSWER'}</span><button onClick={() => updateFormula(exercise.solutionFormula)}><Clipboard size={13} /> Use formula</button></div><pre>{exercise.solutionFormula}</pre><ol>{exercise.explanation.map((line) => <li key={line}>{line}</li>)}</ol></section>}
        <footer className="excel-lab-footer"><button disabled={activeExercise === 0} onClick={() => selectExercise(activeExercise - 1)}><ArrowLeft size={14} /> Previous formula</button><span>{labOutcome === 'failed' ? 'Latest attempt needs work' : `${completedQuestions} of ${lesson.exercises.length} formulas passed`}</span>{activeExercise < lesson.exercises.length - 1 ? <button onClick={() => selectExercise(activeExercise + 1)}>Next formula <ArrowRight size={14} /></button> : nextLesson ? <button onClick={() => onNavigate(nextLesson.id)}>Next lesson <ArrowRight size={14} /></button> : <button onClick={onHome}>Finish course <Check size={14} /></button>}</footer>
      </article>}
    </main>
  </div>
}
