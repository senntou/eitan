import { useState } from 'react'
import { BottomTabBar, type MainTab } from './components/BottomTabBar'
import { WordList } from './components/WordList'
import { levelById } from './data/levels'
import type { Word } from './data/words'
import { Home } from './screens/Home'
import { LevelDetail } from './screens/LevelDetail'
import { Result } from './screens/Result'
import { Review } from './screens/Review'
import { Study, type SessionResult } from './screens/Study'
import { ProgressProvider } from './storage/ProgressContext'
import { loadSettings, saveSettings, type StudySettings } from './storage/settings'
import './App.css'

type Screen =
  | { name: 'home' }
  | { name: 'levelDetail'; levelId: number }
  | { name: 'study'; levelLabel: string; words: Word[]; returnScreen: Screen }
  | { name: 'result'; levelLabel: string; words: Word[]; results: SessionResult; returnScreen: Screen }
  | { name: 'list' }
  | { name: 'review' }

function AppContent() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [settings, setSettings] = useState<StudySettings>(() => loadSettings())
  const [listLevelId, setListLevelId] = useState(1)

  const updateSettings = (next: StudySettings) => {
    setSettings(next)
    saveSettings(next)
  }

  const startStudy = (levelLabel: string, sessionWords: Word[], returnScreen: Screen) => {
    if (sessionWords.length === 0) return
    setScreen({ name: 'study', levelLabel, words: sessionWords, returnScreen })
  }

  const startLevelStudy = (levelId: number, sessionWords: Word[]) => {
    updateSettings({ ...settings, lastLevelId: levelId })
    startStudy(levelById(levelId)?.title ?? '', sessionWords, { name: 'levelDetail', levelId })
  }

  const mainTab: MainTab = screen.name === 'list' ? 'list' : screen.name === 'review' ? 'review' : 'home'
  const showTabBar = screen.name === 'home' || screen.name === 'levelDetail' || screen.name === 'list' || screen.name === 'review'

  return (
    <div className="app">
      <main>
        {screen.name === 'home' && (
          <Home lastLevelId={settings.lastLevelId} onOpenLevel={(levelId) => setScreen({ name: 'levelDetail', levelId })} />
        )}

        {screen.name === 'levelDetail' && (
          <LevelDetail
            levelId={screen.levelId}
            settings={settings}
            onChangeSettings={updateSettings}
            onStart={(sessionWords) => startLevelStudy(screen.levelId, sessionWords)}
            onBack={() => setScreen({ name: 'home' })}
          />
        )}

        {screen.name === 'study' && (
          <Study
            levelLabel={screen.levelLabel}
            words={screen.words}
            direction={settings.direction}
            onFinish={(results) =>
              setScreen({ name: 'result', levelLabel: screen.levelLabel, words: screen.words, results, returnScreen: screen.returnScreen })
            }
            onExit={() => setScreen(screen.returnScreen)}
          />
        )}

        {screen.name === 'result' && (
          <Result
            levelLabel={screen.levelLabel}
            words={screen.words}
            results={screen.results}
            onRepeatWrong={(wrongWords) => startStudy(screen.levelLabel, wrongWords, screen.returnScreen)}
            onBackToLevel={() => setScreen(screen.returnScreen)}
          />
        )}

        {screen.name === 'list' && <WordList levelId={listLevelId} onChangeLevel={setListLevelId} />}

        {screen.name === 'review' && (
          <Review
            settings={settings}
            onChangeSettings={updateSettings}
            onStart={(sessionWords) => startStudy('復習リスト', sessionWords, { name: 'review' })}
          />
        )}
      </main>

      {showTabBar && (
        <BottomTabBar
          active={mainTab}
          onChange={(tab) => {
            if (tab === 'home') setScreen({ name: 'home' })
            else if (tab === 'list') setScreen({ name: 'list' })
            else setScreen({ name: 'review' })
          }}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <ProgressProvider>
      <AppContent />
    </ProgressProvider>
  )
}

export default App
