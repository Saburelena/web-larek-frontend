import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/EventBus";

interface IPageData {
    basketCount: number;
    galleryItems: HTMLElement[];
}

/**
 * Главная страница приложения
 * Управляет отображением и основными функциями
 */
export class MainPage extends Component<IPageData> {
    // Где искать элементы на странице
    private static Selectors = {
        BASKET_COUNTER: '.header__basket-counter',
        GALLERY: '.gallery',
        PAGE_WRAPPER: '.page__wrapper',
        BASKET_BUTTON: '.header__basket',
    } as const;

    // Используемые CSS-классы
    private static Classes = {
        PAGE_WRAPPER_LOCKED: 'page__wrapper_locked',
    } as const;

    // Какие события обрабатываем
    private static Events = {
        BASKET_OPEN: 'page: openBasket',
    } as const;

    // Сообщения об ошибках
    private static ErrorMessages = {
        BASKET_COUNTER_NOT_FOUND: 'Элемент счетчика корзины не найден',
        GALLERY_NOT_FOUND: 'Элемент галереи товаров не найден',
        PAGE_WRAPPER_NOT_FOUND: 'Элемент обертки страницы не найден',
        BASKET_BUTTON_NOT_FOUND: 'Кнопка корзины не найдена',
        GALLERY_UPDATE_ERROR: 'Невозможно обновить галерею: элемент галереи не инициализирован',
        BASKET_COUNTER_UPDATE_ERROR: 'Невозможно обновить счетчик корзины: элемент счетчика не инициализирован',
        SCROLL_LOCK_ERROR: 'Невозможно изменить состояние блокировки прокрутки: элемент обертки страницы не инициализирован',
        PAGE_INIT_ERROR: 'Ошибка при инициализации страницы:'
    } as const;

    protected readonly events: IEvents;
    protected basketCounter: HTMLElement;
    protected itemsGallery: HTMLElement;
    protected pageWrapper: HTMLElement;
    protected basketButton: HTMLElement;

    /**
     * Создает экземпляр страницы приложения
     * @param container - HTML-элемент, в который будет отрисована страница
     * @param events - экземпляр класса для работы с событиями
     */
    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        try {
            // Инициализация счетчика корзины
            this.basketCounter = ensureElement<HTMLElement>(MainPage.Selectors.BASKET_COUNTER);
            if (!this.basketCounter) {
                console.warn(MainPage.ErrorMessages.BASKET_COUNTER_NOT_FOUND);
            }

            // Инициализация галереи товаров
            this.itemsGallery = ensureElement<HTMLElement>(MainPage.Selectors.GALLERY);
            if (!this.itemsGallery) {
                console.warn(MainPage.ErrorMessages.GALLERY_NOT_FOUND);
            }

            // Инициализация обертки страницы
            this.pageWrapper = ensureElement<HTMLElement>(MainPage.Selectors.PAGE_WRAPPER);
            if (!this.pageWrapper) {
                console.warn(MainPage.ErrorMessages.PAGE_WRAPPER_NOT_FOUND);
            }

            // Инициализация кнопки корзины
            this.basketButton = ensureElement<HTMLElement>(MainPage.Selectors.BASKET_BUTTON);
            if (this.basketButton) {
                this.basketButton.addEventListener('click', () => {
                    this.events.emit(MainPage.Events.BASKET_OPEN);
                });
            } else {
                console.warn(MainPage.ErrorMessages.BASKET_BUTTON_NOT_FOUND);
            }
            
        } catch (error) {
            console.error(`${MainPage.ErrorMessages.PAGE_INIT_ERROR}`, error);
        }
    }

    /**
     * Устанавливает элементы галереи на странице
     * @param items - массив HTML-элементов для отображения в галерее
     */
    set galleryItems(items: HTMLElement[]) {
        if (this.itemsGallery) {
            this.itemsGallery.replaceChildren(...items);
        } else {
            console.warn(MainPage.ErrorMessages.GALLERY_UPDATE_ERROR);
        }
    }

    /**
     * Устанавливает количество товаров в корзине
     * @param value - новое количество товаров
     */
    set basketCount(value: number) {
        if (this.basketCounter) {
            this.basketCounter.textContent = String(value);
        } else {
            console.warn(MainPage.ErrorMessages.BASKET_COUNTER_UPDATE_ERROR);
        }
    }

    /**
     * Блокирует или разблокирует прокрутку страницы
     * @param isLocked - флаг блокировки прокрутки
     */
    set scrollLocked(isLocked: boolean) {
        if (this.pageWrapper) {
            this.pageWrapper.classList.toggle(MainPage.Classes.PAGE_WRAPPER_LOCKED, isLocked);
        } else {
            console.warn(MainPage.ErrorMessages.SCROLL_LOCK_ERROR);
        }
    }
}