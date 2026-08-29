export type MainTab = 'home' | 'list' | 'review'

type Props = {
  active: MainTab
  onChange: (tab: MainTab) => void
}

const TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: 'home', label: 'ホーム', icon: '🏠' },
  { id: 'list', label: '一覧', icon: '📖' },
  { id: 'review', label: '復習', icon: '⭐' },
]

export function BottomTabBar({ active, onChange }: Props) {
  return (
    <nav className="bottom-tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <span className="bottom-tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="bottom-tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
