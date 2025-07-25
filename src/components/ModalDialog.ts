import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/EventBus";

export interface IModalContent {
    content: HTMLElement;
}

export class ModalDialog <IModalContent> extends Component<IModalContent> {
    // Селекторы элементов
    private static Selectors = {
        CLOSE_BUTTON: '.modal__close',
        CONTENT: '.modal__content',
    } as const;

    // Классы CSS
    private static Classes = {
        MODAL_ACTIVE: 'modal_active',
    } as const;

    // События
    private static Events = {
        SCROLL_LOCKED: 'modal: page.scrollLocked',
    } as const;

    // Клавиши клавиатуры
    private static Keys = {
        ESCAPE: 'Escape',
    } as const;

    // Тексты ошибок
    private static ErrorMessages = {
        CLOSE_BUTTON_INIT_ERROR: 'Ошибка при инициализации кнопки закрытия:',
        CLOSE_BUTTON_CREATED: 'Создана кнопка закрытия по умолчанию',
        MODAL_CONTENT_NOT_FOUND: 'Контент модального окна не найден',
        MODAL_CONTAINER_NOT_FOUND: 'Контейнер модального окна не найден',
        MODAL_INIT_ERROR: 'Ошибка при инициализации модального окна:'
    } as const;

    protected readonly events: IEvents;
    protected modalContent: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        try {
            // Инициализируем кнопку закрытия с обработкой ошибок
            try {
                this.closeButton = ensureElement<HTMLButtonElement>(ModalDialog.Selectors.CLOSE_BUTTON, container);
                this.closeButton.addEventListener('click', this.close.bind(this));
            } catch (error) {
                console.error(`${ModalDialog.ErrorMessages.CLOSE_BUTTON_INIT_ERROR}`, error);
                // Создаем кнопку закрытия, если она не найдена
                this.closeButton = document.createElement('button');
                this.closeButton.className = 'modal__close';
                this.closeButton.innerHTML = '&times;';
                this.closeButton.addEventListener('click', this.close.bind(this));
                this.container.prepend(this.closeButton);
                console.warn(ModalDialog.ErrorMessages.CLOSE_BUTTON_CREATED);
            }

            // Инициализируем контент модального окна с обработкой ошибок
            try {
                this.modalContent = ensureElement<HTMLElement>(ModalDialog.Selectors.CONTENT, container);
            } catch (error) {
                console.warn(ModalDialog.ErrorMessages.MODAL_CONTENT_NOT_FOUND);
            }
            
            // Добавляем обработчик клика по оверлею
            if (this.container) {
                this.container.addEventListener('mousedown', (evt) => {
                    if (evt.target === evt.currentTarget) {
                        this.close();
                    }
                });
            } else {
                console.warn(ModalDialog.ErrorMessages.MODAL_CONTAINER_NOT_FOUND);
            }
            
            this.handleEscUp = this.handleEscUp.bind(this);
            
        } catch (error) {
            console.error(`${ModalDialog.ErrorMessages.MODAL_INIT_ERROR}`, error);
        }
    }
  
    open(): void {
        this.container.classList.add(ModalDialog.Classes.MODAL_ACTIVE);
        document.addEventListener('keyup', this.handleEscUp);
        this.events.emit(ModalDialog.Events.SCROLL_LOCKED, { lock: true });
    }
  
    close(): void {
        this.container.classList.remove(ModalDialog.Classes.MODAL_ACTIVE);
        document.removeEventListener('keyup', this.handleEscUp);
        this.modalContent.replaceChildren();
        this.events.emit(ModalDialog.Events.SCROLL_LOCKED, { lock: false });
    }
  
    private handleEscUp(evt: KeyboardEvent): void {
        if (evt.key === ModalDialog.Keys.ESCAPE) {
            this.close();
        }
    }

    protected set content(content: HTMLElement) {
        this.modalContent.replaceChildren(content);
    }

    // basketShow() {
    //     this._basketShown = true;
    // }

    // basketHide() {
    //     this._basketShown = false;
    // }

    // get basketShown() {
    //     return this._basketShown;
    // }
}