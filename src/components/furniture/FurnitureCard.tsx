import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FurnitureItem } from '../../types/furniture';

interface FurnitureCardProps {
    item: FurnitureItem;
}

const FurnitureCard: React.FC<FurnitureCardProps> = ({ item }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'table': return 'Стол';
            case 'sofa': return 'Диван';
            case 'wardrobe': return 'Шкаф';
            default: return type;
        }
    };

    return (
        <div className="card furniture-card">
            <div className="card-image">
                <figure className="image is-4by3">
                    {imageError ? (
                        <div className="has-background-light has-text-centered is-flex is-align-items-center is-justify-content-center" style={{height: '100%'}}>
                            <div>
                <span className="icon is-large has-text-grey">
                  <i className="fas fa-image fa-2x"></i>
                </span>
                                <p className="has-text-grey">Изображение не загружено</p>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={item.image}
                            alt={item.name}
                            onError={handleImageError}
                        />
                    )}
                </figure>
            </div>

            <div className="card-content">
                <div className="content">
                    <h3 className="title is-5">{item.name}</h3>
                    <div className="tags are-small mb-2">
                        <span className="tag is-primary">{getTypeLabel(item.type)}</span>
                        <span className="tag is-info">{item.color}</span>
                    </div>
                    <p className="has-text-weight-semibold has-text-primary is-size-5">
                        {item.price.toLocaleString()} руб.
                    </p>

                    <Link
                        to={`/product/${item.id}`}
                        className="button is-primary is-fullwidth mt-3"
                    >
            <span className="icon">
              <i className="fas fa-info-circle"></i>
            </span>
                        <span>Подробнее</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FurnitureCard;