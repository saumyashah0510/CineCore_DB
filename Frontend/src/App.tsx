import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import ProjectDetail from './pages/ProjectDetail';
import AllProjects from './pages/AllProjects';
import TalentRegistry from './pages/TalentRegistry';
import Contracts from './pages/Contracts';
import Scripts from './pages/Scripts';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} /> 
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/all-projects" element={<AllProjects />} />
                <Route path="/talent" element={<TalentRegistry />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/scripts" element={<Scripts />} />
              </Routes>
            </AnimatePresence>
          </Layout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;