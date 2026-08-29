import { useMemo, useState } from 'react'
import { PhaseSelect } from './components/PhaseSelect'
import { StudyCard } from './components/StudyCard'
import { StudySettings, type Direction } from './components/StudySettings'
import { WordList } from './components/WordList'
import { words, type Word } from './data/words'
import { useStarredWords } from './hooks/useStarredWords'
import './App.css'

type Tab = 'study' | 'list'

type StudySession = {
  words: Word[]
  direction: Direction
  index: number
}

function App() {
  const [tab, setTab] = useState<Tab>('study')
  const [phase, setPhase] = useState(1)
  const [session, setSession] = useState<StudySession | null>(null)
  const { starredIds, toggleStar } = useStarredWords()

  const phaseWords = useMemo(() => words.filter((w) => w.phase === phase), [phase])

  const handlePhaseChange = (p: number) => {
    setPhase(p)
    setSession(null)
  }

  const handleStart = (sessionWords: Word[], direction: Direction) => {
    setSession({ words: sessionWords, direction, index: 0 })
  }

  const handleSessionNext = () => {
    setSession((s) => (s ? { ...s, index: (s.index + 1) % s.words.length } : s))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>英単語帳</h1>
        <nav className="tabs">
          <button
            type="button"
            className={tab === 'study' ? 'active' : ''}
            onClick={() => setTab('study')}
          >
            学習
          </button>
          <button
            type="button"
            className={tab === 'list' ? 'active' : ''}
            onClick={() => setTab('list')}
          >
            一覧
          </button>
        </nav>
        <PhaseSelect words={words} phase={phase} onChange={handlePhaseChange} />
      </header>

      <main>
        {tab === 'study' ? (
          session ? (
            <>
              <StudyCard
                word={session.words[session.index]}
                direction={session.direction}
                isStarred={starredIds.has(session.words[session.index].id)}
                onToggleStar={toggleStar}
                onNext={handleSessionNext}
                index={session.index}
                total={session.words.length}
              />
              <button type="button" className="btn-text" onClick={() => setSession(null)}>
                設定に戻る
              </button>
            </>
          ) : phaseWords.length === 0 ? (
            <p className="empty-message">このPhaseの単語は準備中です。</p>
          ) : (
            <StudySettings phaseWords={phaseWords} starredIds={starredIds} onStart={handleStart} />
          )
        ) : (
          <WordList words={phaseWords} starredIds={starredIds} onToggleStar={toggleStar} />
        )}
      </main>
    </div>
  )
}

export default App
