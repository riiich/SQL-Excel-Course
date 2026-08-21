import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { BookOpen, Braces, Dumbbell, Gamepad2, LayoutDashboard, Moon, Settings, Sun, Table2, TerminalSquare } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { curriculum, getLesson, lessons } from './data/curriculum'
import { excelLessons, getExcelLesson } from './data/excelCurriculum'
import { clearProgress, loadProgress, saveProgress } from './lib/progress'
import type { ProgressState } from './types'

const LessonWorkspace = lazy(() => import('./components/LessonWorkspace').then((module) => ({ default: module.LessonWorkspace })))
const Campaign = lazy(() => import('./components/Campaign').then((module) => ({ default: module.Campaign })))
const ExcelWorkspace = lazy(() => import('./components/ExcelWorkspace').then((module) => ({ default: module.ExcelWorkspace })))
const ChallengeWorkspace = lazy(() => import('./components/ChallengeWorkspace').then((module) => ({ default: module.ChallengeWorkspace })))

type LessonStage = 'lesson' | 'lab'
type Route =
  | { page: 'dashboard' }
  | { page: 'lesson'; lessonId: string; stage?: LessonStage }
  | { page: 'sql-labs'; lessonId?: string }
  | { page: 'excel'; lessonId?: string; stage?: LessonStage }
  | { page: 'campaign'; chapterId?: string; missionId?: string }
  | { page: 'challenges'; topicId?: string; questionId?: string }
type Theme = 'dark' | 'light'

