import { IOrder, IOrderData, IOrderValidation, TPaymentType } from "../models/ProductTypes";
import { IEvents } from "./base/EventBus";

/**
 * Заказ
 * Хранит данные о заказе и проверяет их
 */
export class Order implements IOrder {
    // Адрес доставки
    protected _address: string;
    
    // Email покупателя
    protected _email: string;
    
    // Способ оплаты (карта или наличные)
    protected _payment: TPaymentType = null;
    
    // Телефон покупателя
    protected _phone: string;
    
    // Для отправки событий
    protected events;
       
    constructor(events: IEvents) {
        this.events = events;
        this.clear();
    }

    // Очистить все поля заказа
    clear() {
        this._address = "";
        this._email = "";
        this._payment = null;
        this._phone = "";
    }

    set address(value: string) {this._address = value;};
    set phone(value: string) {this._phone = value;};
    set email(value: string) {this._email = value;};
    set payment(value: TPaymentType) {this._payment = value;};

    get address():string {return this._address};
    get phone():string {return this._phone};
    get email():string {return this._email};
    get payment():TPaymentType {return this._payment};


    validateAdress(): IOrderValidation {
        let valid = true;
     	let message = '';

        if (!this._address) {
    		valid = false;
    		message = 'Введите адрес доставки.';
    	} 

        return {valid, message}
    }

    validatePayment(): IOrderValidation {
        let valid = true;
     	let message = '';

        if (!this._payment) {
    		valid = false;
    		message = 'Выберите способ оплаты.';
    	} 

        return {valid, message}
    }

    validateMail(): IOrderValidation {
        let valid = true;
     	let message = '';

     	if (!this._email) {
    		valid = false;
    		message = 'Введите таки свою почту.';
    	}

        return {valid, message}
    }

    validatePhone(): IOrderValidation {
        let valid = true;
     	let message = '';

     	if (!this._phone) {
    		valid = false;
    		message = 'Дай телефончик!';
    	}  

        return {valid, message}
    }

    setFieldData<T extends keyof IOrderData>(field: T, value: IOrderData[T]) {
        switch (field) {
            case 'address':
                if (typeof value === 'string') {
                    this.address = value;
                    this.events.emit('Order: new address');
                } else {
                    console.warn(`setFieldData: Expected string for address, got ${typeof value}`);
                }
                break;
            case 'email':
                if (typeof value === 'string') {
                    this.email = value;
                    this.events.emit('Order: new email');
                } else {
                    console.warn(`setFieldData: Expected string for email, got ${typeof value}`);
                }
                break;
            case 'payment':
                if (value === 'card' || value === 'cash' || value === null) {
                    this.payment = value as TPaymentType;
                    this.events.emit('Order: new payment');
                } else {
                    console.warn(`setFieldData: Invalid payment type: ${value}`);
                }
                break;
            case 'phone':
                if (typeof value === 'string') {
                    this.phone = value;
                    this.events.emit('Order: new phone');
                } else {
                    console.warn(`setFieldData: Expected string for phone, got ${typeof value}`);
                }
                break;
            default:
                console.warn(`setFieldData: Unknown field: ${field}`);
        }
    }

    getOrderData(): IOrderData {
        return {
            address: this._address,
            email: this._email,
            payment: this._payment,
            phone: this._phone,
            total: 0, // Это значение должно быть обновлено при оформлении заказа
            items: [], // Это значение должно быть обновлено при оформлении заказа
        };
    }
}