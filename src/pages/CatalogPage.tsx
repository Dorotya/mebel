import React, { useState, useEffect } from 'react';
import { FurnitureItem, FurnitureFilters, FurnitureType } from '../types/furniture';
import { furnitureAPI } from '../services/api';
import Loader from '../components/common/Loader';
import FurnitureCard from '../components/furniture/FurnitureCard';
import CatalogFilters from '../components/furniture/CatalogFilters';

const CatalogPage: React.FC = () => {
    const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
    const [filteredFurniture, setFilteredFurniture] = useState<FurnitureItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FurnitureFilters>({
        type: '',
        color: '',
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 300,
        minDepth: 0,
        maxDepth: 200,
    });

    useEffect(() => {
        const loadCatalog = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await furnitureAPI.getCatalog();
                setFurniture(data);
                setFilteredFurniture(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
                setError(`Ошибка при загрузке каталога: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };
        loadCatalog();
    }, []);

    useEffect(() => {
        let result = furniture;

        if (filters.type) {
            result = result.filter(item => item.type === filters.type);
        }

        if (filters.color) {
            result = result.filter(item =>
                item.color.toLowerCase().includes(filters.color.toLowerCase())
            );
        }

        result = result.filter(item => {
            const dim = item.defaultModel.dimensions;
            return (
                dim.width >= filters.minWidth &&
                dim.width <= filters.maxWidth &&
                dim.height >= filters.minHeight &&
                dim.height <= filters.maxHeight &&
                dim.depth >= filters.minDepth &&
                dim.depth <= filters.maxDepth
            );
        });

        setFilteredFurniture(result);
    }, [filters, furniture]);

    const handleFilterChange = (newFilters: FurnitureFilters) => {
        setFilters(newFilters);
    };

    if (loading) return <Loader />;

    if (error) return (
        <div className="container mt-6">
            <div className="notification is-danger">
                <button className="delete" onClick={() => setError(null)}></button>
                <h4 className="title is-4">Ошибка</h4>
                <p>{error}</p>
                <button
                    className="button is-danger mt-3"
                    onClick={() => window.location.reload()}
                >
                    Попробовать снова
                </button>
            </div>
        </div>
    );

    return (
        <div className="container mt-4">
            <div className="columns">
                <div className="column is-3">
                    <CatalogFilters filters={filters} onFilterChange={handleFilterChange} />
                </div>

                <div className="column is-9">
                    <div className="level">
                        <div className="level-left">
                            <h1 className="title is-2">Каталог мебели</h1>
                        </div>
                        <div className="level-right">
                            <p className="subtitle">
                                Найдено: <strong>{filteredFurniture.length}</strong> товаров
                            </p>
                        </div>
                    </div>

                    {filteredFurniture.length === 0 ? (
                        <div className="box has-text-centered">
              <span className="icon is-large has-text-grey-light mb-3">
                <i className="fas fa-search fa-2x"></i>
              </span>
                            <p className="title is-4 has-text-grey">Товары не найдены</p>
                            <p className="subtitle has-text-grey">
                                Попробуйте изменить параметры фильтрации
                            </p>
                        </div>
                    ) : (
                        <div className="columns is-multiline">
                            {filteredFurniture.map(item => (
                                <div key={item.id} className="column is-4">
                                    <FurnitureCard item={item} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogPage;