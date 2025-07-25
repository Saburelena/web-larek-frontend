import { IBasket, IItem } from "../types";
import { IEvents } from "./base/EventBus";

/**
 * Модель корзины
 * Отвечает за хранение товаров и их стоимости
 */
export class BasketModel implements IBasket {
    // Какие события отправляет корзина
    private static Events = {
        CHANGED: 'Basket: changed',
    } as const;

    // Тексты ошибок
    private static Text = {
        REMOVE_ERROR: 'Нельзя удалить то, чего нет!',
        INVALID_ITEM_ADD_ATTEMPT: 'Попытка добавить недопустимый товар в корзину',
        INVALID_ITEM_REMOVE_ATTEMPT: 'Попытка удалить товар с недопустимым ID',
    } as const;

    // Числовые значения
    private static Values = {
        ZERO: 0,
        INITIAL_ACCUMULATOR: 0,
        DEFAULT_PRICE: 0,
    } as const;

    // Товары в корзине
    protected _items: IItem[];
    
    // Для отправки событий
    protected events: IEvents;

    /**
     * Создает корзину
     * @param events - для отправки событий
     */
    constructor(events: IEvents) {
        this._items = [];
        this.events = events;
    }
    
    /**
     * Возвращает массив товаров в корзине
     */
    get items() {
        return this._items;
    }

    /**
     * Добавляет товар в корзину
     * @param item - объект товара для добавления
     */
    addItem(item: IItem): void {
        if (!item || !item.id) {
            console.warn(BasketModel.Text.INVALID_ITEM_ADD_ATTEMPT);
            return;
        }
        this._items.push(item);
        this.events.emit(BasketModel.Events.CHANGED);
    };

    /**
     * Удаляет товар из корзины по ID
     * @param itemId - ID товара для удаления
     */
    removeItem(itemId: string): void {
        if (!itemId) {
            console.warn(BasketModel.Text.INVALID_ITEM_REMOVE_ATTEMPT);
            return;
        }
        if (!this.alreadyInBasket(itemId)) {
            console.warn(BasketModel.Text.REMOVE_ERROR);
            return;
        }
        this._items = this._items.filter(item => item.id !== itemId);
        this.events.emit(BasketModel.Events.CHANGED);
    }

    /**
     * Проверяет наличие товара в корзине по ID
     * @param itemId - ID товара для проверки
     * @returns true, если товар найден в корзине, иначе false
     */
    alreadyInBasket(itemId: string): boolean {
        if (!itemId) {
            return false;
        }
        return this._items.some(item => item && item.id === itemId);        
    }

    /**
     * Очищает корзину, удаляя все товары
     */
    clear(): void {
        this._items = [];
        this.events.emit(BasketModel.Events.CHANGED);
    }

    /**
     * Рассчитывает общую стоимость всех товаров в корзине
     * @returns Общая стоимость товаров в корзине
     */
    getTotal(): number {
        if (!this._items.length) {
            return BasketModel.Values.ZERO;
        }
        return this._items.reduce((sum, item) => {
            const price = item && typeof item.price === 'number' ? item.price : BasketModel.Values.DEFAULT_PRICE;
            return sum + price;
        }, BasketModel.Values.INITIAL_ACCUMULATOR);
    }

    /**
     * Возвращает количество товаров в корзине
     * @returns Количество товаров в корзине
     */
    getCount(): number {
        return this._items.length;
    }
}
