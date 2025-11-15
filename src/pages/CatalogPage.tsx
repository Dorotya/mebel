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

    // Загрузка данных
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
                console.error('Ошибка загрузки каталога:', err);
            } finally {
                setLoading(false);
            }
        };
        loadCatalog();
    }, []);

    // Применение фильтров при их изменении
    useEffect(() => {
        let result = furniture;

        if (filters.type) {
            result = result.filter(item => item.type === filters.type);
        }
        if (filters.color) {
            result = result.filter(item => item.color.toLowerCase().includes(filters.color.toLowerCase()));
        }

        // Фильтрация по всем размерам
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
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="catalog-page">
            <h1>Каталог мебели</h1>
            <div className="catalog-layout">
                <aside className="filters-sidebar">
                    <CatalogFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </aside>
                <section className="catalog-grid">
                    {filteredFurniture.length > 0 ? (
                        filteredFurniture.map(item => (
                            <FurnitureCard key={item.id} item={item} />
                        ))
                    ) : (
                        <div className="no-results">
                            <p>По вашему запросу ничего не найдено</p>
                            <button
                                onClick={() => setFilters({
                                    type: '',
                                    color: '',
                                    minWidth: 0,
                                    maxWidth: 500,
                                    minHeight: 0,
                                    maxHeight: 300,
                                    minDepth: 0,
                                    maxDepth: 200,
                                })}
                                className="reset-filters-btn"
                            >
                                Сбросить фильтры
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CatalogPage;