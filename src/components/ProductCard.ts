import { categoryType, IItem, TItemCategory } from "../models/ProductTypes";
import { CDN_URL } from "../utils/constants";
import { IEvents } from "./base/EventBus";
import { BaseCard } from "./BaseCard";

/**
 * Карточка товара в каталоге
 * T - информация о товаре (название, цена и т.д.)
 */
export class ProductCard<T extends IItem> extends BaseCard<T> {
    // Где искать элементы карточки на странице
    // Добавляем к селекторам из BaseCard
    protected static override Selectors = {
        ...super.Selectors,
        IMAGE: '.card__image',
        CATEGORY: '.card__category',
        BUTTON: '.card__button',
    } as const;

    // Какие события отправляет карточка
    protected static Events = {
        MOVE_ITEM_TO_BASKET: 'CardPreview: move_item_to_basket',
        SHOW_PREVIEW: 'ProductCard: show_preview',
    } as const;

    // Начало CSS-классов для разных категорий
    private static ClassPrefixes = {
        CATEGORY: 'card__category_',
    } as const;

    // Сообщения об ошибках
    protected static ErrorMessages = {
        IMAGE_NOT_FOUND: (selector: string) => `Изображение с селектором '${selector}' не найдено`,
        CATEGORY_NOT_FOUND: (selector: string) => `Элемент категории с селектором '${selector}' не найден`,
        ADD_TO_BASKET_NO_ID: 'Попытка добавить в корзину товар без ID',
        SHOW_PREVIEW_NO_ID: 'Попытка показать предпросмотр товара без ID',
        INIT_ERROR: 'Ошибка при инициализации карточки товара:',
        EMPTY_IMAGE_WARNING: 'Попытка установить пустое значение изображения',
        EMPTY_CATEGORY_WARNING: 'Попытка установить пустую категорию товара'
    } as const;

    /** Элемент изображения товара */
    protected _image: HTMLImageElement | null = null;
    
    /** Элемент категории товара */
    protected _category: HTMLElement | null = null;
    
    /** Кнопка добавления в корзину */
    protected _toBasketButton: HTMLButtonElement | null = null;

    /**
     * Создает экземпляр карточки товара
     * @param container - HTML-элемент контейнера карточки
     * @param events - экземпляр шины событий
     */
    constructor(protected container: HTMLElement, protected readonly events: IEvents) {
        super(container, events);
        
        try {
            // Инициализация изображения товара
            this._image = this.container.querySelector(ProductCard.Selectors.IMAGE);
            if (!this._image) {
                console.warn(ProductCard.ErrorMessages.IMAGE_NOT_FOUND(ProductCard.Selectors.IMAGE));
            }

            // Инициализация категории товара
            this._category = this.container.querySelector(ProductCard.Selectors.CATEGORY);
            if (!this._category) {
                console.warn(ProductCard.ErrorMessages.CATEGORY_NOT_FOUND(ProductCard.Selectors.CATEGORY));
            }

            // Инициализация кнопки добавления в корзину
            this._toBasketButton = this.container.querySelector(ProductCard.Selectors.BUTTON);

            // Обработка кликов по карточке
            // Это плата за наследование CardPreview от CardShowcase
            // Иначе клик на карточку не дает сработать клику на кнопку
            if (this._toBasketButton) {
                this._toBasketButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (this._itemID) {
                        this.events.emit(ProductCard.Events.MOVE_ITEM_TO_BASKET, { itemID: this._itemID });
                    } else {
                        console.warn(ProductCard.ErrorMessages.ADD_TO_BASKET_NO_ID);
                    }
                });
            } else {
                this.container.addEventListener('click', () => {
                    if (this._itemID) {
                        this.events.emit(ProductCard.Events.SHOW_PREVIEW, { itemID: this._itemID });
                    } else {
                        console.warn(ProductCard.ErrorMessages.SHOW_PREVIEW_NO_ID);
                    }
                });
            }
        } catch (error) {
            console.error(`${ProductCard.ErrorMessages.INIT_ERROR}`, error);
        }
    };
    
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

    /**
     * Устанавливает изображение товара
     * @param value - URL изображения (относительный путь)
     */
    set image(value: string) {
        if (!this._image) {
            console.warn(ProductCard.ErrorMessages.IMAGE_NOT_FOUND(ProductCard.Selectors.IMAGE));
            return;
        }
        
        if (value) {
            this._image.src = CDN_URL + value;
            this._image.alt = 'Изображение товара';
        } else {
            console.warn(ProductCard.ErrorMessages.EMPTY_IMAGE_WARNING);
        }
    }
    
    /**
     * Устанавливает категорию товара и обновляет её визуальное отображение
     * @param value - тип категории товара
     */
    set category(value: TItemCategory) { 
        if (!this._category) {
            console.warn(ProductCard.ErrorMessages.CATEGORY_NOT_FOUND(ProductCard.Selectors.CATEGORY));
            return;
        }
        
        try {
            this._category.textContent = value || '';

            // Удаляем только классы категорий, оставляя остальные
            Array.from(this._category.classList).forEach(className => {
                if (className.startsWith(ProductCard.ClassPrefixes.CATEGORY)) {
                    this._category!.classList.remove(className);   
                } 
            });

            // Добавляем класс для новой категории, если значение валидно
            if (value !== null && value !== undefined && categoryType[value] !== undefined) {
                this._category.classList.add(`${ProductCard.ClassPrefixes.CATEGORY}${categoryType[value]}`);
            } else {
                console.warn('Передано недопустимое значение категории:', value);
            }
        } catch (error) {
            console.error('Ошибка при установке категории товара:', error);
        }
    }     
}