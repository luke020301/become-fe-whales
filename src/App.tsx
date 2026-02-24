import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MarketDetail from './pages/MarketDetail';
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: '#0A0A0B' }}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/market/:id" element={<MarketDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
