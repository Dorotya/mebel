import React, { useState, useRef, useCallback } from 'react';
import { FurnitureModel, FurnitureElement } from '../types/furniture';

interface Simple3DPreviewProps {
    model: FurnitureModel;
    activeElement: FurnitureElement | null;
    onElementSelect: (element: FurnitureElement) => void;
}

// Цветовая палитра для преобразования названий в HEX
const COLOR_MAP: { [key: string]: string } = {
    'белый': '#FFFFFF',
    'черный': '#000000',
    'серый': '#808080',
    'коричневый': '#8B4513',
    'бежевый': '#F5F5DC',
    'натуральный': '#DEB887',
    'дуб': '#D2B48C',
    'орех': '#A0522D',
    'бордовый': '#800000',
    'красный': '#FF0000',
    'синий': '#0000FF',
    'зеленый': '#008000',
};

// УВЕЛИЧЕННЫЕ КОНСТАНТЫ ДЛЯ МАСШТАБИРОВАНИЯ
const SCALE_CONFIG = {
    MIN_ELEMENT_SIZE: 15, // Увеличил минимальный размер элементов
    SCALE_FACTOR: 8, // Уменьшил коэффициент масштабирования (больше число = меньше элементы)
    SCENE_CENTER_X: 50,
    SCENE_CENTER_Y: 50,
    SCENE_WIDTH: 500, // Увеличил ширину сцены
    SCENE_HEIGHT: 500, // Увеличил высоту сцены
    MAX_SCENE_SCALE: 1.5, // Максимальный масштаб сцены
};

