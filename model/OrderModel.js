// js/models/OrderModel.js

class OrderModel {
    constructor() {
        this.itemModel = new ItemModel();
    }

    getOrders() {
        return db.orders;
    }

    getCart() {
        return db.cart;
    }

    addToCart(itemId) {
        const item = this.itemModel.findItem(itemId);
        if (!item || item.stock <= 0) return { success: false, message: 'Item out of stock!' };

        const existing = db.cart.find(c => c.item.id === itemId);
        if (existing) {
            if (existing.quantity >= item.stock) {
                return { success: false, message: 'Not enough stock available!' };
            }
            existing.quantity++;
        } else {
            db.cart.push({ item, quantity: 1 });
        }
        return { success: true };
    }

    removeFromCart(index) {
        if (index >= 0 && index < db.cart.length) {
            db.cart.splice(index, 1);
            return { success: true };
        }
        return { success: false, message: 'Item index invalid.' };
    }

    clearCart() {
        db.cart = [];
    }

    calculateTotal(discountPercent) {
        const cart = db.cart;
        if (cart.length === 0) {
            return { subtotal: 0, tax: 0, grandTotal: 0 };
        }

        let subtotal = cart.reduce((sum, e) => sum + e.item.price * e.quantity, 0);

        const discountAmount = subtotal * (discountPercent / 100);
        const taxable = subtotal - discountAmount;
        const tax = taxable * constants.TAX_RATE;
        const grandTotal = taxable + tax;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            grandTotal: parseFloat(grandTotal.toFixed(2))
        };
    }

    placeOrder(customerId, discountPercent, paidAmount, balance, totals) {
        // Final stock check and deduction
        for (let entry of db.cart) {
            if (!this.itemModel.deductStock(entry.item.id, entry.quantity)) {
                return { success: false, message: `Stock deduction failed for ${entry.item.name}.` };
            }
        }

        const orderId = 'O' + String(db.orders.length + 1).padStart(3, '0');

        const orderItems = db.cart.map(e => ({
            itemId: e.item.id,
            quantity: e.quantity,
            price: e.item.price
        }));

        const newOrder = new OrderDTO(
            orderId,
            new Date(),
            customerId || null,
            orderItems,
            totals.subtotal,
            discountPercent,
            totals.tax,
            totals.grandTotal,
            paidAmount,
            balance,
            'Paid'
        );

        db.orders.push(newOrder);
        this.clearCart();
        return { success: true, message: `Order ${orderId} placed successfully! Change Due: LKR ${balance.toFixed(2)}`, order: newOrder };
    }
}