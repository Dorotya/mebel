import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Убрали лишние скобки
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import Header from './components/common/Header';
import './styles/App.css';

const App: React.FC = () => {
    return (
        <Router>
            <div className="app">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<CatalogPage />} />
                        <Route path="/catalog" element={<CatalogPage />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;