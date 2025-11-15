import React from 'react';
import { Link } from 'react-router-dom';
import { FurnitureItem } from '../../types/furniture';

interface FurnitureCardProps {
    item: FurnitureItem;
}

const FurnitureCard: React.FC<FurnitureCardProps> = ({ item }) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.src = 'https://via.placeholder.com/300x200/CCCCCC/666666?text=Изображение+не+найдено';
    };

    return (
        <div className="furniture-card">
            <img
                src={item.image}
                alt={item.name}
                onError={handleImageError}
            />
            <h3>{item.name}</h3>
            <p>Тип: {item.type}</p>
            <p>Цвет: {item.color}</p>
            <p>Цена: {item.price.toLocaleString()} руб.</p>
            <Link to={`/product/${item.id}`} className="btn btn-primary">
                Подробнее
            </Link>
        </div>
    );
};

export default FurnitureCard;