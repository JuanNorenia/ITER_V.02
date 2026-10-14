import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import ContactPage from './pages/ContactPage'
import SiteLayout from './components/SiteLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
