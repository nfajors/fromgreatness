import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import AssessmentsPage from './pages/AssessmentsPage'
import DnaUploadPage from './pages/DnaUploadPage'
import GapAnalysisPage from './pages/GapAnalysisPage'
import StudyPlansPage from './pages/StudyPlansPage'
import ParentDashboardPage from './pages/ParentDashboardPage'
import LearnPage from './pages/LearnPage'
import SettingsPage from './pages/SettingsPage'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/assessments" element={<AssessmentsPage />} />
      <Route path="/dna-upload" element={<DnaUploadPage />} />
      <Route path="/gap-analysis" element={<GapAnalysisPage />} />
      <Route path="/study-plans" element={<StudyPlansPage />} />
      <Route path="/parent-dashboard" element={<ParentDashboardPage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
