import { HashRouter, Route, Routes } from 'react-router-dom';
import { SurveyListPage } from './pages/SurveyListPage';
import { SurveyFormPage } from './pages/SurveyFormPage';
import { SurveyDetailPage } from './pages/SurveyDetailPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const { user, loading, configured } = useAuth();

  if (loading) {
    return <div className="page">Đang tải…</div>;
  }

  // When Firebase isn't configured yet, fall back to using the app without
  // login instead of hard-blocking the whole demo.
  if (configured && !user) {
    return <LoginPage configured={configured} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SurveyListPage user={user} />} />
        <Route path="/new" element={<SurveyFormPage user={user} />} />
        <Route path="/edit/:id" element={<SurveyFormPage user={user} />} />
        <Route path="/survey/:id" element={<SurveyDetailPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
