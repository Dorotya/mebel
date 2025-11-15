import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <Link className="navbar-item has-text-weight-bold is-size-4" to="/">
                    🛋️ Мебельный Магазин
                </Link>
            </div>

            <div className="navbar-menu">
                <div className="navbar-start">
                    <Link
                        className={`navbar-item ${location.pathname === '/catalog' ? 'is-active' : ''}`}
                        to="/catalog"
                    >
                        Каталог
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Header;