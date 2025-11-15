import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FurnitureItem } from '../types/furniture';
import { furnitureAPI } from '../services/api';
import Loader from '../components/common/Loader';
import FurnitureConstructor from '../widgets/FurnitureConstructor';

const ProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<FurnitureItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isConstructorOpen, setIsConstructorOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>('');

    useEffect(() => {
        const loadItem = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await furnitureAPI.getItemById(id);
                setItem(data);
                setSelectedImage(data.image); // Устанавливаем главное изображение по умолчанию
            } catch (err) {
                setError('Товар не найден.');
            } finally {
                setLoading(false);
            }
        };
        loadItem();
    }, [id]);

    const handleOpenConstructor = () => {
        setIsConstructorOpen(true);
    };

    const handleCloseConstructor = () => {
        setIsConstructorOpen(false);
    };

    const handleSaveConstructor = (model: any) => {
        console.log('Сохраненная модель:', model);
        handleCloseConstructor();
    };

    if (loading) return <Loader />;
    if (error) return <div className="error">{error}</div>;
    if (!item) return <div>Товар не найден.</div>;

    return (
        <div className="product-page">
            {isConstructorOpen && item && (
                <FurnitureConstructor
                    baseModel={item.defaultModel}
                    availableMaterials={item.availableMaterials}
                    availableColors={item.availableColors}
                    onSave={handleSaveConstructor}
                    onClose={handleCloseConstructor}
                    isOpen={isConstructorOpen}
                />
            )}

            <div className="product-layout">
                <div className="product-gallery">
                    <div className="main-image">
                        <img src={selectedImage} alt={item.name} />
                    </div>
                    <div className="gallery-thumbnails">
                        <img
                            src={item.image}
                            alt="Основное"
                            className={selectedImage === item.image ? 'active' : ''}
                            onClick={() => setSelectedImage(item.image)}
                        />
                        {item.gallery.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${item.name} ${index + 1}`}
                                className={selectedImage === img ? 'active' : ''}
                                onClick={() => setSelectedImage(img)}
                            />
                        ))}
                    </div>
                </div>

                <div className="product-info">
                    <h1>{item.name}</h1>
                    <p className="product-type">Тип: {item.type}</p>
                    <p className="product-color">Цвет: {item.color}</p>
                    <p className="product-price">Цена: {item.price.toLocaleString()} руб.</p>

                    <div className="product-description">
                        <h3>Описание</h3>
                        <p>{item.description}</p>
                    </div>

                    <div className="product-details">
                        <h3>Характеристики</h3>
                        <ul>
                            <li>Ширина: {item.defaultModel.dimensions.width} см</li>
                            <li>Высота: {item.defaultModel.dimensions.height} см</li>
                            <li>Глубина: {item.defaultModel.dimensions.depth} см</li>
                            <li>Доступные материалы: {item.availableMaterials.join(', ')}</li>
                            <li>Доступные цвета: {item.availableColors.join(', ')}</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleOpenConstructor}
                        className="btn btn-large btn-constructor"
                    >
                        🛠️ Собрать в конструкторе
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;