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
        <div className="box">
            <h3 className="title is-4">Фильтры</h3>

            <div className="field">
                <label className="label">Тип мебели</label>
                <div className="control">
                    <div className="select is-fullwidth">
                        <select value={filters.type} onChange={handleTypeChange}>
                            <option value="">Все типы</option>
                            <option value="table">Столы</option>
                            <option value="sofa">Диваны</option>
                            <option value="wardrobe">Шкафы</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label">Цвет</label>
                <div className="control">
                    <input
                        className="input"
                        type="text"
                        value={filters.color}
                        onChange={handleColorChange}
                        placeholder="Введите цвет"
                    />
                </div>
            </div>

            <div className="field">
                <label className="label">Ширина: {filters.minWidth} - {filters.maxWidth} см</label>
                <div className="field is-grouped">
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="number"
                            value={filters.minWidth}
                            onChange={(e) => handleDimensionChange('minWidth', +e.target.value)}
                            placeholder="Мин"
                        />
                    </div>
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="number"
                            value={filters.maxWidth}
                            onChange={(e) => handleDimensionChange('maxWidth', +e.target.value)}
                            placeholder="Макс"
                        />
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label">Высота: {filters.minHeight} - {filters.maxHeight} см</label>
                <div className="field is-grouped">
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="number"
                            value={filters.minHeight}
                            onChange={(e) => handleDimensionChange('minHeight', +e.target.value)}
                            placeholder="Мин"
                        />
                    </div>
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="number"
                            value={filters.maxHeight}
                            onChange={(e) => handleDimensionChange('maxHeight', +e.target.value)}
                            placeholder="Макс"
                        />
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label">Глубина: {filters.minDepth} - {filters.maxDepth} см</label>
                <div className="field is-grouped">
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="number"
                            value={filters.minDepth}
                            onChange={(e) => handleDimensionChange('minDepth', +e.target.value)}
                            placeholder="Мин"
                        />
                    </div>
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="number"
                            value={filters.maxDepth}
                            onChange={(e) => handleDimensionChange('maxDepth', +e.target.value)}
                            placeholder="Макс"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogFilters;