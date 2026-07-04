import { describe, it, expect } from 'vitest'
import { isThreadHiddenUntilCompletion } from './forum'

describe('isThreadHiddenUntilCompletion', () => {
  it('is hidden when the flag is set and the day is not completed', () => {
    expect(
      isThreadHiddenUntilCompletion({ hidden_until_completion: true }, { completed: false }),
    ).toBe(true)
  })

  it('is revealed once the day is completed, even though the flag is still true', () => {
    expect(
      isThreadHiddenUntilCompletion({ hidden_until_completion: true }, { completed: true }),
    ).toBe(false)
  })

  it('is revealed when the flag has already been cleared, regardless of completion', () => {
    expect(
      isThreadHiddenUntilCompletion({ hidden_until_completion: false }, { completed: false }),
    ).toBe(false)
    expect(
      isThreadHiddenUntilCompletion({ hidden_until_completion: false }, { completed: true }),
    ).toBe(false)
  })

  it('is independent of the time-based daily_live lock', () => {
    // A thread can be simultaneously NOT time-locked (window is open) but
    // still hidden-until-completion (player hasn't finished today's mission).
    const notTimeLocked = false
    const hiddenUntilCompletion = isThreadHiddenUntilCompletion(
      { hidden_until_completion: true },
      { completed: false },
    )
    expect(notTimeLocked).toBe(false)
    expect(hiddenUntilCompletion).toBe(true)

    // Conversely, a thread can be time-locked (e.g. an archive day whose
    // live-thread window has passed) while no longer hidden-until-completion
    // because the player already finished that day's mission.
    const timeLocked = true
    const revealed = isThreadHiddenUntilCompletion(
      { hidden_until_completion: true },
      { completed: true },
    )
    expect(timeLocked).toBe(true)
    expect(revealed).toBe(false)
  })
})
