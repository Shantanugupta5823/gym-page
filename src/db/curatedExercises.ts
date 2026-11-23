import type { MuscleGroup } from '../lib/muscles.ts'

// Curated from free-exercise-db ids, most useful first, one list per body-map muscle.
// An exercise is listed once, under the muscle it mostly trains; the dataset has few neck, trap and adductor options
export const CURATED_EXERCISES: Record<MuscleGroup, string[]> = {
  Neck: [
    'Lying_Face_Up_Plate_Neck_Resistance', 'Lying_Face_Down_Plate_Neck_Resistance',
    'Isometric_Neck_Exercise_-_Front_And_Back', 'Isometric_Neck_Exercise_-_Sides', 'Seated_Head_Harness_Neck_Resistance'
  ],
  Traps: ['Barbell_Shrug', 'Dumbbell_Shrug', 'Upright_Barbell_Row'],
  Shoulders: [
    'Standing_Military_Press', 'Seated_Dumbbell_Press', 'Arnold_Dumbbell_Press', 'Machine_Shoulder_Military_Press',
    'Seated_Barbell_Military_Press', 'Dumbbell_Shoulder_Press', 'Smith_Machine_Overhead_Shoulder_Press',
    'Side_Lateral_Raise', 'Cable_Seated_Lateral_Raise', 'Seated_Side_Lateral_Raise',
    'Standing_Low-Pulley_Deltoid_Raise', 'One-Arm_Side_Laterals', 'Front_Two-Dumbbell_Raise', 'Front_Cable_Raise'
  ],
  'Rear delts': [
    'Face_Pull', 'Cable_Rear_Delt_Fly', 'Reverse_Flyes', 'Reverse_Machine_Flyes',
    'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench'
  ],
  Chest: [
    'Barbell_Bench_Press_-_Medium_Grip', 'Incline_Dumbbell_Press', 'Dumbbell_Bench_Press',
    'Barbell_Incline_Bench_Press_-_Medium_Grip', 'Dips_-_Chest_Version', 'Cable_Crossover', 'Butterfly',
    'Dumbbell_Flyes', 'Incline_Dumbbell_Flyes', 'Leverage_Chest_Press', 'Leverage_Incline_Chest_Press',
    'Decline_Barbell_Bench_Press', 'Decline_Dumbbell_Bench_Press', 'Low_Cable_Crossover', 'Incline_Cable_Flye',
    'Flat_Bench_Cable_Flyes', 'Smith_Machine_Bench_Press', 'Pushups', 'Machine_Bench_Press',
    'Straight-Arm_Dumbbell_Pullover'
  ],
  Back: [
    'Pullups', 'Chin-Up', 'Wide-Grip_Lat_Pulldown', 'Bent_Over_Barbell_Row', 'Seated_Cable_Rows', 'One-Arm_Dumbbell_Row',
    'T-Bar_Row_with_Handle', 'Close-Grip_Front_Lat_Pulldown', 'V-Bar_Pulldown',
    'Underhand_Cable_Pulldowns', 'Straight-Arm_Pulldown', 'Lying_T-Bar_Row', 'Leverage_High_Row',
    'Leverage_Iso_Row', 'Smith_Machine_Bent_Over_Row', 'Bent_Over_Two-Dumbbell_Row'
  ],
  'Lower back': ['Barbell_Deadlift', 'Hyperextensions_Back_Extensions', 'Stiff_Leg_Barbell_Good_Morning'],
  Biceps: [
    'Barbell_Curl', 'EZ-Bar_Curl', 'Dumbbell_Bicep_Curl', 'Hammer_Curls', 'Incline_Dumbbell_Curl', 'Preacher_Curl',
    'Machine_Preacher_Curls', 'Cable_Hammer_Curls_-_Rope_Attachment', 'Standing_Biceps_Cable_Curl',
    'Concentration_Curls', 'Spider_Curl', 'Dumbbell_Alternate_Bicep_Curl', 'Cross_Body_Hammer_Curl', 'Zottman_Curl',
    'Machine_Bicep_Curl', 'Cable_Preacher_Curl', 'High_Cable_Curls', 'One_Arm_Dumbbell_Preacher_Curl',
    'Close-Grip_EZ_Bar_Curl', 'Lying_Cable_Curl'
  ],
  Triceps: [
    'Triceps_Pushdown', 'Triceps_Pushdown_-_Rope_Attachment', 'Triceps_Pushdown_-_V-Bar_Attachment',
    'Cable_Rope_Overhead_Triceps_Extension', 'EZ-Bar_Skullcrusher', 'Close-Grip_Barbell_Bench_Press',
    'Dips_-_Triceps_Version', 'Dip_Machine', 'Machine_Triceps_Extension', 'Standing_Overhead_Barbell_Triceps_Extension',
    'Lying_Triceps_Press', 'Tricep_Dumbbell_Kickback', 'Bench_Dips', 'Reverse_Grip_Triceps_Pushdown',
    'Cable_One_Arm_Tricep_Extension', 'Seated_Triceps_Press', 'Dumbbell_One-Arm_Triceps_Extension',
    'Close-Grip_Dumbbell_Press', 'JM_Press', 'Cable_Lying_Triceps_Extension'
  ],
  Forearms: [
    'Reverse_Barbell_Curl', 'Standing_Dumbbell_Reverse_Curl', 'Reverse_Cable_Curl',
    'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench', 'Palms-Down_Wrist_Curl_Over_A_Bench',
    'Seated_Dumbbell_Palms-Up_Wrist_Curl', 'Seated_Dumbbell_Palms-Down_Wrist_Curl',
    'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench', 'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench', 'Cable_Wrist_Curl',
    'Wrist_Roller', 'Plate_Pinch', 'Finger_Curls', 'Standing_Olympic_Plate_Hand_Squeeze',
    'Seated_One-Arm_Dumbbell_Palms-Up_Wrist_Curl', 'Seated_One-Arm_Dumbbell_Palms-Down_Wrist_Curl',
    'Seated_Palm-Up_Barbell_Wrist_Curl', 'Seated_Palms-Down_Barbell_Wrist_Curl', 'Dumbbell_Lying_Supination',
    'Dumbbell_Lying_Pronation'
  ],
  Abs: [
    'Cable_Crunch', 'Hanging_Leg_Raise', 'Ab_Crunch_Machine', 'Crunches', 'Decline_Crunch', 'Reverse_Crunch', 'Plank',
    'Ab_Roller', 'Barbell_Ab_Rollout', 'Flat_Bench_Lying_Leg_Raise', 'Knee_Hip_Raise_On_Parallel_Bars',
    'Cable_Reverse_Crunch', 'Air_Bike', 'Dead_Bug'
  ],
  Obliques: ['Standing_Cable_Wood_Chop', 'Pallof_Press', 'Russian_Twist', 'Dumbbell_Side_Bend', 'Oblique_Crunches', 'Side_Bridge'],
  Glutes: [
    'Barbell_Hip_Thrust', 'Barbell_Glute_Bridge', 'Single_Leg_Glute_Bridge', 'Glute_Kickback',
    'One-Legged_Cable_Kickback', 'Pull_Through', 'Butt_Lift_Bridge', 'Step-up_with_Knee_Raise', 'Thigh_Abductor',
    'Reverse_Hyperextension'
  ],
  Quads: [
    'Barbell_Full_Squat', 'Front_Squat_Clean_Grip', 'Hack_Squat', 'Leg_Press', 'Leg_Extensions', 'Dumbbell_Lunges',
    'Barbell_Lunge', 'Barbell_Walking_Lunge', 'Split_Squat_with_Dumbbells', 'Goblet_Squat', 'Dumbbell_Squat',
    'Smith_Machine_Squat', 'Barbell_Step_Ups', 'Dumbbell_Step_Ups', 'Narrow_Stance_Leg_Press',
    'Single-Leg_Leg_Extension', 'Barbell_Hack_Squat', 'Dumbbell_Rear_Lunge', 'Smith_Machine_Leg_Press',
    'Wide_Stance_Barbell_Squat'
  ],
  Hamstrings: [
    'Romanian_Deadlift', 'Lying_Leg_Curls', 'Seated_Leg_Curl', 'Stiff-Legged_Barbell_Deadlift', 'Standing_Leg_Curl',
    'Stiff-Legged_Dumbbell_Deadlift', 'Natural_Glute_Ham_Raise', 'Smith_Machine_Stiff-Legged_Deadlift',
    'Kettlebell_One-Legged_Deadlift', 'Romanian_Deadlift_from_Deficit', 'Platform_Hamstring_Slides',
    'Seated_Band_Hamstring_Curl', 'Ball_Leg_Curl', 'One-Arm_Kettlebell_Swings'
  ],
  Adductors: ['Thigh_Adductor', 'Band_Hip_Adductions'],
  Calves: [
    'Standing_Calf_Raises', 'Seated_Calf_Raise', 'Calf_Press_On_The_Leg_Press_Machine', 'Calf_Press',
    'Donkey_Calf_Raises', 'Standing_Barbell_Calf_Raise', 'Smith_Machine_Calf_Raise', 'Standing_Dumbbell_Calf_Raise',
    'Barbell_Seated_Calf_Raise', 'Dumbbell_Seated_One-Leg_Calf_Raise', 'Calf_Raise_On_A_Dumbbell',
    'Rocking_Standing_Calf_Raise'
  ]
}

