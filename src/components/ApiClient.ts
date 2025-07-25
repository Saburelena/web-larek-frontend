import { IApi, IItem, IOrderData, IOrderResponse } from "../types";

/**
 * Класс для работы с API приложения
 * Обеспечивает централизованную обработку ошибок API
 */
export class ApiClient {
	private _baseApi: IApi;

	/**
	 * Тексты сообщений об ошибках
	 */
	private static ErrorMessages = {
		INVALID_RESPONSE: 'Некорректный ответ от сервера',
		NETWORK_ERROR: 'Ошибка сети. Пожалуйста, проверьте подключение к интернету',
		SERVER_ERROR: 'Ошибка сервера',
		UNAUTHORIZED: 'Требуется авторизация',
		FORBIDDEN: 'Доступ запрещен',
		NOT_FOUND: 'Ресурс не найден',
		VALIDATION_ERROR: 'Ошибка валидации данных',
		UNKNOWN_ERROR: 'Произошла неизвестная ошибка',
		EMPTY_RESPONSE: 'Получен пустой ответ от сервера',
		INVALID_ITEMS: 'Не удалось загрузить товары',
		INVALID_ITEM: (id: string) => `Не удалось загрузить товар с ID: ${id}`,
		ORDER_FAILED: 'Не удалось оформить заказ'
	} as const;

	/**
	 * Создает экземпляр ApiClient
	 * @param baseApi - базовый API клиент
	 */
	constructor(baseApi: IApi) {
		this._baseApi = baseApi;
	}

	/**
	 * Обработчик ошибок API
	 * @param error - объект ошибки
	 * @param defaultMessage - сообщение по умолчанию
	 * @returns Promise с ошибкой
	 */
	private handleApiError(error: unknown, defaultMessage: string): Promise<never> {
		let errorMessage = defaultMessage;
		let errorDetails: Record<string, unknown> = {};

		if (error instanceof Error) {
			errorDetails = { 
				name: error.name, 
				message: error.message,
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
			};

			if ('response' in error && error.response) {
				const response = error.response as Response;
				switch (response.status) {
					case 400:
						errorMessage = ApiClient.ErrorMessages.VALIDATION_ERROR;
						break;
					case 401:
						errorMessage = ApiClient.ErrorMessages.UNAUTHORIZED;
						break;
					case 403:
						errorMessage = ApiClient.ErrorMessages.FORBIDDEN;
						break;
					case 404:
						errorMessage = ApiClient.ErrorMessages.NOT_FOUND;
						break;
					case 500:
						errorMessage = ApiClient.ErrorMessages.SERVER_ERROR;
						break;
				}
			}
		} else if (typeof error === 'string') {
			errorMessage = error;
		}

		console.error(`API Error: ${errorMessage}`, errorDetails);
		return Promise.reject(new Error(errorMessage));
	}

	/**
	 * Получает список товаров с сервера
	 * @returns Promise с массивом товаров
	 */
	getShowcase(): Promise<IItem[]> {
		return this._baseApi
			.get<{ total: number; items: IItem[] }>(`/product`)
			.then((response) => {
				if (!response || !Array.isArray(response.items)) {
					throw new Error(ApiClient.ErrorMessages.INVALID_RESPONSE);
				}
				return response.items;
			})
			.catch((error) => 
				this.handleApiError(error, ApiClient.ErrorMessages.INVALID_ITEMS)
			);
	}

	/**
	 * Получает товар по ID
	 * @param id - ID товара
	 * @returns Promise с данными товара
	 */
	getItemById(id: string): Promise<IItem> {
    	if (!id) {
			return Promise.reject(new Error('Не указан ID товара'));
		}

		return this._baseApi
			.get<IItem>(`/product/${id}`)
			.then((item: IItem) => {
				if (!item || !item.id) {
					throw new Error(ApiClient.ErrorMessages.INVALID_RESPONSE);
				}
				return item;
			})
			.catch((error) => 
				this.handleApiError(error, ApiClient.ErrorMessages.INVALID_ITEM(id))
			);
	}

	/**
	 * Отправляет заказ на сервер
	 * @param order - данные заказа
	 * @param items - массив товаров в заказе
	 * @param cost - общая стоимость заказа
	 * @returns Promise с ответом сервера о создании заказа
	 */
	postOrder(order: IOrderData, items: IItem[], cost: number): Promise<IOrderResponse> {
		if (!order || !items || items.length === 0) {
			return Promise.reject(new Error('Не указаны данные заказа или товары'));
		}

		const payload = {
    		...order,
			total: cost,
			items: items.map(item => item.id).filter(Boolean),
		};

  		return this._baseApi
	  		.post<IOrderResponse>('/order', payload)
			.then((response) => {
				if (!response || !response.id) {
					throw new Error(ApiClient.ErrorMessages.INVALID_RESPONSE);
				}
				return response;
			})
			.catch((error) => 
				this.handleApiError(error, ApiClient.ErrorMessages.ORDER_FAILED)
			);
	}
}