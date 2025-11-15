import axios from 'axios';
import { FurnitureItem, FurnitureModel } from '../types/furniture';

const API_BASE_URL = 'http://localhost:3001'; // Убедитесь, что порт 3001, а не 3801

// Создаем экземпляр axios с базовым URL
const api = axios.create({
    baseURL: API_BASE_URL,
});

export const furnitureAPI = {
    // Получить весь каталог
    async getCatalog(): Promise<FurnitureItem[]> {
        const response = await api.get<FurnitureItem[]>('/furniture');
        return response.data;
    },

    // Получить товар по ID
    async getItemById(id: string): Promise<FurnitureItem> {
        const response = await api.get<FurnitureItem>(`/furniture/${id}`);
        return response.data;
    },

    // Сохранить сконструированную модель
    async saveCustomModel(model: FurnitureModel): Promise<FurnitureModel> {
        const response = await api.post<FurnitureModel>('/customModels', model);
        return response.data;
    },
};