import { IItem } from "../types";
import { Component } from "./base/Component";
import { IEvents } from "./base/EventBus";


/**
 * Что нужно показать в корзине
 */
export interface IBasketContent {
    /** Массив товаров в корзине */
    items: IItem[];
    /** Общая стоимость товаров */
    total: number;
}

/**
 * Класс представления корзины товаров
 * @template IBasketContent - тип данных для отображения корзины
 */
export class Basket <IBasketContent> extends Component<IBasketContent> {
    // Где искать элементы корзины на странице
    private static Selectors = {
        LIST: '.basket__list',
        PRICE: '.basket__price',
        BUTTON: '.basket__button',
    } as const;

    // Какие события отправляет корзина
    private static Events = {
        SHOW_ORDER_FORM: 'basketView: showOrderForm',
    } as const;

    // Тексты и сообщения об ошибках
    private static Text = {
        CURRENCY: 'синапсов',
        // Тексты ошибок
        ERROR_MESSAGES: {
            LIST_CONTAINER_NOT_FOUND: 'Контейнер списка товаров корзины не найден',
            PRICE_CONTAINER_NOT_FOUND: 'Контейнер отображения цены не найден',
            ORDER_BUTTON_NOT_FOUND: 'Кнопка оформления заказа не найдена',
            INIT_ERROR: 'Ошибка при инициализации корзины:',
            UPDATE_LIST_ERROR: 'Невозможно обновить список товаров: контейнер списка не инициализирован',
            UPDATE_PRICE_ERROR: 'Невозможно обновить сумму заказа: контейнер цены не инициализирован',
            BUTTON_STATE_ERROR: 'Невозможно изменить состояние кнопки заказа: кнопка не инициализирована'
        }
    } as const;

    /**
     * Числовые константы
     */
    private static Values = {
        ZERO_PRICE: 0,
    } as const;

    /** Основной контейнер корзины */
    protected _content: HTMLElement;
    
    /** Контейнер списка товаров */
    protected _listContainer: HTMLElement;
    
    /** Контейнер отображения общей стоимости */
    protected _priceContainer: HTMLElement;
    
    /** Кнопка оформления заказа */
    protected _orderButton: HTMLButtonElement;

    /**
     * Создает экземпляр представления корзины
     * @param container - HTML-элемент контейнера корзины
     * @param events - экземпляр шины событий
     */
    constructor(container: HTMLElement, protected readonly events: IEvents) {
        super(container);

        try {
            // Инициализация контейнера списка товаров
            this._listContainer = this.container.querySelector(Basket.Selectors.LIST);
            if (!this._listContainer) {
                console.warn(Basket.Text.ERROR_MESSAGES.LIST_CONTAINER_NOT_FOUND);
            }

            // Инициализация контейнера цены
            this._priceContainer = this.container.querySelector(Basket.Selectors.PRICE);
            if (!this._priceContainer) {
                console.warn(Basket.Text.ERROR_MESSAGES.PRICE_CONTAINER_NOT_FOUND);
            }

            // Инициализация кнопки оформления заказа
            this._orderButton = this.container.querySelector(Basket.Selectors.BUTTON);
            if (this._orderButton) {
                this._orderButton.addEventListener('click', () => {
                    this.events.emit(Basket.Events.SHOW_ORDER_FORM);
                });
            } else {
                console.warn(Basket.Text.ERROR_MESSAGES.ORDER_BUTTON_NOT_FOUND);
            }
            
        } catch (error) {
            console.error(`${Basket.Text.ERROR_MESSAGES.INIT_ERROR}`, error);
            console.error(`${Basket.Text.ERROR_MESSAGES.INIT_ERROR}`, error);
        }
    }
   
    /**
     * Устанавливает список элементов корзины в DOM
     * @param items - массив HTML-элементов товаров
     */
    protected set items(items: HTMLElement[]) {
		if (this._listContainer) {
            this._listContainer.replaceChildren(...items);
        } else {
            console.warn(Basket.Text.ERROR_MESSAGES.UPDATE_LIST_ERROR);
        }
	}

    /**
     * Устанавливает общую стоимость заказа и обновляет состояние кнопки оформления
     * @param price - общая стоимость товаров в корзине
     */
    protected set total(price: number) {
		if (this._priceContainer) {
            this._priceContainer.textContent = `${price} ${Basket.Text.CURRENCY}`;
        } else {
            console.warn(Basket.Text.ERROR_MESSAGES.UPDATE_PRICE_ERROR);
        }
        
        if (this._orderButton) {
            this.changeDisabledState(this._orderButton, price === Basket.Values.ZERO_PRICE);
        } else {
            console.warn(Basket.Text.ERROR_MESSAGES.BUTTON_STATE_ERROR);
        }
	}


}