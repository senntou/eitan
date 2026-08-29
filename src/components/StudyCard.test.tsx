import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Word } from '../data/words'
import { StudyCard } from './StudyCard'

const word: Word = {
  id: 1,
  word: 'jeopardize',
  meaning: '危険にさらす',
  pos: 'v',
  level: 2,
  order: 1,
  tags: ['operations'],
  example: 'Missing the deadline could jeopardize the entire project.',
  exampleJa: '締め切りに間に合わないとプロジェクト全体が危うくなる。',
  note: 'ビジネスシーンでリスクを表す際によく使われる。',
}

describe('StudyCard', () => {
  it('does not show the answer before the card is revealed', () => {
    render(
      <StudyCard word={word} direction="word-to-meaning" isStarred={false} onToggleStar={vi.fn()} onAnswer={vi.fn()} />,
    )
    expect(screen.getByText('jeopardize')).toBeInTheDocument()
    expect(screen.queryByText(word.meaning)).not.toBeInTheDocument()
    expect(screen.queryByText(word.exampleJa)).not.toBeInTheDocument()
  })

  it('reveals meaning, example, translation and note in a single tap', async () => {
    const user = userEvent.setup()
    render(
      <StudyCard word={word} direction="word-to-meaning" isStarred={false} onToggleStar={vi.fn()} onAnswer={vi.fn()} />,
    )
    await user.click(screen.getByRole('button', { name: '答えを見る' }))

    expect(screen.getByText(word.meaning)).toBeInTheDocument()
    expect(screen.getByText(word.exampleJa)).toBeInTheDocument()
    expect(document.querySelector('.card-example')?.textContent).toContain('jeopardize the entire project')
    expect(document.querySelector('.card-note')?.textContent).toContain(word.note)
  })

  it('calls onAnswer("unknown") and onAnswer("known") from the revealed actions', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    render(
      <StudyCard word={word} direction="word-to-meaning" isStarred={false} onToggleStar={vi.fn()} onAnswer={onAnswer} />,
    )
    await user.click(screen.getByRole('button', { name: '答えを見る' }))
    await user.click(screen.getByRole('button', { name: 'わからない' }))
    expect(onAnswer).toHaveBeenCalledWith('unknown')

    onAnswer.mockClear()
    await user.click(screen.getByRole('button', { name: 'わかった' }))
    expect(onAnswer).toHaveBeenCalledWith('known')
  })

  it('toggles the star even before the card is revealed', async () => {
    const user = userEvent.setup()
    const onToggleStar = vi.fn()
    render(
      <StudyCard word={word} direction="word-to-meaning" isStarred={false} onToggleStar={onToggleStar} onAnswer={vi.fn()} />,
    )
    await user.click(screen.getByRole('button', { name: '復習リストに追加' }))
    expect(onToggleStar).toHaveBeenCalledWith(word.id)
  })
})
