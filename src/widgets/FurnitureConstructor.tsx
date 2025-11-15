import React, { useState, useEffect } from 'react';
import { FurnitureModel, FurnitureElement, Dimensions, ConstructorProps } from '../types/furniture';
import { furnitureAPI } from '../services/api';
import Simple3DPreview from './Simple3DPreview';

const FurnitureConstructor: React.FC<ConstructorProps> = ({
                                                              baseModel,
                                                              availableMaterials,
                                                              availableColors,
                                                              onSave,
                                                              onClose,
                                                              isOpen = true,
                                                          }) => {
    const [model, setModel] = useState<FurnitureModel>(baseModel);
    const [activeElement, setActiveElement] = useState<FurnitureElement | null>(null);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        setModel(baseModel);
        setActiveElement(null);
    }, [baseModel]);

    const calculatePrice = (currentModel: FurnitureModel): number => {
        const basePrice = baseModel.totalPrice;
        let multiplier = 1.0;

        currentModel.elements.forEach(element => {
            switch (element.material) {
                case 'кожа': multiplier *= 1.5; break;
                case 'стекло': multiplier *= 1.3; break;
                case 'массив': multiplier *= 1.4; break;
                case 'металл': multiplier *= 1.2; break;
                default: multiplier *= 1.0;
            }

            switch (element.color) {
                case 'красный': multiplier *= 1.1; break;
                case 'синий': multiplier *= 1.1; break;
                case 'черный': multiplier *= 1.05; break;
                default: multiplier *= 1.0;
            }
        });

        return Math.round(basePrice * multiplier);
    };

    const updateModel = (updates: Partial<FurnitureModel>) => {
        const updatedModel = { ...model, ...updates };
        updatedModel.totalPrice = calculatePrice(updatedModel);
        setModel(updatedModel);
    };

    const handleSizeChange = (dimension: keyof Dimensions, value: number) => {
        const newDimensions = { ...model.dimensions, [dimension]: Math.max(10, value) };
        updateModel({ dimensions: newDimensions });
    };

    const handleElementChange = (updates: Partial<FurnitureElement>) => {
        if (!activeElement) return;

        const updatedElements = model.elements.map(el =>
            el.id === activeElement.id ? { ...el, ...updates } : el
        );

        updateModel({ elements: updatedElements });
        // Обновляем активный элемент чтобы изменения сразу отображались
        setActiveElement({ ...activeElement, ...updates });
    };

    const handleShelfAdd = () => {
        const newShelf: FurnitureElement = {
            id: `shelf-${Date.now()}`,
            name: `Полка ${model.elements.filter(el => el.type === 'shelf').length + 1}`,
            type: 'shelf',
            material: availableMaterials[0],
            color: availableColors[0],
            dimensions: {
                width: model.dimensions.width - 10,
                height: 2,
                depth: model.dimensions.depth - 10,
            },
            position: {
                x: 0,
                y: Math.round(model.dimensions.height / 2),
                z: 0
            },
            rotation: { x: 0, y: 0, z: 0 },
            canBeModified: true
        } as FurnitureElement;

        updateModel({
            elements: [...model.elements, newShelf]
        });
        setActiveElement(newShelf);
    };

    const handleShelfRemove = (shelfId: string) => {
        const updatedElements = model.elements.filter(el => el.id !== shelfId);
        updateModel({ elements: updatedElements });

        if (activeElement?.id === shelfId) {
            setActiveElement(null);
        }
    };

    const handleShelfPositionChange = (newY: number) => {
        if (!activeElement) return;

        handleElementChange({
            position: { ...activeElement.position, y: newY }
        });
    };

    const renderEditPanel = () => {
        const shelves = model.elements.filter(el => el.type === 'shelf');
        const isWardrobe = model.elements.some(el => el.type === 'shelf');

        return (
            <div className="settings-area">
                <h3>⚙️ Редактирование модели</h3>

                {/* Общие размеры */}
                <div className="settings-group">
                    <h4>📐 Общие размеры (см)</h4>
                    <div className="size-controls">
                        <div className="size-input">
                            <label>Ширина:</label>
                            <input
                                type="number"
                                value={model.dimensions.width}
                                onChange={(e) => handleSizeChange('width', +e.target.value)}
                                min="50"
                                max="500"
                            />
                        </div>
                        <div className="size-input">
                            <label>Высота:</label>
                            <input
                                type="number"
                                value={model.dimensions.height}
                                onChange={(e) => handleSizeChange('height', +e.target.value)}
                                min="50"
                                max="300"
                            />
                        </div>
                        <div className="size-input">
                            <label>Глубина:</label>
                            <input
                                type="number"
                                value={model.dimensions.depth}
                                onChange={(e) => handleSizeChange('depth', +e.target.value)}
                                min="30"
                                max="200"
                            />
                        </div>
                    </div>
                </div>

                {/* Редактирование активного элемента */}
                {activeElement && activeElement.canBeModified && (
                    <div className="settings-group">
                        <h4>🎨 Редактирование элемента</h4>
                        <div className="element-info">
                            <strong>{activeElement.name}</strong>
                        </div>

                        <div className="element-controls">
                            <div className="control-row">
                                <label>Материал:</label>
                                <select
                                    value={activeElement.material}
                                    onChange={(e) => handleElementChange({ material: e.target.value })}
                                >
                                    {availableMaterials.map(material => (
                                        <option key={material} value={material}>{material}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="control-row">
                                <label>Цвет:</label>
                                <select
                                    value={activeElement.color}
                                    onChange={(e) => handleElementChange({ color: e.target.value })}
                                >
                                    {availableColors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>

                            {activeElement.type === 'shelf' && (
                                <div className="control-row">
                                    <label>Высота положения: <strong>{activeElement.position.y} см</strong></label>
                                    <input
                                        type="range"
                                        min="0"
                                        max={model.dimensions.height}
                                        value={activeElement.position.y}
                                        onChange={(e) => handleShelfPositionChange(+e.target.value)}
                                    />
                                    <div className="range-labels">
                                        <span>0 см</span>
                                        <span>{model.dimensions.height} см</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Управление полками для шкафов */}
                {isWardrobe && (
                    <div className="settings-group">
                        <h4>📚 Управление полками</h4>
                        <div className="shelves-controls">
                            <button onClick={handleShelfAdd} className="add-btn">
                                ➕ Добавить полку
                            </button>
                            <div className="shelves-count">
                                Всего полок: <strong>{shelves.length}</strong>
                            </div>
                        </div>

                        <div className="shelves-list">
                            {shelves.map(shelf => (
                                <div key={shelf.id} className={`shelf-item ${activeElement?.id === shelf.id ? 'active' : ''}`}>
                                    <div className="shelf-info">
                                        <span className="shelf-name">{shelf.name}</span>
                                        <span className="shelf-details">{shelf.color} • {shelf.material}</span>
                                        <span className="shelf-position">Высота: {shelf.position.y} см</span>
                                    </div>
                                    <div className="shelf-actions">
                                        <button
                                            onClick={() => setActiveElement(shelf)}
                                            className="edit-btn"
                                            title="Редактировать"
                                        >
                                            {activeElement?.id === shelf.id ? '✅' : '✏️'}
                                        </button>
                                        <button
                                            onClick={() => handleShelfRemove(shelf.id)}
                                            className="delete-btn"
                                            disabled={shelves.length <= 1}
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!activeElement && (
                    <div className="settings-group hint">
                        <p>👆 Выберите элемент в 3D предпросмотре для редактирования</p>
                        <small>Кликните на любой элемент мебели чтобы изменить его материал и цвет</small>
                    </div>
                )}
            </div>
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const savedModel = await furnitureAPI.saveCustomModel(model);
            onSave(savedModel);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка при сохранении модели.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="constructor-overlay">
            <div className="constructor-modal">
                <header className="constructor-header">
                    <h2>🎨 Конструктор мебели</h2>
                    <button onClick={onClose} className="close-btn" title="Закрыть">
                        ×
                    </button>
                </header>

                <div className="constructor-content">
                    <div className="preview-area">
                        <Simple3DPreview
                            model={model}
                            activeElement={activeElement}
                            onElementSelect={setActiveElement}
                        />
                    </div>
                    {renderEditPanel()}
                </div>

                <footer className="constructor-footer">
                    <div className="total-price">
                        Итоговая цена: <span>{model.totalPrice.toLocaleString()} руб.</span>
                    </div>
                    <div className="action-buttons">
                        <button onClick={onClose} className="cancel-btn">
                            Отмена
                        </button>
                        <button onClick={handleSave} disabled={saving} className="save-btn">
                            {saving ? 'Сохранение...' : '💾 Сохранить модель'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default FurnitureConstructor;