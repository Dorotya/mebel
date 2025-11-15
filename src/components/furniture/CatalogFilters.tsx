import React from 'react';
import { FurnitureFilters, FurnitureType } from '../../types/furniture';

interface CatalogFiltersProps {
    filters: FurnitureFilters;
    onFilterChange: (filters: FurnitureFilters) => void;
}

const CatalogFilters: React.FC<CatalogFiltersProps> = ({ filters, onFilterChange }) => {
    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({
            ...filters,
            type: event.target.value as FurnitureType | '',
        });
    };

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({
            ...filters,
            color: event.target.value,
        });
    };

    const handleDimensionChange = (field: string, value: number) => {
        onFilterChange({
            ...filters,
            [field]: value,
        });
    };

    return (
        <div className="catalog-filters">
            <h3>Фильтры</h3>

            <div className="filter-group">
                <label>Тип мебели:</label>
                <select value={filters.type} onChange={handleTypeChange}>
                    <option value="">Все типы</option>
                    <option value="table">Столы</option>
                    <option value="sofa">Диваны</option>
                    <option value="wardrobe">Шкафы</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Цвет:</label>
                <input
                    type="text"
                    value={filters.color}
                    onChange={handleColorChange}
                    placeholder="Введите цвет"
                />
            </div>

            <div className="filter-group">
                <label>Ширина: {filters.minWidth} - {filters.maxWidth} см</label>
                <div className="range-inputs">
                    <input
                        type="number"
                        value={filters.minWidth}
                        onChange={(e) => handleDimensionChange('minWidth', +e.target.value)}
                        placeholder="Мин"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        value={filters.maxWidth}
                        onChange={(e) => handleDimensionChange('maxWidth', +e.target.value)}
                        placeholder="Макс"
                    />
                </div>
            </div>

            <div className="filter-group">
                <label>Высота: {filters.minHeight} - {filters.maxHeight} см</label>
                <div className="range-inputs">
                    <input
                        type="number"
                        value={filters.minHeight}
                        onChange={(e) => handleDimensionChange('minHeight', +e.target.value)}
                        placeholder="Мин"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        value={filters.maxHeight}
                        onChange={(e) => handleDimensionChange('maxHeight', +e.target.value)}
                        placeholder="Макс"
                    />
                </div>
            </div>

            <div className="filter-group">
                <label>Глубина: {filters.minDepth} - {filters.maxDepth} см</label>
                <div className="range-inputs">
                    <input
                        type="number"
                        value={filters.minDepth}
                        onChange={(e) => handleDimensionChange('minDepth', +e.target.value)}
                        placeholder="Мин"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        value={filters.maxDepth}
                        onChange={(e) => handleDimensionChange('maxDepth', +e.target.value)}
                        placeholder="Макс"
                    />
                </div>
            </div>
        </div>
    );
};

export default CatalogFilters;