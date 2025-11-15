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
                setSelectedImage(data.image);
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

    if (error) return (
        <div className="container mt-6">
            <div className="notification is-danger">
                <h4 className="title is-4">Ошибка</h4>
                <p>{error}</p>
            </div>
        </div>
    );

    if (!item) return (
        <div className="container mt-6">
            <div className="notification is-warning">
                <h4 className="title is-4">Товар не найден</h4>
            </div>
        </div>
    );

    return (
        <div className="container mt-4">
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

            <div className="columns">
                <div className="column is-6">
                    <div className="box">
                        <figure className="image is-4by3">
                            <img src={selectedImage} alt={item.name} />
                        </figure>

                        <div className="columns is-mobile is-multiline mt-3">
                            <div className="column is-3">
                                <figure
                                    className={`image is-4by3 gallery-thumbnail ${selectedImage === item.image ? 'is-active' : ''}`}
                                    onClick={() => setSelectedImage(item.image)}
                                >
                                    <img src={item.image} alt="Основное" />
                                </figure>
                            </div>
                            {item.gallery.map((img, index) => (
                                <div key={index} className="column is-3">
                                    <figure
                                        className={`image is-4by3 gallery-thumbnail ${selectedImage === img ? 'is-active' : ''}`}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={img} alt={`${item.name} ${index + 1}`} />
                                    </figure>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="column is-6">
                    <div className="box">
                        <h1 className="title is-2">{item.name}</h1>

                        <div className="tags are-medium mb-4">
                            <span className="tag is-primary">{item.type}</span>
                            <span className="tag is-info">{item.color}</span>
                        </div>

                        <p className="title is-3 has-text-primary">
                            {item.price.toLocaleString()} руб.
                        </p>

                        <div className="content">
                            <h3 className="title is-4">Описание</h3>
                            <p>{item.description}</p>

                            <h3 className="title is-4 mt-5">Характеристики</h3>
                            <div className="content">
                                <ul>
                                    <li><strong>Ширина:</strong> {item.defaultModel.dimensions.width} см</li>
                                    <li><strong>Высота:</strong> {item.defaultModel.dimensions.height} см</li>
                                    <li><strong>Глубина:</strong> {item.defaultModel.dimensions.depth} см</li>
                                    <li><strong>Материалы:</strong> {item.availableMaterials.join(', ')}</li>
                                    <li><strong>Цвета:</strong> {item.availableColors.join(', ')}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="field is-grouped">
                            <div className="control">
                                <button
                                    className="button is-primary is-large"
                                    onClick={handleOpenConstructor}
                                >
                  <span className="icon">
                    <i className="fas fa-hammer"></i>
                  </span>
                                    <span>Собрать в конструкторе</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;