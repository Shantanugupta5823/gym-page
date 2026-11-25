import { describe, expect, it } from 'vitest'
import { getTutorialId, parseYouTubeId, TUTORIAL_VIDEOS } from '@/db/tutorials'
import { SEED_PLAN } from '@/db/seedPlan'

describe('tutorial videos', () => {
  it('has a tutorial for every exercise in the seed plan', () => {
    const ids = new Set(SEED_PLAN.flatMap(day => day.items.map(item => item.exerciseId)))
    expect([...ids].filter(id => !TUTORIAL_VIDEOS[id])).toEqual([])
  })

  it('stores valid 11-character video ids', () => {
    Object.values(TUTORIAL_VIDEOS).forEach(id => expect(id).toMatch(/^[\w-]{11}$/))
  })

  it('prefers a video the user set', () => {
    expect(getTutorialId('Pullups', { Pullups: 'abcdefghijk' })).toBe('abcdefghijk')
    expect(getTutorialId('Pullups', {})).toBe(TUTORIAL_VIDEOS.Pullups)
    expect(getTutorialId('Unknown', {})).toBeNull()
  })
})

describe('parseYouTubeId', () => {
  it('reads Shorts, watch, youtu.be and embed links', () => {
    expect(parseYouTubeId('https://www.youtube.com/shorts/ljyqdC4ydrM?feature=share')).toBe('ljyqdC4ydrM')
    expect(parseYouTubeId('https://m.youtube.com/watch?app=desktop&v=0djrkdEifbg')).toBe('0djrkdEifbg')
    expect(parseYouTubeId('https://youtu.be/_qC3YtnRE2k?si=x')).toBe('_qC3YtnRE2k')
    expect(parseYouTubeId('https://www.youtube-nocookie.com/embed/Gkk-6q7Rq-s')).toBe('Gkk-6q7Rq-s')
    expect(parseYouTubeId('ljyqdC4ydrM')).toBe('ljyqdC4ydrM')
  })

  it('rejects anything else', () => {
    expect(parseYouTubeId('https://instagram.com/reel/abc')).toBeNull()
    expect(parseYouTubeId('hello')).toBeNull()
  })
})
