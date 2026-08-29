import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Word } from '../data/words'
import { ProgressProvider } from '../storage/ProgressContext'
import { Study } from './Study'

function makeWord(id: number, word: string): Word {
  return {
    id,
    word,
    meaning: `${word}の意味`,
    pos: 'v',
    level: 1,
    order: id,
    tags: ['office'],
    example: `We ${word} things at work.`,
    exampleJa: `私たちは仕事で${word}します。`,
  }
}

describe('Study session', () => {
  it('calls onFinish once the last question is answered', async () => {
    const user = userEvent.setup()
    const sessionWords = [makeWord(1, 'submit'), makeWord(2, 'approve')]
    const onFinish = vi.fn()

    render(
      <ProgressProvider>
        <Study levelLabel="Level 1" words={sessionWords} direction="word-to-meaning" onFinish={onFinish} onExit={vi.fn()} />
      </ProgressProvider>,
    )

    // question 1
    await user.click(screen.getByRole('button', { name: '答えを見る' }))
    await user.click(screen.getByRole('button', { name: 'わかった' }))
    expect(onFinish).not.toHaveBeenCalled()
    expect(screen.getByText('approve')).not.toBeNull()

    // question 2 (last)
    await user.click(screen.getByRole('button', { name: '答えを見る' }))
    await user.click(screen.getByRole('button', { name: 'わかった' }))

    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onFinish).toHaveBeenCalledWith({ 1: 'known', 2: 'known' })
  })
})
