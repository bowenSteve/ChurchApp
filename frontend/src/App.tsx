import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LiveStateProvider } from './context/LiveStateProvider'
import DisplayPage from './routes/display/DisplayPage'
import LibraryPage from './routes/operator/LibraryPage'
import MassPlannerPage from './routes/operator/MassPlannerPage'
import OperatorLayout from './routes/operator/OperatorLayout'
import ScreensPage from './routes/operator/ScreensPage'
import SettingsPage from './routes/operator/SettingsPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LiveStateProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/operator" replace />} />
          <Route path="/operator" element={<OperatorLayout />}>
            <Route index element={<Navigate to="mass-planner" replace />} />
            <Route path="mass-planner" element={<MassPlannerPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="screens" element={<ScreensPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/display" element={<DisplayPage />} />
        </Routes>
      </LiveStateProvider>
    </QueryClientProvider>
  )
}
