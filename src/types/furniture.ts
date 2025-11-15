// Базовый интерфейс для всей мебели в каталоге
export interface FurnitureItem {
    id: number;
    name: string;
    type: FurnitureType;
    color: string;
    price: number;
    image: string;
    description: string;
    gallery: string[];
    defaultModel: FurnitureModel;
    availableMaterials: string[]; // Доступные материалы для этой модели
    availableColors: string[]; // Доступные цвета
}

// Типы мебели
export type FurnitureType = 'table' | 'sofa' | 'wardrobe';

// Размеры
export interface Dimensions {
    width: number;
    height: number;
    depth: number;
}

// Позиция элемента в пространстве (для полок в шкафу)
export interface ElementPosition {
    x: number;
    y: number;
    z: number;
}

// Отдельный элемент мебели
export interface FurnitureElement {
    id: string;
    name: string;
    type: string;
    material: string;
    color: string;
    dimensions: Dimensions;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number }; // Добавьте это
    canBeModified: boolean;
}

// Модель мебели
export interface FurnitureModel {
    id?: number;
    baseItemId: number;
    name: string;
    elements: FurnitureElement[];
    dimensions: Dimensions;
    totalPrice: number; // Итоговая цена с учетом изменений
}

// Фильтры для каталога
export interface FurnitureFilters {
    type: FurnitureType | '';
    color: string;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    minDepth: number;
    maxDepth: number;
}

// Пропсы для конструктора
export interface ConstructorProps {
    baseModel: FurnitureModel;
    availableMaterials: string[];
    availableColors: string[];
    onSave: (model: FurnitureModel) => void;
    onClose: () => void;
    isOpen: boolean;
}