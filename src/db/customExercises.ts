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
  },
  {
    id: 'Custom_Wide_Leg_Press',
    name: 'Wide Leg Press (Feet High)',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['adductors', 'quadriceps', 'hamstrings'],
    equipment: 'machine',
    category: 'strength',
    images: ['Leg_Press/0.jpg'],
    instructions: [
      'Sit in the leg press with your feet high on the platform, wider than shoulder width, toes turned out slightly.',
      'Unlock the sled and lower it until your hips are about to lift off the seat, keeping your knees in line with your toes.',
      'Push through your heels to straighten your legs without locking your knees, squeezing your glutes at the top.'
    ]
  },
  {
    id: 'Custom_Single_Arm_DB_RDL',
    name: 'Single-Arm Dumbbell RDL (Single Leg)',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['glutes'],
    equipment: 'dumbbell',
    category: 'strength',
    images: ['Kettlebell_One-Legged_Deadlift/0.jpg'],
    instructions: [
      'Stand on one leg with a slight knee bend, holding a dumbbell in the opposite hand.',
      'Hinge at the hip, reaching the dumbbell toward the floor while the free leg travels straight back; keep your hips square.',
      'Lower until you feel a strong hamstring stretch, then drive the hip forward to stand tall. Do every rep on one leg, then switch.'
    ]
  }
]

export const CUSTOM_EXERCISE_IDS = new Set(CUSTOM_EXERCISES.map(exercise => exercise.id))
