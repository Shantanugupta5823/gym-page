import { Route, Routes } from 'react-router-dom'
import { Plan } from '@/screens/Plan'
import { Home } from '@/screens/Home'
import { Progress } from '@/screens/Progress'
import { ExerciseProgress } from '@/screens/ExerciseProgress'
import { Workout } from '@/screens/Workout'
import { Settings } from '@/screens/Settings'
import { BottomNav } from '@/components/BottomNav'
import { UpdateToast } from '@/components/UpdateToast'

export const App = () => (
  <div className="mx-auto min-h-dvh max-w-md pb-24">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workout" element={<Workout />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/progress/:exerciseId" element={<ExerciseProgress />} />
      <Route path="/plan" element={<Plan />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
    <BottomNav />
    <UpdateToast />
  </div>
)
