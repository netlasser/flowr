import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import { AppShell } from './components/AppShell';
import { NotFound } from './components/NotFound';
import { RequireAuth } from './components/auth/RequireAuth';
import AuthPage from './components/auth/AuthPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>} />
      <Route path="/app/analytics" element={<RequireAuth><AppShell /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default App;
