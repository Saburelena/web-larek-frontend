
/**
 * Базовый класс для всех компонентов
 * T - тип данных для отображения в компоненте
 */
export abstract class Component<T> {
    /**
     * Создает компонент
     * @param container - куда вставлять компонент на странице
     */
    constructor(protected readonly container: HTMLElement) {
    }

    /**
     * Включает или выключает CSS-класс у элемента
     * @param element - какой элемент изменить
     * @param className - имя класса
     * @param state - true = добавить класс, false = убрать, не указано = переключить
     */
    protected changeClassState(
        element: HTMLElement, 
        className: string, 
        state?: boolean
    ): void {
        if (!element) return;
        element.classList.toggle(className, state);
    }

    /**
     * Блокирует или разблокирует элемент
     * @param element - какой элемент заблокировать
     * @param isDisabled - true = заблокировать, false = разблокировать
     */
    protected changeDisabledState(element: HTMLElement, isDisabled: boolean): void {
        if (!element) return;
        
        isDisabled 
            ? element.setAttribute('disabled', 'true') 
            : element.removeAttribute('disabled');
    }

    /**
     * Отображает компонент на странице
     * @param data - данные для отображения (необязательно)
     * @returns контейнер с компонентом
     */
    render(data?: Partial<T>): HTMLElement {
        // Обновляем состояние компонента переданными данными
        if (data) {
            Object.assign(this as object, data);
        }
        return this.container;
    }
}