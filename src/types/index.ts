export type TItemCategory = 'софт-скил' | 'хард-скил' | 'другое' | 'кнопка' | 'дополнительное';
export type TItemPrice = number | null;

export const categoryType: Record<TItemCategory, string> = {
    'софт-скил': 'soft',
    'хард-скил': 'hard',
    'другое': 'other',
    'кнопка': 'button',
    'дополнительное': 'additional',
}

export interface IItem {
    id: string;
    itemIndex: number;
    category: TItemCategory;
    description: string;
    image: string;
    price: TItemPrice;
    title: string;
}

export interface ICardPreview extends IItem {
  inBasket: boolean;
  canAddToBasket: boolean;
}

export interface IShowcase {
    items: IItem[];
    getItem(itemId:string) : IItem;
    getItemPrice(itemId:string) : TItemPrice;
}

export interface IOrderValidation {
    valid: boolean;
    message: string;
}

export interface IBasket {
    items : IItem[];
    addItem(item: IItem): void;
    alreadyInBasket(itemId: string) : boolean;
    clear(): void;
    getTotal(): number;
    getCount(): number;
    removeItem(itemId: string): void;
}

export type TPaymentType = 'card' | 'cash' | null

export interface IOrderData {
    address: string;
    email: string;
    payment: TPaymentType;
    phone: string;
}

export interface IValidateData {
    valid: boolean;
    errors: string;
}

export interface IContactsViewData extends IValidateData {
    email: string;
    phone: string;
}

export interface IOrderViewData  extends IValidateData  {
    address: string;
    payment: TPaymentType;
}

export interface IOrder extends IOrderData {
    clear(): void;
    getOrderData(): IOrderData;
}

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IApi {
    baseUrl: string;
    get<T>(uri: string): Promise<T>;
    post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

/**
 * Ошибка API с дополнительной информацией
 */
export interface IApiError {
    /** Название ошибки */
    name: string;
    /** HTTP статус код ошибки */
    status: number;
    /** Текст статуса HTTP */
    statusText: string;
    /** Сообщение об ошибке для пользователя */
    message: string;
    /** Стек вызовов */
    stack?: string;
    /** Дополнительные данные об ошибке */
    data?: any;
    /** Признак того, что это ошибка API */
    isApiError: true;
    /** Ошибки валидации (если есть) */
    validationErrors?: Record<string, string[]>;
}

/**
 * Создает объект ошибки API
 */
export function createApiError(
    message: string,
    status: number = 0,
    statusText: string = '',
    data: any = null
): IApiError {
    const error = new Error(message) as any;
    error.name = 'ApiError';
    error.status = status;
    error.statusText = statusText || getStatusText(status);
    error.data = data;
    error.isApiError = true;
    return error as IApiError;
}

/**
 * Возвращает текстовое описание HTTP статуса
 */
function getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        422: 'Unprocessable Entity',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout'
    };
    
    return statusTexts[status] || 'Unknown Error';
}

/**
 * Ответ API на создание заказа
 */
export interface IOrderResponse {
    /** ID созданного заказа */
    id: string;
    /** Общая сумма заказа */
    total: number;
    /** Ошибка (если есть) */
    error?: string;
    /** Код ошибки (если есть) */
    code?: number;
    /** Дополнительные данные ответа */
    [key: string]: any;
}

/**
 * Ответ API со списком элементов и пагинацией
 */
export interface IApiListResponse<T> {
    /** Общее количество элементов */
    total: number;
    /** Массив элементов */
    items: T[];
    /** Ссылки на следующую/предыдущую страницы (если есть) */
    _links?: {
        self: { href: string };
        next?: { href: string };
        prev?: { href: string };
    };
    /** Метаданные ответа */
    _meta?: Record<string, any>;
}
