// js/dto/OrderDTO.js

class OrderDTO {
    constructor(id, date, customerId, items, subtotal, discountPercent, tax, total, paid, balance, status) {
        this.id = id;
        this.date = date;
        this.customerId = customerId;
        this.items = items; // [{itemId, quantity, price}, ...]
        this.subtotal = subtotal;
        this.discountPercent = discountPercent;
        this.tax = tax;
        this.total = total;
        this.paid = paid;
        this.balance = balance;
        this.status = status;
    }
}