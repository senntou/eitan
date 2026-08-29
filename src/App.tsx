import { useState } from 'react'
import { StudyCard } from './components/StudyCard'
import { WordList } from './components/WordList'
import { words } from './data/words'
import { useStarredWords } from './hooks/useStarredWords'
import './App.css'

type Tab = 'study' | 'list'

function App() {
  const [tab, setTab] = useState<Tab>('study')
  const [currentIndex, setCurrentIndex] = useState(0)
  const { starredIds, toggleStar } = useStarredWords()

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % words.length)
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
      </header>

      <main>
        {tab === 'study' ? (
          <StudyCard
            word={words[currentIndex]}
            isStarred={starredIds.has(words[currentIndex].id)}
            onToggleStar={toggleStar}
            onNext={handleNext}
            index={currentIndex}
            total={words.length}
          />
        ) : (
          <WordList words={words} starredIds={starredIds} onToggleStar={toggleStar} />
        )}
      </main>
    </div>
  )
}

export default App