function readRoute(): Route {
  const sqlLabsMatch = window.location.hash.match(/^#\/sql-labs(?:\/([^/]+))?$/)
  if (sqlLabsMatch) return { page: 'sql-labs', lessonId: sqlLabsMatch[1] }
  const lessonMatch = window.location.hash.match(/^#\/lesson\/([^/]+)(?:\/(lab))?$/)
  if (lessonMatch) return { page: 'lesson', lessonId: lessonMatch[1], stage: lessonMatch[2] === 'lab' ? 'lab' : 'lesson' }
  const campaignMatch = window.location.hash.match(/^#\/campaign(?:\/([^/]+)(?:\/([^/]+))?)?$/)
  if (campaignMatch) return { page: 'campaign', chapterId: campaignMatch[1], missionId: campaignMatch[2] }
  const challengeMatch = window.location.hash.match(/^#\/challenges(?:\/([^/]+)(?:\/([^/]+))?)?$/)
  if (challengeMatch) return { page: 'challenges', topicId: challengeMatch[1], questionId: challengeMatch[2] }
  const excelMatch = window.location.hash.match(/^#\/excel(?:\/([^/]+)(?:\/(lab))?)?$/)
  if (excelMatch) return { page: 'excel', lessonId: excelMatch[1], stage: excelMatch[2] === 'lab' ? 'lab' : 'lesson' }
  return { page: 'dashboard' }
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [progress, setProgress] = useState<ProgressState>(loadProgress)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('querycraft.theme') === 'light' ? 'light' : 'dark')

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => saveProgress(progress), [progress])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('querycraft.theme', theme)
  }, [theme])

  const navigate = (next: Route) => {
    window.location.hash = next.page === 'dashboard'
      ? '#/'
      : next.page === 'campaign'
        ? `#/campaign${next.chapterId ? `/${next.chapterId}${next.missionId ? `/${next.missionId}` : ''}` : ''}`
        : next.page === 'challenges'
          ? `#/challenges${next.topicId ? `/${next.topicId}${next.questionId ? `/${next.questionId}` : ''}` : ''}`
        : next.page === 'sql-labs'
          ? `#/sql-labs/${next.lessonId ?? progress.lastLesson ?? lessons[0].id}`
        : next.page === 'excel'
          ? `#/excel/${next.lessonId ?? progress.lastExcelLesson ?? excelLessons[0].id}${next.stage === 'lab' ? '/lab' : ''}`
        : `#/lesson/${next.lessonId}${next.stage === 'lab' ? '/lab' : ''}`
    setRoute(next)
  }

  const activeLesson = route.page === 'lesson' || route.page === 'sql-labs' ? getLesson(route.lessonId ?? lessons[0].id) : null
  const activeExcelLesson = route.page === 'excel' ? getExcelLesson(route.lessonId) : null
  const completion = useMemo(() => Math.round((progress.completed.length / lessons.length) * 100), [progress.completed.length])
  const excelCompletion = useMemo(() => Math.round((progress.excelCompleted.length / excelLessons.length) * 100), [progress.excelCompleted.length])

  const patchProgress = useCallback((update: Partial<ProgressState> | ((current: ProgressState) => ProgressState)) => {
    setProgress((current) => typeof update === 'function' ? update(current) : { ...current, ...update })
  }, [])

  return (
    <div className="app-shell">
      <aside className="rail" aria-label="Primary navigation">
        <button className="brand-mark" onClick={() => navigate({ page: 'dashboard' })} aria-label="Querycraft home">
          <Braces size={21} strokeWidth={2.3} />
        </button>
        <nav className="rail-nav">
          <button className={route.page === 'dashboard' ? 'active' : ''} onClick={() => navigate({ page: 'dashboard' })} data-label="Dashboard">
            <LayoutDashboard size={19} />
          </button>
          <button className={route.page === 'lesson' && route.stage !== 'lab' ? 'active' : ''} onClick={() => navigate({ page: 'lesson', lessonId: progress.lastLesson ?? lessons[0].id })} data-label="Learn">
            <BookOpen size={19} />
          </button>
          <button className={route.page === 'sql-labs' ? 'active' : ''} onClick={() => navigate({ page: 'sql-labs', lessonId: progress.lastLesson ?? lessons[0].id })} data-label="SQL Lab">
            <TerminalSquare size={19} />
          </button>
          <button className={route.page === 'campaign' ? 'active' : ''} onClick={() => navigate({ page: 'campaign' })} data-label="SQL Ops Campaign">
            <Gamepad2 size={19} />
          </button>
          <button className={route.page === 'challenges' ? 'active' : ''} onClick={() => navigate({ page: 'challenges', topicId: progress.lastChallengeTopic ?? lessons[0].id })} data-label="Challenge Yourself">
            <Dumbbell size={19} />
          </button>
          <span className="rail-course-divider" aria-hidden="true" />
          <button className={route.page === 'excel' ? 'active' : ''} onClick={() => navigate({ page: 'excel', lessonId: progress.lastExcelLesson ?? excelLessons[0].id })} data-label="Excel Course">
            <Table2 size={19} />
          </button>
        </nav>
        <button
          className="rail-theme"
          onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          data-label={theme === 'dark' ? 'Cream mocha mode' : 'Dark mode'}
          aria-label={theme === 'dark' ? 'Switch to cream mocha light mode' : 'Switch to dark mode'}
          aria-pressed={theme === 'light'}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <button className="rail-settings" onClick={() => setSettingsOpen(true)} data-label="Settings"><Settings size={19} /></button>
      </aside>

      <main className="app-main">
        {route.page === 'challenges' ? (
          <Suspense fallback={<div className="workspace-loader"><Dumbbell size={25} /><span>Preparing your challenge set…</span></div>}>
            <ChallengeWorkspace
              key={`${route.topicId ?? 'first'}:${route.questionId ?? 'first'}`}
              topicId={route.topicId}
              questionId={route.questionId}
              progress={progress}
              theme={theme}
              onProgress={patchProgress}
              onNavigate={(topicId, questionId) => navigate({ page: 'challenges', topicId, questionId })}
              onHome={() => navigate({ page: 'dashboard' })}
            />
          </Suspense>
        ) : route.page === 'campaign' ? (
          <Suspense fallback={<div className="workspace-loader"><Gamepad2 size={25} /><span>Opening the case board…</span></div>}>
            <Campaign
              chapterId={route.chapterId}
              missionId={route.missionId}
              progress={progress}
              theme={theme}
              onProgress={patchProgress}
              onNavigate={(chapterId, missionId) => navigate({ page: 'campaign', chapterId, missionId })}
              onHome={() => navigate({ page: 'dashboard' })}
            />
          </Suspense>
        ) : activeExcelLesson ? (
          <Suspense fallback={<div className="workspace-loader"><Table2 size={25} /><span>Preparing your Excel workbook…</span></div>}>
            <ExcelWorkspace
              key={activeExcelLesson.id}
              lesson={activeExcelLesson}
              initialStage={route.page === 'excel' ? route.stage ?? 'lesson' : 'lesson'}
              progress={progress}
              onProgress={patchProgress}
              onNavigate={(lessonId, stage = 'lesson') => navigate({ page: 'excel', lessonId, stage })}
              onHome={() => navigate({ page: 'dashboard' })}
            />
          </Suspense>
        ) : activeLesson ? (
          <Suspense fallback={<div className="workspace-loader"><Braces size={25} /><span>Preparing your SQL workspace…</span></div>}>
            <LessonWorkspace
              key={activeLesson.id}
              lesson={activeLesson}
              initialStage={route.page === 'sql-labs' ? 'lab' : route.page === 'lesson' ? route.stage ?? 'lesson' : 'lesson'}
              curriculum={curriculum}
              progress={progress}
              theme={theme}
              onProgress={patchProgress}
              labsOnly={route.page === 'sql-labs'}
              onNavigate={(lessonId, stage = 'lesson') => route.page === 'sql-labs' ? navigate({ page: 'sql-labs', lessonId }) : navigate({ page: 'lesson', lessonId, stage })}
              onHome={() => navigate({ page: 'dashboard' })}
            />
          </Suspense>
        ) : (
          <Dashboard
            curriculum={curriculum}
            progress={progress}
            completion={completion}
            excelCompletion={excelCompletion}
            onOpenLesson={(lessonId) => navigate({ page: 'lesson', lessonId })}
            onOpenCampaign={() => navigate({ page: 'campaign' })}
            onOpenExcel={() => navigate({ page: 'excel', lessonId: progress.lastExcelLesson ?? excelLessons[0].id })}
          />
        )}
      </main>

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSettingsOpen(false)}>
          <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-kicker">LOCAL WORKSPACE</div>
            <h2 id="settings-title">Your data stays here.</h2>
            <p>Progress, attempts, hints, and drafts are stored only in this browser. No account or network connection is required after the app loads.</p>
            <div className="settings-stat"><span>Curriculum progress</span><strong>{completion}%</strong></div>
            <div className="modal-actions">
              <button className="button ghost" onClick={() => setSettingsOpen(false)}>Close</button>
              <button className="button danger" onClick={() => { clearProgress(); setProgress(loadProgress()); setSettingsOpen(false) }}>Reset all progress</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
