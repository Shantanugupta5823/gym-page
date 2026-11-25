// Short YouTube form tutorials (mostly Shorts) for every exercise in the seed plan, keyed by exercise id.
// They play inside the app; a different video can be set per exercise from the exercise viewer
export const TUTORIAL_VIDEOS: Record<string, string> = {
  // Chest
  Incline_Dumbbell_Press: 'ljyqdC4ydrM',
  Dumbbell_Bench_Press: 'SidmT09GXz8',
  Cable_Crossover: 'Jokaz7dBJNg',
  Butterfly: 'Cxbh9ofyR0s',
  Low_Cable_Crossover: 'MEZ8UPbOO08',
  // Triceps
  Cable_Rope_Overhead_Triceps_Extension: 'hzALkeq748Y',
  'Triceps_Pushdown_-_Rope_Attachment': '7OF77JMEXhM',
  'Triceps_Pushdown_-_V-Bar_Attachment': '34DTVaugne4',
  Machine_Triceps_Extension: '1AFJTda1btg',
  'Dips_-_Triceps_Version': 'J-vn-Tu-030',
  // Back
  Pullups: 'eDP_OOhMTZ4',
  'Wide-Grip_Lat_Pulldown': '02Qci1-0Aao',
  One_Arm_Lat_Pulldown: 'l3Ml4g83zIU',
  'Straight-Arm_Pulldown': 'lnec6DdscJU',
  Barbell_Deadlift: 'ZaTM37cfiDs',
  'T-Bar_Row_with_Handle': 'Cp2MJSa4UaE',
  Dumbbell_Incline_Row: '2ByilQ4NaAs',
  Barbell_Shrug: 'kcfReB2jAGE',
  // Shoulders and rear delts
  Seated_Dumbbell_Press: 'JmJzqda_0XQ',
  Machine_Shoulder_Military_Press: 'Gkk-6q7Rq-s',
  Side_Lateral_Raise: 'eaM8JxEn6Ig',
  Cable_Seated_Lateral_Raise: 'ZZYpkGiPcgk',
  Reverse_Machine_Flyes: 'BmJHBBZRpZg',
  Face_Pull: 'yj1w-EPj9tI',
  Custom_Prone_Y_Raise: 'mThc-orunTk',
  // Biceps and forearms
  Dumbbell_Bicep_Curl: 'MKWBV29S6c0',
  Incline_Dumbbell_Curl: 'S2cYwsDhpI4',
  Hammer_Curls: 'NyW2fT2gQhM',
  'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench': 'YeLmDP-Uj0E',
  'Palms-Down_Wrist_Curl_Over_A_Bench': 'jBwHPFy6uhs',
  Reverse_Barbell_Curl: '2lCrNqH2uaA',
  Farmers_Walk: 'G_Xm70e_OQ4',
  // Legs
  Barbell_Full_Squat: 'tNUq6b5t11Q',
  Hack_Squat: 'fUwfjzbyfWY',
  Leg_Press: 'EotSw18oR9w',
  Split_Squat_with_Dumbbells: 'iwV9rTHKrOg',
  Leg_Extensions: 'Tae3aeJe5Ks',
  Thigh_Adductor: 'fFrFuMN2q2Y',
  Thigh_Abductor: 'S_FGYHNHJ_c',
  Standing_Calf_Raises: 'yQZDGjL-xT4',
  Seated_Calf_Raise: 'prePsXTLWOs',
  Romanian_Deadlift: '35NpRFgFldo',
  Barbell_Hip_Thrust: 'RBK2ILhl58c',
  Lying_Leg_Curls: 'd6sg829PgNs',
  Seated_Leg_Curl: 'YpMJzmkFy2E',
  Natural_Glute_Ham_Raise: 'X-j0ZMDy-QE',
  // Abs
  Hanging_Leg_Raise: '0wSUjj5j1xo',
  Cable_Crunch: 'bd63yN6g_9w',
  Dead_Bug: 'kSYl6XOzQ5U',
  Standing_Cable_Wood_Chop: 'YIU0U_B57rU',
  Side_Bridge: 'cSIWldRoKTo',
  // Neck
  Lying_Face_Up_Plate_Neck_Resistance: 'U0sH-DhMIjw',
  Lying_Face_Down_Plate_Neck_Resistance: '_qC3YtnRE2k',
  'Isometric_Neck_Exercise_-_Sides': 'e6RXxE2FaMo',
  Custom_Chin_Tuck: 'IWrjp_B4ZgI',
  // Posture block A
  Band_Pull_Apart: 'U2aKexwAWfM',
  Custom_Wall_Slide: 'sZi0uT7wPXc',
  'Rhomboids-SMR': '_KVE3qEytJ4',
  Pelvic_Tilt_Into_Bridge: 'pJpchKUk2kc',
  Chest_And_Front_Of_Shoulder_Stretch: '3OfeaZEGJxE',
  Intermediate_Hip_Flexor_and_Quad_Stretch: 'uRe-JwwFUxU'
}

const VIDEO_ID = /^[\w-]{11}$/
const URL_PATTERNS = [
  /youtube\.com\/shorts\/([\w-]{11})/,
  /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
  /youtube\.com\/embed\/([\w-]{11})/,
  /youtube-nocookie\.com\/embed\/([\w-]{11})/,
  /youtu\.be\/([\w-]{11})/
]

// Accepts any YouTube or Shorts link (or a bare 11-character id) and returns the video id
export function parseYouTubeId (input: string): string | null {
  const text = input.trim()
  if (VIDEO_ID.test(text)) return text
  for (const pattern of URL_PATTERNS) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getTutorialId (exerciseId: string, overrides: Record<string, string>): string | null {
  return overrides[exerciseId] ?? TUTORIAL_VIDEOS[exerciseId] ?? null
}
