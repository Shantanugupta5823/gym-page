import type { Exercise } from './types.ts'

// Posture and neck drills that free-exercise-db does not have; they ship without an image
export const CUSTOM_EXERCISES: Exercise[] = [
  {
    id: 'Custom_Wall_Slide',
    name: 'Wall Slides',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['traps'],
    equipment: 'body only',
    category: 'stretching',
    images: [],
    instructions: [
      'Stand with your back, head and forearms against a wall, arms in a "W" with elbows at shoulder height.',
      'Slide your arms up into a "Y" while keeping your forearms and lower back against the wall.',
      'Pull your elbows back down to the "W", squeezing your shoulder blades down and together.'
    ]
  },
  {
    id: 'Custom_Chin_Tuck',
    name: 'Chin Tucks',
    primaryMuscles: ['neck'],
    secondaryMuscles: [],
    equipment: 'body only',
    category: 'strength',
    images: [],
    instructions: [
      'Stand or sit tall and look straight ahead.',
      'Glide your head straight back, making a double chin, without tilting it up or down.',
      'Hold for 3 seconds, then relax. Fixes forward head posture.'
    ]
  },
  {
    id: 'Custom_Prone_Y_Raise',
    name: 'Prone Y-Raise',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['traps'],
    equipment: 'dumbbell',
    category: 'strength',
    images: [],
    instructions: [
      'Lie face down on an incline bench with a light dumbbell in each hand, thumbs up.',
      'Raise your arms up and out into a "Y", leading with your thumbs, and squeeze your lower traps.',
      'Pause for 1 second at the top, then lower slowly.'
    ]
  }
]

export const CUSTOM_EXERCISE_IDS = new Set(CUSTOM_EXERCISES.map(exercise => exercise.id))
