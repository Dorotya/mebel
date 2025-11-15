import React from 'react';
import { Link } from 'react-router-dom'; // Убрали лишние скобки

const Header: React.FC = () => {
    return (
        <header className="header">
            <nav>
                <Link to="/">Мебельный Магазин</Link>
                <ul>
                    <li><Link to="/catalog">Каталог</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;