export type ExerciseLibrary = Record<string, string[]>

// Warm-up and stretch ids are kept out of the strength library so they never reach volume, PRs or muscle counts
export const WARMUP_EXERCISES: ExerciseLibrary = {
  Cardio: ['Walking_Treadmill', 'Rowing_Stationary', 'Elliptical_Trainer', 'Recumbent_Bike', 'Jogging_Treadmill', 'Fast_Skipping'],
  Mobility: [
    'Arm_Circles', 'Shoulder_Circles', 'Elbow_Circles', 'Wrist_Circles', 'Torso_Rotation', 'Standing_Hip_Circles',
    'Knee_Circles', 'Ankle_Circles', 'Inchworm', 'Worlds_Greatest_Stretch', 'Cat_Stretch', 'Band_Pull_Apart',
    'Windmills', 'Standing_Toe_Touches'
  ]
}

export const STRETCH_EXERCISES: ExerciseLibrary = {
  Chest: ['Behind_Head_Chest_Stretch', 'Chest_And_Front_Of_Shoulder_Stretch', 'Elbows_Back'],
  Back: ['Overhead_Lat', 'Childs_Pose', 'Middle_Back_Stretch', 'Upper_Back_Stretch', 'Spinal_Stretch', 'One_Arm_Against_Wall'],
  Shoulders: ['Shoulder_Stretch', 'Seated_Front_Deltoid'],
  Neck: ['Side_Neck_Stretch', 'Chin_To_Chest_Stretch'],
  Arms: ['Standing_Biceps_Stretch', 'Seated_Biceps', 'Triceps_Stretch', 'Tricep_Side_Stretch', 'Overhead_Triceps', 'Kneeling_Forearm_Stretch'],
  Quads: ['Quad_Stretch', 'Standing_Elevated_Quad_Stretch', 'On-Your-Back_Quad_Stretch', 'Kneeling_Hip_Flexor', 'Standing_Hip_Flexors'],
  Hamstrings: ['Hamstring_Stretch', 'Seated_Floor_Hamstring_Stretch', 'Standing_Hamstring_and_Calf_Stretch', 'Lying_Hamstring', '90_90_Hamstring'],
  Glutes: ['Seated_Glute', 'Knee_Across_The_Body', 'Lying_Glute', 'One_Knee_To_Chest', 'Hug_Knees_To_Chest'],
  Calves: ['Calf_Stretch_Hands_Against_Wall', 'Standing_Gastrocnemius_Calf_Stretch', 'Seated_Calf_Stretch', 'Standing_Soleus_And_Achilles_Stretch'],
  Abs: ['Standing_Lateral_Stretch', 'Seated_Overhead_Stretch', 'Overhead_Stretch']
}

export const PREP_EXERCISE_IDS = new Set([...Object.values(WARMUP_EXERCISES).flat(), ...Object.values(STRETCH_EXERCISES).flat()])
