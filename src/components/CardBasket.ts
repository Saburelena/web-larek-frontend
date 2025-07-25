import { IItem } from "../types";
import { IEvents } from "./base/EventBus";
import { BaseCard } from "./BaseCard";

/**
 * Класс карточки товара в корзине
 * Наследуется от базового класса карточки
 */
export class CardBasket extends BaseCard<IItem> {
    /**
     * Селекторы элементов карточки товара в корзине
     * Наследуется от BaseCard и расширяется новыми селекторами
     */
    protected static override Selectors = {
        ...super.Selectors,
        ITEM_INDEX: '.basket__item-index',
        ITEM_DELETE: '.basket__item-delete',
    } as const;

    /**
     * События, генерируемые карточкой товара в корзине
     */
    private static Events = {
        DELETE_FROM_BASKET: 'CardBasket: delete_from_basket',
    } as const;

    /**
     * Тексты сообщений об ошибках
     */
    private static ErrorMessages = {
        ITEM_INDEX_NOT_FOUND: 'Элемент индекса товара не найден',
        DELETE_BUTTON_NOT_FOUND: 'Кнопка удаления товара не найдена',
        INIT_ERROR: 'Ошибка при инициализации карточки товара в корзине:',
    } as const;

    /** Кнопка удаления товара из корзины */
    protected itemDelete: HTMLButtonElement;
    
    /** Элемент отображения индекса товара в корзине */
    protected _itemIndex: HTMLElement;
    
    /**
     * Создает экземпляр карточки товара в корзине
     * @param container - HTML-элемент контейнера карточки
     * @param events - экземпляр шины событий
     */
    constructor(protected container: HTMLElement, events: IEvents) {
        super(container, events);
        
        try {
            // Инициализация элемента индекса товара
            this._itemIndex = this.container.querySelector(CardBasket.Selectors.ITEM_INDEX);
            if (!this._itemIndex) {
                console.warn(CardBasket.ErrorMessages.ITEM_INDEX_NOT_FOUND);
            }

            // Инициализация кнопки удаления товара
            this.itemDelete = this.container.querySelector(CardBasket.Selectors.ITEM_DELETE);
            if (this.itemDelete) {
                this.itemDelete.addEventListener('click', () =>
                    this.events.emit(CardBasket.Events.DELETE_FROM_BASKET, { itemID: this._itemID })
                );
            } else {
                console.warn(CardBasket.ErrorMessages.DELETE_BUTTON_NOT_FOUND);
            }
        } catch (error) {
            console.error(CardBasket.ErrorMessages.INIT_ERROR, error);
        }
    }

    /**
     * Устанавливает индекс товара в корзине
     * @param value - числовое значение индекса
     */
    set itemIndex(value: number) {
        if (this._itemIndex) {
            this._itemIndex.textContent = String(value);
        }
    }
}