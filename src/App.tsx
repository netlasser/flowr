import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import { AppShell } from './components/AppShell';
import { NotFound } from './components/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppShell />} />
      <Route path="/app/analytics" element={<AppShell />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default App;
