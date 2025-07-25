import { IApiError, createApiError } from "../../types";

/**
 * Ответ от сервера со списком данных
 * @template Type - тип элементов в списке
 */
export type ApiListResponse<Type> = {
    /** Общее количество элементов */
    total: number;
    /** Массив элементов текущей страницы */
    items: Type[];
};

/**
 * HTTP-методы для изменения данных
 */
export type ApiPostMethods = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Настройки для работы с API
 */
interface IApiConfig {
    /** Базовый URL API */
    baseUrl: string;
    /** Общие заголовки для всех запросов */
    headers?: Record<string, string>;
    /** Таймаут запроса в миллисекундах */
    timeout?: number;
}

/**
 * Базовая реализация API клиента с обработкой ошибок
 */
export class Api {
    /** Базовый URL API */
    public readonly baseUrl: string;
    
    /** Общие настройки для всех запросов */
    protected readonly options: RequestInit;
    
    /** Таймаут запроса по умолчанию (5 секунд) */
    protected readonly timeout: number;

    /**
     * Создает клиент для работы с API
     * @param baseUrl - адрес сервера (обязательно)
     * @param options - настройки запросов (необязательно)
     * @throws {Error} Если не указан адрес сервера
     */
    constructor(baseUrl: string, options: RequestInit = {}) {
        if (!baseUrl) {
            throw new Error('Не указан базовый URL API');
        }

        this.baseUrl = baseUrl.endsWith('/') 
            ? baseUrl.slice(0, -1) 
            : baseUrl;
            
        this.timeout = 5000; // Таймаут по умолчанию
        
        this.options = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(options.headers as object || {})
            },
            mode: 'cors',
            credentials: 'same-origin',
            cache: 'no-store'
        };
    }

    /**
     * Создает экземпляр API клиента с расширенной конфигурацией
     * @param config - конфигурация API клиента
     * @returns Новый экземпляр Api
     */
    static create(config: IApiConfig): Api {
        return new Api(config.baseUrl, config);
    }

    /**
     * Обработчик ответа от сервера
     * @param response - объект ответа от fetch
     * @returns Promise с данными ответа или ошибкой
     * @throws {IApiError} В случае ошибки API
     */
    protected async handleResponse<T>(response: Response): Promise<T> {
        // Пытаемся распарсить ответ как JSON, даже если статус не 2xx
        const responseText = await response.text();
        let responseData: any;
        
        try {
            responseData = responseText ? JSON.parse(responseText) : null;
        } catch (e) {
            // Если не удалось распарсить JSON, используем текст ответа
            responseData = { message: responseText };
        }

        // Если ответ успешный, возвращаем данные
        if (response.ok) {
            return responseData as T;
        }

        // Создаем сообщение об ошибке по умолчанию
        let errorMessage = responseData?.message || response.statusText;
        let validationErrors: Record<string, string[]> | undefined;

        // Дополнительная обработка для разных статусов
        switch (response.status) {
            case 400:
                errorMessage = responseData?.message || 'Неверный запрос';
                validationErrors = responseData?.errors;
                break;
            case 401:
                errorMessage = 'Требуется авторизация';
                // Здесь можно добавить логику обновления токена
                break;
            case 403:
                errorMessage = 'Доступ запрещен';
                break;
            case 404:
                errorMessage = 'Ресурс не найден';
                break;
            case 422:
                errorMessage = 'Ошибка валидации';
                validationErrors = responseData?.errors;
                break;
            case 429:
                errorMessage = 'Слишком много запросов';
                // Можно добавить логику повторного запроса с задержкой
                break;
            case 500:
                errorMessage = 'Внутренняя ошибка сервера';
                // Логирование ошибки на стороне клиента
                console.error('Server Error:', responseData);
                break;
        }

        // Создаем и выбрасываем ошибку API
        const error = createApiError(
            errorMessage,
            response.status,
            response.statusText,
            responseData
        );
        
        if (validationErrors) {
            (error as any).validationErrors = validationErrors;
        }

        throw error;
    }

    /**
     * Выполняет GET запрос
     * @template T - ожидаемый тип ответа
     * @param uri - путь к ресурсу (относительно baseUrl)
     * @param query - параметры запроса (будут добавлены в URL)
     * @returns Promise с данными ответа
     * @throws {IApiError} В случае ошибки API
     */
    public async get<T>(uri: string, query: Record<string, string | number> = {}): Promise<T> {
        try {
            const queryString = Object.entries(query)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                .join('&');

            const url = `${this.baseUrl}${uri}${queryString ? `?${queryString}` : ''}`;
            
            const response = await this.fetchWithTimeout(url, {
                ...this.options,
                method: 'GET'
            });

            return this.handleResponse<T>(response);
        } catch (error) {
            // Преобразуем ошибки сети в стандартизированный формат
            if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
                throw createApiError(
                    'Ошибка сети. Проверьте подключение к интернету',
                    0,
                    'Network Error'
                );
            }
            
            // Если ошибка уже является IApiError, просто пробрасываем её дальше
            if (error && typeof error === 'object' && 'isApiError' in error) {
                throw error;
            }
            
            // Если это другая ошибка, оборачиваем её в IApiError
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            throw createApiError(errorMessage, 0, 'Unknown Error');
        }
    }

    /**
     * Выполняет POST/PUT/PATCH/DELETE запрос
     * @template T - ожидаемый тип ответа
     * @param uri - путь к ресурсу (относительно baseUrl)
     * @param data - данные для отправки (будут сериализованы в JSON)
     * @param method - HTTP метод (по умолчанию: 'POST')
     * @returns Promise с данными ответа
     * @throws {IApiError} В случае ошибки API
     */
    public async post<T>(
        uri: string, 
        data: object = {}, 
        method: ApiPostMethods = 'POST'
    ): Promise<T> {
        try {
            const url = `${this.baseUrl}${uri}`;
            
            const response = await this.fetchWithTimeout(url, {
                ...this.options,
                method,
                body: JSON.stringify(data)
            });

            return this.handleResponse<T>(response);
        } catch (error) {
            // Преобразуем ошибки сети в стандартизированный формат
            if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
                throw createApiError(
                    'Ошибка сети. Проверьте подключение к интернету',
                    0,
                    'Network Error'
                );
            }
            
            // Если ошибка уже является IApiError, просто пробрасываем её дальше
            if (error && typeof error === 'object' && 'isApiError' in error) {
                throw error;
            }
            
            // Если это другая ошибка, оборачиваем её в IApiError
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            throw createApiError(errorMessage, 0, 'Unknown Error');
        }
    }

    /**
     * Обертка над fetch с таймаутом
     * @param url - URL для запроса
     * @param options - опции для fetch
     * @returns Promise с ответом
     * @throws {Error} При превышении таймаута
     */
    private async fetchWithTimeout(
        url: string, 
        options: RequestInit
    ): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw createApiError(
                    `Превышено время ожидания запроса (${this.timeout}мс)`,
                    0,
                    'Timeout'
                );
            }
            throw error;
        }
    }
}
