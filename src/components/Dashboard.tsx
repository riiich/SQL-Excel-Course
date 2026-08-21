import { ArrowRight, Check, ChevronRight, Clock3, FileSpreadsheet, Flame, Gamepad2, Play, Sparkles, Terminal, Trophy } from 'lucide-react'
import { lessons } from '../data/curriculum'
import type { CurriculumModule, ProgressState } from '../types'

interface Props {
  curriculum: CurriculumModule[]
  progress: ProgressState
  completion: number
  excelCompletion: number
  onOpenLesson: (id: string) => void
  onOpenCampaign: () => void
  onOpenExcel: () => void
}

export function Dashboard({ curriculum, progress, completion, excelCompletion, onOpenLesson, onOpenCampaign, onOpenExcel }: Props) {
  const nextLesson = lessons.find((item) => !progress.completed.includes(item.id)) ?? lessons[lessons.length - 1]
  const completedModules = curriculum.filter((module) => module.lessons.every((item) => progress.completed.includes(item.id))).length

  return (
    <div className="dashboard">
      <header className="topbar">
        <a className="wordmark" href="#/">QUERY<span>CRAFT</span><sup>_</sup></a>
        <div className="topbar-meta">
          <span className="status-dot" />
          <span>SQLite runtime ready</span>
          <kbd>⌘ K</kbd>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span>LEARNING PATH</span><i /></div>
            <h1>Stop reading SQL.<br /><em>Start reasoning in it.</em></h1>
            <p>Refresh the foundations whenever you need them, then move through query design, analytics, performance, and database programming.</p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => onOpenLesson(nextLesson.id)}>
                <Play size={15} fill="currentColor" /> Continue path <ArrowRight size={16} />
              </button>
              <span className="next-up"><small>NEXT UP</small>{nextLesson.number} · {nextLesson.title}</span>
            </div>
          </div>

          <div className="progress-terminal">
            <div className="terminal-bar">
              <div className="traffic"><i /><i /><i /></div>
              <span>learning_progress.sql</span>
              <span>•••</span>
            </div>
            <div className="terminal-body">
              <div className="line-no">01<br />02<br />03<br />04<br />05<br />06</div>
              <pre><span className="tok-blue">SELECT</span>{'\n  '}learner,{`\n  `}<span className="tok-green">${completion}</span> <span className="tok-muted">AS</span> progress_pct,{`\n  `}<span className="tok-green">${completedModules}</span> <span className="tok-muted">AS</span> modules_mastered{`\n`}<span className="tok-blue">FROM</span> learning_path{`\n`}<span className="tok-blue">WHERE</span> consistency = <span className="tok-yellow">'daily'</span>;</pre>
            </div>
            <div className="terminal-result">
              <div className="result-label"><Terminal size={13} /> QUERY RESULT <span>1 row</span></div>
              <div className="progress-readout">
                <div className="progress-ring" style={{ '--progress': `${completion * 3.6}deg` } as React.CSSProperties}>
                  <div><strong>{completion}%</strong><span>complete</span></div>
                </div>
                <div className="progress-facts">
                  <div><span>modules mastered</span><strong>{completedModules}<small> / {curriculum.length}</small></strong></div>
                  <div><span>lab questions</span><strong>{progress.completedExercises.length}<small> / {lessons.length * 3}</small></strong></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-campaign-callout">
          <div className="campaign-callout-icon"><Gamepad2 size={24} /></div>
          <div>
            <span>SQL OPS · STORY CAMPAIGN</span>
            <h2>Solve cases, not isolated exercises.</h2>
            <p>Fifteen real-world investigations, seventy-five progressive missions, browsable evidence tables, and guided debriefs.</p>
          </div>
          <div className="campaign-callout-progress"><Trophy size={16} /><strong>{progress.campaignCompleted.length}</strong><span>/ 75 cleared</span></div>
          <button className="button primary" onClick={onOpenCampaign}>Open case board <ArrowRight size={15} /></button>
        </section>

        <section className="dashboard-excel-callout">
          <div className="excel-callout-icon"><FileSpreadsheet size={24} /></div>
          <div>
            <span>EXCEL FORMULA COURSE</span>
            <h2>Build workbooks people can trust.</h2>
            <p>Ten detailed lessons with workbook references, formula practice, results, and explanations for every answer.</p>
          </div>
          <div className="excel-callout-progress"><FileSpreadsheet size={16} /><strong>{excelCompletion}%</strong><span>{progress.excelCompletedExercises.length} formulas passed</span></div>
          <button className="button excel-primary" onClick={onOpenExcel}>Open Excel course <ArrowRight size={15} /></button>
        </section>

        <section className="path-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span>CURRICULUM</span><i /></div>
              <h2>Your path to fluency</h2>
            </div>
            <div className="path-legend"><span><i className="done" /> Mastered</span><span><i className="current" /> Current</span><span><i /> Upcoming</span></div>
          </div>

          <div className="module-grid">
            {curriculum.map((module) => {
              const moduleLesson = module.lessons[0]
              const isDone = module.lessons.every((item) => progress.completed.includes(item.id))
              const isCurrent = moduleLesson.id === nextLesson.id
              return (
                <button
                  className={`module-card ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                  key={module.id}
                  onClick={() => onOpenLesson(moduleLesson.id)}
                  style={{ '--accent': module.accent } as React.CSSProperties}
                >
                  <div className="module-top">
                    <span className="module-index">{String(module.index).padStart(2, '0')}</span>
                    <span className="module-status">{isDone ? <><Check size={12} /> mastered</> : isCurrent ? <><Flame size={12} /> current</> : <>{moduleLesson.difficulty}</>}</span>
                  </div>
                  <h3>{module.title}</h3>
                  <p>{module.summary}</p>
                  <div className="topic-row">{moduleLesson.concepts.slice(0, 3).map((topic) => <span key={topic}>{topic}</span>)}</div>
                  <div className="module-footer">
                    <span><Clock3 size={13} /> {moduleLesson.duration} min</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <footer className="dashboard-footer">
          <div><Sparkles size={15} /><span>One focused lesson a day compounds quickly.</span></div>
          <span>{curriculum.length} modules · browser-based SQL · no setup</span>
        </footer>
      </div>
    </div>
  )
}
