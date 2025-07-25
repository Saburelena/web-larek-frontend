import { IItem} from "../types";
import { Component } from "./base/Component";
import { IEvents } from "./base/EventBus";


/**
 * Базовая карточка товара
 * T - информация о товаре (название, цена, описание)
 */
export class BaseCard<T extends IItem> extends Component<T> {
    // Где искать элементы карточки на странице
    protected static Selectors = {
        TITLE: '.card__title',
        PRICE: '.card__price',
    } as const;

    // Тексты и сообщения об ошибках
    private static Text = {
        PRICE_FREE: 'Бесценно',
        CURRENCY: 'синапсов',
        // Тексты ошибок
        ERROR_MESSAGES: {
            TITLE_NOT_FOUND: (selector: string) => `Элемент с селектором '${selector}' не найден`,
            PRICE_NOT_FOUND: (selector: string) => `Элемент с селектором '${selector}' не найден`,
            INIT_ERROR: 'Ошибка при инициализации карточки товара:',
            EMPTY_ID_WARNING: 'Попытка установить пустой ID для карточки товара'
        }
    } as const;

    // Для отправки событий о действиях с карточкой
    protected readonly events: IEvents;
    
    // ID товара
    protected _itemID: string = '';
    
    // Элемент с ценой товара
    protected _price: HTMLElement | null = null;
    
    /** 
     * Элемент отображения названия товара
     * Инициализируется при создании экземпляра класса
     */
    protected _title: HTMLElement | null = null;

    /**
     * Создает карточку товара
     * @param container - где отображать карточку
     * @param events - для отправки событий
     */
    constructor(protected container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        try {
            this._title = this.container.querySelector(BaseCard.Selectors.TITLE);
            if (!this._title) {
                console.warn(BaseCard.Text.ERROR_MESSAGES.TITLE_NOT_FOUND(BaseCard.Selectors.TITLE));
            }

            this._price = this.container.querySelector(BaseCard.Selectors.PRICE);
            if (!this._price) {
                console.warn(BaseCard.Text.ERROR_MESSAGES.PRICE_NOT_FOUND(BaseCard.Selectors.PRICE));
            }
        } catch (error) {
            console.error(`${BaseCard.Text.ERROR_MESSAGES.INIT_ERROR}`, error);
        }
    }

    /**
     * Устанавливает цену товара
     * @param value - числовое значение цены или null для бесплатного товара
     */
    set price(value: number | null) {
        if (!this._price) {
            console.warn(BaseCard.Text.ERROR_MESSAGES.PRICE_NOT_FOUND(BaseCard.Selectors.PRICE));
            return;
        }
        const priceText = value === null 
            ? BaseCard.Text.PRICE_FREE 
            : `${value} ${BaseCard.Text.CURRENCY}`;
        this._price.textContent = priceText;
    }

    /**
     * Устанавливает идентификатор товара
     * @param value - уникальный идентификатор товара
     */
    set id(value: string) {
        if (!value) {
            console.warn(BaseCard.Text.ERROR_MESSAGES.EMPTY_ID_WARNING);
            return;
        }
        this.container.dataset.id = value;
        this._itemID = value;
    }

    /**
     * Устанавливает название товара
     * @param value - текст названия
     */
    set title(value: string) {
        if (!this._title) {
            console.warn(BaseCard.Text.ERROR_MESSAGES.TITLE_NOT_FOUND(BaseCard.Selectors.TITLE));
            return;
        }
        this._title.textContent = value;
    }

    /**
     * Изменяет состояние кнопки (активна/неактивна)
     * @param button - HTML-элемент кнопки
     * @param isDisabled - флаг отключения кнопки
     */
    public changeDisabledState(button: HTMLButtonElement, isDisabled: boolean): void {
        if (button) {
            button.disabled = isDisabled;
        }
    }
}






