import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Market from './pages/Market';
import AgentDetail from './pages/AgentDetail';
import Dashboard from './pages/Dashboard';
import CreateAgent from './pages/CreateAgent';
import CreateSkill from './pages/CreateSkill'; 
import RegisterAgent from './pages/RegisterAgent';


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/agent/:id" element={<AgentDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateAgent />} />
          <Route path="/create-skill" element={<CreateSkill />} />
          <Route path="/register-agent" element={<RegisterAgent />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;