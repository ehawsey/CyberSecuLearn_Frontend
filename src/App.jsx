import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Dynamic imports for code splitting
const LandingPage = React.lazy(() => import('./components/landing_page'));
const LoginForm = React.lazy(() => import('./components/login_form'));
const UserProfile = React.lazy(() => import('./components/user_profile'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/learn" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
