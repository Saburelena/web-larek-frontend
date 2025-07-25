import { categoryType, ICardPreview, TItemCategory } from "../types";
import { CDN_URL } from "../utils/constants";
import { IEvents } from "./base/EventBus";
import { ProductCard } from "./ProductCard";

/**
 * Класс карточки предпросмотра товара
 * Наследуется от ProductCard и расширяет его функциональность
 * @template ICardPreview - тип данных карточки предпросмотра
 */
export class CardPreview extends ProductCard<ICardPreview> {
    /**
     * Селекторы элементов карточки предпросмотра
     * Наследуются от ProductCard и расширяются новыми селекторами
     */
    protected static override Selectors = {
        ...super.Selectors, // Наследуем селекторы от ProductCard
        TEXT: '.card__text',
        TITLE: '.card__title',
        PRICE: '.card__price',
        // BUTTON наследуется из ProductCard как '.card__button'
    } as const;

    /**
     * Тексты кнопок карточки предпросмотра
     */
    private static ButtonText = {
        IN_BASKET: 'Уже в корзине',
        ADD_TO_BASKET: 'В корзину',
    } as const;

    // Тексты ошибок (наследуем от ProductCard и добавляем свои)
    protected static override ErrorMessages = {
        ...super.ErrorMessages, // Наследуем ошибки из ProductCard
        TEXT_NOT_FOUND: (selector: string) => `Элемент текста с селектором '${selector}' не найден в карточке предпросмотра`,
        TITLE_NOT_FOUND: (selector: string) => `Элемент заголовка с селектором '${selector}' не найден в карточке предпросмотра`,
        PRICE_NOT_FOUND: (selector: string) => `Элемент цены с селектором '${selector}' не найден в карточке предпросмотра`,
        BUTTON_NOT_FOUND: (selector: string) => `Кнопка с селектором '${selector}' не найдена в карточке предпросмотра`,
        ELEMENT_NOT_FOUND: (selector: string) => `Элемент с селектором '${selector}' не найден в карточке предпросмотра`,
        PREVIEW_INIT_ERROR: 'Ошибка при инициализации карточки предпросмотра:'
    } as const;

    /** Элемент описания товара */
    protected _description: HTMLElement;
    
    /** Кнопка добавления в корзину */
    protected _toBasketButton: HTMLButtonElement;

    /**
     * Создает экземпляр карточки предпросмотра товара
     * @param container - HTML-элемент контейнера карточки
     * @param events - экземпляр шины событий
     */
    constructor(protected container: HTMLElement, events: IEvents) {
        super(container, events);
        
        try {
            this._description = this.container.querySelector(CardPreview.Selectors.TEXT);
            if (!this._description) {
                console.warn(CardPreview.ErrorMessages.ELEMENT_NOT_FOUND(CardPreview.Selectors.TEXT));
            }

            this._toBasketButton = this.container.querySelector(CardPreview.Selectors.BUTTON);
            if (!this._toBasketButton) {
                console.warn(CardPreview.ErrorMessages.BUTTON_NOT_FOUND(CardPreview.Selectors.BUTTON));
            }
        } catch (error) {
            console.error(`${CardPreview.ErrorMessages.PREVIEW_INIT_ERROR}`, error);
        }
    }

    /**
     * Устанавливает состояние кнопки добавления в корзину
     * @param value - флаг, указывающий, находится ли товар в корзине
     */
    set inBasket(value: boolean) {
        if (this._toBasketButton) {
            this._toBasketButton.textContent = value 
                ? CardPreview.ButtonText.IN_BASKET 
                : CardPreview.ButtonText.ADD_TO_BASKET;
        }
    }

    /**
     * Устанавливает возможность добавления товара в корзину
     * @param value - флаг, указывающий, можно ли добавить товар в корзину
     */
    set canAddToBasket(value: boolean) {
        if (this._toBasketButton) {
            this.changeDisabledState(this._toBasketButton, !value);
        }
    }

    /**
     * Устанавливает описание товара
     * @param value - текст описания товара
     */
    set description(value: string) {
        if (this._description) {
            this._description.textContent = value || '';
        }
    }
}