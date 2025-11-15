import React, { useState, useEffect } from 'react';
import { FurnitureModel, FurnitureElement, Dimensions, ConstructorProps } from '../types/furniture';
import { furnitureAPI } from '../services/api';
import Simple3DPreview from './Simple3DPreview';

// Сначала обновим типы, добавив rotation в FurnitureElement
interface FurnitureElementWithRotation extends FurnitureElement {
    rotation: { x: number; y: number; z: number };
}

// Обновляем пропсы для Simple3DPreview
interface Simple3DPreviewProps {
    model: FurnitureModel;
    activeElement: FurnitureElementWithRotation | null;
    onElementSelect: (element: FurnitureElementWithRotation | null) => void;
    viewRotation: { x: number; y: number };
    onViewRotate: (rotation: { x: number; y: number }) => void;
}

const FurnitureConstructor: React.FC<ConstructorProps> = ({
                                                              baseModel,
                                                              availableMaterials,
                                                              availableColors,
                                                              onSave,
                                                              onClose,
                                                              isOpen = true,
                                                          }) => {
    const [model, setModel] = useState<FurnitureModel>(baseModel);
    const [activeElement, setActiveElement] = useState<FurnitureElementWithRotation | null>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const [viewRotation, setViewRotation] = useState({ x: 0, y: 0 });

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

    const handleDimensionChange = (newDimensions: Dimensions) => {
        updateModel({ dimensions: newDimensions });
    };

    const handleElementChange = (elementId: string, updates: Partial<FurnitureElement>) => {
        const updatedElements = model.elements.map(el =>
            el.id === elementId ? { ...el, ...updates } : el
        );

        updateModel({ elements: updatedElements });

        // Обновляем активный элемент чтобы изменения сразу отображались
        if (activeElement && activeElement.id === elementId) {
            setActiveElement({ ...activeElement, ...updates } as FurnitureElementWithRotation);
        }
    };

    const handleElementRotation = (elementId: string, axis: 'x' | 'y' | 'z', value: number) => {
        if (!activeElement) return;

        const updatedRotation = {
            ...activeElement.rotation,
            [axis]: value
        };

        const elementUpdates = {
            ...activeElement,
            rotation: updatedRotation
        };

        handleElementChange(elementId, elementUpdates);
    };

    const handleShelfAdd = () => {
        const newShelf: FurnitureElementWithRotation = {
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
        } as FurnitureElementWithRotation;

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

    const handleShelfPositionChange = (shelfId: string, newY: number) => {
        const shelf = model.elements.find(el => el.id === shelfId);
        if (!shelf) return;

        handleElementChange(shelfId, {
            position: { ...shelf.position, y: newY }
        });
    };

    // Вспомогательная функция для безопасного доступа к rotation
    const getElementRotation = (element: FurnitureElement | null) => {
        if (!element) return { x: 0, y: 0, z: 0 };

        // Проверяем, есть ли rotation в элементе
        const elementWithRotation = element as FurnitureElementWithRotation;
        return elementWithRotation.rotation || { x: 0, y: 0, z: 0 };
    };

    // Обработчик выбора элемента
    const handleElementSelect = (element: FurnitureElementWithRotation | null) => {
        setActiveElement(element);
    };

    // Обработчик вращения вида
    const handleViewRotate = (rotation: { x: number; y: number }) => {
        setViewRotation(rotation);
    };

    const renderEditPanel = () => {
        const shelves = model.elements.filter(el => el.type === 'shelf');
        const activeElementRotation = getElementRotation(activeElement);

        return (
            <div className="constructor-edit-panel" style={{ height: '100%', overflowY: 'auto' }}>
                <h3 className="title is-4">Редактирование</h3>

                {/* Общие размеры */}
                <div className="box">
                    <h4 className="title is-5">📐 Общие размеры (см)</h4>
                    {[
                        { key: 'width', label: 'Ширина', min: 50, max: 500 },
                        { key: 'height', label: 'Высота', min: 50, max: 300 },
                        { key: 'depth', label: 'Глубина', min: 30, max: 200 }
                    ].map(({ key, label, min, max }) => (
                        <div className="field" key={key}>
                            <label className="label">{label}</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    value={model.dimensions[key as keyof Dimensions]}
                                    onChange={(e) => handleDimensionChange({
                                        ...model.dimensions,
                                        [key]: Math.max(min, Math.min(max, +e.target.value))
                                    })}
                                    min={min}
                                    max={max}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Редактирование активного элемента */}
                {activeElement && activeElement.canBeModified && (
                    <div className="box">
                        <h4 className="title is-5">🎨 Редактирование: {activeElement.name}</h4>

                        <div className="field">
                            <label className="label">Материал</label>
                            <div className="control">
                                <div className="select is-fullwidth">
                                    <select
                                        value={activeElement.material}
                                        onChange={(e) => handleElementChange(activeElement.id, { material: e.target.value })}
                                    >
                                        {availableMaterials.map(material => (
                                            <option key={material} value={material}>{material}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Цвет</label>
                            <div className="control">
                                <div className="select is-fullwidth">
                                    <select
                                        value={activeElement.color}
                                        onChange={(e) => handleElementChange(activeElement.id, { color: e.target.value })}
                                    >
                                        {availableColors.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Вращение элемента */}
                        <div className="box">
                            <h5 className="title is-6">🔄 Вращение элемента (градусы)</h5>
                            {['x', 'y', 'z'].map(axis => (
                                <div className="field" key={axis}>
                                    <label className="label">Ось {axis.toUpperCase()}</label>
                                    <div className="control">
                                        <input
                                            className="slider is-fullwidth"
                                            type="range"
                                            min="-180"
                                            max="180"
                                            value={activeElementRotation[axis as keyof typeof activeElementRotation]}
                                            onChange={(e) => handleElementRotation(activeElement.id, axis as 'x' | 'y' | 'z', +e.target.value)}
                                        />
                                    </div>
                                    <p className="help">
                                        {activeElementRotation[axis as keyof typeof activeElementRotation]}°
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Позиция для полок */}
                        {activeElement.type === 'shelf' && (
                            <div className="field">
                                <label className="label">Высота положения: {activeElement.position.y} см</label>
                                <div className="control">
                                    <input
                                        className="slider is-fullwidth"
                                        type="range"
                                        min="0"
                                        max={model.dimensions.height}
                                        value={activeElement.position.y}
                                        onChange={(e) => handleShelfPositionChange(activeElement.id, +e.target.value)}
                                    />
                                </div>
                                <div className="is-flex is-justify-content-space-between">
                                    <span className="help">0 см</span>
                                    <span className="help">{model.dimensions.height} см</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Управление полками для шкафов */}
                {shelves.length > 0 && (
                    <div className="box">
                        <h4 className="title is-5">📚 Управление полками</h4>
                        <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
                            <span className="has-text-weight-semibold">
                                Всего полок: <span className="tag is-info">{shelves.length}</span>
                            </span>
                            <button onClick={handleShelfAdd} className="button is-info is-small">
                                <span className="icon">
                                    <i className="fas fa-plus"></i>
                                </span>
                                <span>Добавить</span>
                            </button>
                        </div>

                        <div className="shelves-list">
                            {shelves.map(shelf => (
                                <div key={shelf.id} className={`box is-flex is-justify-content-space-between is-align-items-center ${activeElement?.id === shelf.id ? 'has-background-primary-light' : ''}`}>
                                    <div>
                                        <div className="has-text-weight-medium">{shelf.name}</div>
                                        <div className="is-size-7">
                                            {shelf.color} • {shelf.material} • Высота: {shelf.position.y}см
                                        </div>
                                    </div>
                                    <div className="buttons">
                                        <button
                                            onClick={() => setActiveElement(shelf as FurnitureElementWithRotation)}
                                            className={`button is-small ${activeElement?.id === shelf.id ? 'is-warning' : 'is-light'}`}
                                            title="Редактировать"
                                        >
                                            <span className="icon">
                                                <i className="fas fa-edit"></i>
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleShelfRemove(shelf.id)}
                                            className="button is-small is-danger"
                                            disabled={shelves.length <= 1}
                                            title="Удалить"
                                        >
                                            <span className="icon">
                                                <i className="fas fa-trash"></i>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!activeElement && (
                    <div className="notification is-info is-light">
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
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card" style={{width: '95%', height: '90%'}}>
                <header className="modal-card-head">
                    <p className="modal-card-title">🎨 Конструктор мебели</p>
                    <button className="delete" aria-label="close" onClick={onClose}></button>
                </header>

                <section className="modal-card-body" style={{overflow: 'hidden'}}>
                    <div className="columns is-gapless" style={{height: '100%'}}>
                        <div className="column is-8">
                            <Simple3DPreview
                                model={model}
                                activeElement={activeElement}
                                onElementSelect={handleElementSelect}
                                viewRotation={viewRotation}
                                onViewRotate={handleViewRotate}
                            />
                        </div>
                        <div className="column is-4">
                            {renderEditPanel()}
                        </div>
                    </div>
                </section>

                <footer className="modal-card-foot is-justify-content-space-between">
                    <div className="total-price">
                        <strong>Итоговая цена: {model.totalPrice.toLocaleString()} руб.</strong>
                    </div>
                    <div className="buttons">
                        <button onClick={onClose} className="button">
                            Отмена
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`button is-primary ${saving ? 'is-loading' : ''}`}
                        >
                            Сохранить модель
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default FurnitureConstructor;