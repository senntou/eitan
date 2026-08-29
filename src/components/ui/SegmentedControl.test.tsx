import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

function Harness() {
  const [value, setValue] = useState<'a' | 'b' | 'c'>('a')
  return (
    <SegmentedControl
      label="test"
      value={value}
      onChange={setValue}
      options={[
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ]}
    />
  )
}

describe('SegmentedControl', () => {
  it('changes selection on click', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('radio', { name: 'B' }))
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'false')
  })

  it('changes selection with arrow keys', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    screen.getByRole('radio', { name: 'A' }).focus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true')

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true')
  })
})