const Simple3DPreview: React.FC<Simple3DPreviewProps> = ({
                                                             model,
                                                             activeElement,
                                                             onElementSelect
                                                         }) => {
    const [rotation, setRotation] = useState({ x: 25, y: 45 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Функция для получения цвета по названию
    const getColor = useCallback((colorName: string): string => {
        return COLOR_MAP[colorName.toLowerCase()] || '#CCCCCC';
    }, []);

    // Функции для обработки вращения 3D модели
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setLastPosition({ x: e.clientX, y: e.clientY });
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastPosition.x;
        const deltaY = e.clientY - lastPosition.y;

        setRotation(prev => ({
            x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.5)),
            y: prev.y + deltaX * 0.5
        }));

        setLastPosition({ x: e.clientX, y: e.clientY });
    }, [isDragging, lastPosition]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleResetView = useCallback(() => {
        setRotation({ x: 25, y: 45 });
    }, []);

    // Функция для затемнения цвета
    const getDarkerColor = (color: string): string => {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 40);
        const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 40);
        const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 40);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // УВЕЛИЧЕННЫЙ РАСЧЕТ МАСШТАБА
    const calculateScale = useCallback(() => {
        const maxDimension = Math.max(
            model.dimensions.width,
            model.dimensions.height,
            model.dimensions.depth
        );
        // Уменьшил делитель для большего масштаба
        return Math.max(SCALE_CONFIG.SCALE_FACTOR, SCALE_CONFIG.SCENE_WIDTH / maxDimension * 1.5);
    }, [model.dimensions]);

    // Функция для преобразования 3D координат в 2D
    const project3DTo2D = useCallback((x: number, y: number, z: number, scale: number) => {
        // Простая изометрическая проекция
        const isoX = (x - z) * Math.cos(Math.PI / 6);
        const isoY = y + (x + z) * Math.sin(Math.PI / 6);

        return {
            left: SCALE_CONFIG.SCENE_CENTER_X + (isoX / scale),
            bottom: SCALE_CONFIG.SCENE_CENTER_Y + (isoY / scale)
        };
    }, []);

    // Функция рендера элементов мебели
    const renderElement = useCallback((element: FurnitureElement) => {
        const scale = calculateScale();
        const isActive = activeElement?.id === element.id;

        // УВЕЛИЧЕННЫЕ РАЗМЕРЫ ЭЛЕМЕНТОВ
        const width = Math.max(
            SCALE_CONFIG.MIN_ELEMENT_SIZE,
            element.dimensions.width / scale * 1.3 // Увеличил множитель
        );
        const height = Math.max(
            SCALE_CONFIG.MIN_ELEMENT_SIZE,
            element.dimensions.height / scale * 1.3 // Увеличил множитель
        );
        Math.max(
            SCALE_CONFIG.MIN_ELEMENT_SIZE,
            element.dimensions.depth / scale * 1.3 // Увеличил множитель
        );
// Позиционирование элемента в сцене с учетом 3D координат
        const position = project3DTo2D(
            element.position.x,
            element.position.y,
            element.position.z,
            scale
        );

        const baseColor = getColor(element.color);

        // Базовые стили для всех элементов
        const elementStyle: React.CSSProperties = {
            position: 'absolute',
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: baseColor,
            border: isActive ? '3px solid #3498db' : '2px solid #2c3e50', // Увеличил границу
            cursor: 'pointer',
            left: `${position.left}%`,
            bottom: `${position.bottom}%`,
            transform: 'translate(-50%, 50%)',
            boxShadow: isActive
                ? '0 0 20px rgba(52, 152, 219, 0.8), 0 4px 12px rgba(0,0,0,0.4)' // Увеличил тень
                : '0 4px 12px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            zIndex: isActive ? 1000 : Math.floor(element.position.y) + 100,
            opacity: 0.95,
            boxSizing: 'border-box',
        };

        // Специфичные стили для разных типов мебели с увеличенными размерами
        switch (element.type) {
            case 'tabletop':
                elementStyle.background = `linear-gradient(135deg, ${baseColor} 0%, ${getDarkerColor(baseColor)} 100%)`;
                elementStyle.borderRadius = '8px 8px 3px 3px'; // Увеличил радиус
                elementStyle.height = `${Math.max(12, height)}px`; // Увеличил минимальную высоту
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 200);
                break;

            case 'leg':
                elementStyle.background = `linear-gradient(to bottom, ${getDarkerColor(baseColor)} 0%, ${baseColor} 50%, ${getDarkerColor(baseColor)} 100%)`;
                elementStyle.width = `${Math.max(12, width)}px`; // Увеличил минимальную ширину
                elementStyle.height = `${Math.max(12, height)}px`; // Увеличил минимальную высоту
                elementStyle.borderRadius = '3px'; // Увеличил радиус
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 50);
                break;

            case 'shelf':
                elementStyle.background = `linear-gradient(to bottom, ${baseColor} 0%, ${getDarkerColor(baseColor)} 100%)`;
                elementStyle.borderTop = '2px solid rgba(255,255,255,0.4)'; // Увеличил границу
                elementStyle.borderRadius = '3px'; // Увеличил радиус
                elementStyle.height = `${Math.max(8, height)}px`; // Увеличил минимальную высоту
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 150);
                break;

            case 'body':
                elementStyle.background = `linear-gradient(135deg, ${baseColor} 0%, ${getDarkerColor(baseColor)} 100%)`;
                elementStyle.border = isActive ? '4px solid #3498db' : '3px solid #34495e'; // Увеличил границу
                elementStyle.borderRadius = '6px'; // Увеличил радиус
                elementStyle.width = `${Math.max(SCALE_CONFIG.MIN_ELEMENT_SIZE, element.dimensions.width / scale * 1.3)}px`;
                elementStyle.height = `${Math.max(SCALE_CONFIG.MIN_ELEMENT_SIZE, element.dimensions.height / scale * 1.3)}px`;
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 100);
                break;

            case 'back':
                elementStyle.background = `linear-gradient(to right, ${baseColor} 0%, ${getDarkerColor(baseColor)} 100%)`;
                elementStyle.borderRadius = '8px 8px 0 0'; // Увеличил радиус
                elementStyle.height = `${Math.max(16, height)}px`; // Увеличил минимальную высоту
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 120);
                break;

            case 'seat':
                elementStyle.background = `linear-gradient(to bottom, ${baseColor} 0%, ${getDarkerColor(baseColor)} 100%)`;
                elementStyle.borderRadius = '0 0 8px 8px'; // Увеличил радиус
                elementStyle.height = `${Math.max(14, height)}px`; // Увеличил минимальную высоту
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 110);
                break;

            case 'door':
                elementStyle.background = `linear-gradient(135deg, ${getDarkerColor(baseColor)} 0%, ${baseColor} 100%)`;
                elementStyle.border = '2px solid rgba(0,0,0,0.4)'; // Увеличил границу
                elementStyle.width = `${Math.max(8, width)}px`; // Увеличил минимальную ширину
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 130);
                break;

            case 'drawer':
                elementStyle.background = `linear-gradient(to bottom, ${baseColor} 0%, ${getDarkerColor(baseColor)} 100%)`;
                elementStyle.borderRadius = '3px'; // Увеличил радиус
                elementStyle.height = `${Math.max(8, height)}px`; // Увеличил минимальную высоту
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 90);
                break;

            case 'armrest':
                elementStyle.background = `linear-gradient(to right, ${baseColor} 0%, ${getDarkerColor(baseColor)} 100%)`;
                elementStyle.borderRadius = '6px'; // Увеличил радиус
                elementStyle.width = `${Math.max(12, width)}px`; // Увеличил минимальную ширину
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 95);
                break;

            default:
                elementStyle.borderRadius = '4px'; // Увеличил радиус
                elementStyle.zIndex = (isActive ? 1000 : Math.floor(element.position.y) + 80);
        }

        // Определение текстур материалов
        const hasWoodTexture = element.material.includes('дерево') ||
            element.material.includes('дуб') ||
            element.material.includes('орех') ||
            element.material.includes('массив');

        const hasFabricTexture = element.material.includes('ткань') ||
            element.material.includes('кожа') ||
            element.material.includes('велюр');

        const hasMetalTexture = element.material.includes('металл') ||
            element.material.includes('сталь') ||
            element.material.includes('хром');

        return (
            <div
                key={element.id}
                style={elementStyle}
                onClick={() => onElementSelect(element)}
                title={`${element.name}\nМатериал: ${element.material}\nЦвет: ${element.color}`}
                className={`preview-element ${element.type}`}
            >
                {/* Текстура дерева */}
                {hasWoodTexture && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, transparent 40%, ${getDarkerColor(baseColor)}20 50%, transparent 60%)`,
                        opacity: 0.5, // Увеличил прозрачность
                        pointerEvents: 'none',
                        borderRadius: elementStyle.borderRadius
                    }} />
                )}

                {/* Текстура ткани */}
                {hasFabricTexture && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `repeating-linear-gradient(45deg, transparent, transparent 2px, ${getDarkerColor(baseColor)}15 2px, ${getDarkerColor(baseColor)}15 4px)`, // Увеличил шаг
                        opacity: 0.4, // Увеличил прозрачность
                        pointerEvents: 'none',
                        borderRadius: elementStyle.borderRadius
                    }} />
                )}

                {/* Текстура металла */}
                {hasMetalTexture && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)`,
                        opacity: 0.6, // Увеличил прозрачность
                        pointerEvents: 'none',
                        borderRadius: elementStyle.borderRadius
                    }} />
                )}
            </div>
        );
    }, [activeElement, getColor, onElementSelect, calculateScale, project3DTo2D]);

    // УВЕЛИЧЕННЫЙ РАСЧЕТ МАСШТАБА СЦЕНЫ
    const sceneScale = Math.min(
        SCALE_CONFIG.MAX_SCENE_SCALE,
        600 / Math.max(
            model.dimensions.width,
            model.dimensions.height,
            model.dimensions.depth
        ) * 1.2 // Увеличил множитель
    );

    return (
        <div className="simple-3d-preview">
            {/* Заголовок и статистика */}
            <div className="preview-header">
                <h3>3D Предпросмотр</h3>
                <div className="preview-stats">
                    <span>Элементов: {model.elements.length}</span>
                    <span>Масштаб: {Math.round(sceneScale * 100)}%</span>
                </div>
            </div>

            {/* Панель управления вращением */}
            <div className="preview-controls">
                <div className="rotation-info">
                    <span>🎯 Управление:</span>
                    <div className="rotation-values">
                        Наклон: {Math.round(rotation.x)}° | Поворот: {Math.round(rotation.y)}°
                    </div>
                </div>
                <div className="control-buttons">
                    <button
                        className="btn btn-small btn-secondary"
                        onClick={handleResetView}
                        title="Сбросить вид к начальному положению"
                    >
                        🔄 Сброс
                    </button>
                </div>
            </div>

            {/* 3D сцена с увеличенным масштабом */}
            <div
                ref={containerRef}
                className="preview-scene"
                style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${sceneScale})`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    width: `${SCALE_CONFIG.SCENE_WIDTH}px`,
                    height: `${SCALE_CONFIG.SCENE_HEIGHT}px`,
                    position: 'relative',
                    margin: '0 auto',
                    minHeight: '400px' // Увеличил минимальную высоту
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Сетка пола для ориентира */}
                <div className="floor-grid" style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    height: '2px', // Увеличил высоту
                    background: 'linear-gradient(90deg, transparent 0%, #3498db 50%, transparent 100%)',
                    opacity: 0.4 // Увеличил прозрачность
                }} />

                {/* Центральная точка */}
                <div className="center-point" style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '50%',
                    width: '6px', // Увеличил размер
                    height: '6px', // Увеличил размер
                    backgroundColor: '#e74c3c',
                    borderRadius: '50%',
                    transform: 'translate(-50%, 50%)'
                }} />

                {/* Все элементы мебели */}
                {model.elements.map(renderElement)}
            </div>

            {/* Информационная панель */}
            <div className="preview-info">
                <div className="info-grid">
                    <div className="dimensions">
                        <span className="info-label">📏 Габариты:</span>
                        <span className="info-value">
                            {model.dimensions.width} × {model.dimensions.height} × {model.dimensions.depth} см
                        </span>
                    </div>
                    <div className="price">
                        <span className="info-label">💰 Стоимость:</span>
                        <span className="info-value">{model.totalPrice.toLocaleString()} руб.</span>
                    </div>
                </div>

                {/* Информация о выбранном элементе */}
                {activeElement && (
                    <div className="active-element-info">
                        <div className="active-header">
                            <strong>🎯 Выбранный элемент</strong>
                        </div>
                        <div className="active-details">
                            <span><strong>Название:</strong> {activeElement.name}</span>
                            <span><strong>Материал:</strong> {activeElement.material}</span>
                            <span><strong>Цвет:</strong> {activeElement.color}</span>
                            <span><strong>Тип:</strong> {activeElement.type}</span>
                            <span><strong>Размеры:</strong> {activeElement.dimensions.width} × {activeElement.dimensions.height} × {activeElement.dimensions.depth} см</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Simple3DPreview;