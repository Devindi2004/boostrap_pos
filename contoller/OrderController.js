// js/controllers/OrderController.js

const orderModel = new OrderModel();

class OrderController {

    // --- POS Display and Cart Management ---

    loadPOS() {
        itemController.loadPOSMenu();
        this.updateCartDisplay();
        customerController.loadCustomers(); // Reload customer select dropdown
    }

    addToCart(itemId) {
        const result = orderModel.addToCart(itemId);
        if (!result.success) {
            alert(result.message);
        }
        this.updateCartDisplay();
    }

    removeFromCart(index) {
        const result = orderModel.removeFromCart(index);
        if (!result.success) {
            alert(result.message);
        }
        this.updateCartDisplay();
    }

    clearCart() {
        orderModel.clearCart();
        document.getElementById('discountPercent').value = 0;
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cart = orderModel.getCart();
        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const totals = orderModel.calculateTotal(discountPercent);

        // Update global variable
        app.currentGrandTotal = totals.grandTotal;

        const container = document.getElementById('cartItems');
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('taxAmount');
        const totalEl = document.getElementById('orderTotal');
        const badge = document.getElementById('cartBadge');
        const placeBtn = document.getElementById('placeOrderBtn');

        if (cart.length === 0) {
            container.innerHTML = `<div class="text-center text-muted py-4"><i class="fas fa-shopping-cart fa-3x mb-3"></i><p>No items in cart</p></div>`;
            placeBtn.disabled = true;
        } else {
            container.innerHTML = '';
            cart.forEach((entry, index) => {
                const itemTotal = entry.item.price * entry.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div>
                        <div class="cart-item-name">${entry.item.name}</div>
                        <div class="cart-item-qty">x${entry.quantity}</div>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="cart-item-price">LKR ${itemTotal.toFixed(2)}</span>
                        <button class="cart-item-remove ms-2" onclick="orderController.removeFromCart(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                container.appendChild(div);
            });
            placeBtn.disabled = false;
        }

        subtotalEl.textContent = `LKR ${totals.subtotal.toFixed(2)}`;
        taxEl.textContent = `LKR ${totals.tax.toFixed(2)}`;
        totalEl.textContent = `LKR ${totals.grandTotal.toFixed(2)}`;
        badge.textContent = cart.reduce((sum, c) => sum + c.quantity, 0);
    }

    // --- Payment Logic ---

    openPaymentModal() {
        if (orderModel.getCart().length === 0) {
            alert('Cart is empty!');
            return;
        }

        // 1. Set Modal UI
        document.getElementById('modalGrandTotal').textContent = `LKR ${app.currentGrandTotal.toFixed(2)}`;
        document.getElementById('paidAmount').value = app.currentGrandTotal.toFixed(2);

        // 2. Calculate initial balance
        this.calculateBalance();

        // 3. Show Modal
        app.paymentModal.show();
    }

    calculateBalance() {
        const paidAmountEl = document.getElementById('paidAmount');
        let paidAmount = parseFloat(paidAmountEl.value) || 0;

        if (paidAmount < 0) {
            paidAmount = 0;
            paidAmountEl.value = 0;
        }

        const balance = paidAmount - app.currentGrandTotal;
        const balanceEl = document.getElementById('balanceAmount');
        const completeBtn = document.getElementById('completeOrderBtn');

        balanceEl.textContent = `LKR ${balance.toFixed(2)}`;
        balanceEl.style.color = balance < 0 ? '#e74c3c' : 'var(--success)';

        completeBtn.disabled = balance < -0.005;
    }

    processPayment() {
        const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
        const balance = paidAmount - app.currentGrandTotal;

        if (balance < -0.005) {
            alert('Insufficient paid amount! Please check the amount entered.');
            return;
        }

        const customerId = document.getElementById('customerSelect').value;
        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const totals = orderModel.calculateTotal(discountPercent);

        const result = orderModel.placeOrder(customerId, discountPercent, paidAmount, balance, totals);

        alert(result.message);
        if (result.success) {
            app.paymentModal.hide();
            this.updateCartDisplay(); // Reset Cart
            itemController.loadPOSMenu(); // Refresh POS menu to show stock changes
            app.updateDashboardStats(); // Refresh dashboard
        }
    }

    // --- Order History ---

    loadOrderHistory() {
        const orders = orderModel.getOrders();
        const tbody = document.getElementById('historyTable');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4 text-muted">No orders found</td></tr>';
            return;
        }

        orders.slice().reverse().forEach(order => {
            const customer = customerModel.findCustomer(order.customerId);
            const paidAmount = order.paid !== undefined ? `LKR ${order.paid.toFixed(2)}` : 'N/A';
            const balanceAmount = order.balance !== undefined ? `LKR ${order.balance.toFixed(2)}` : 'N/A';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td>${new Date(order.date).toLocaleString()}</td>
                <td>${customer ? customer.name : 'Walk-in'}</td>
                <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
                <td><strong>LKR ${order.total.toFixed(2)}</strong></td>
                <td>${paidAmount}</td>
                <td>${balanceAmount}</td>
                <td>${order.discountPercent}%</td>
                <td><span class="badge ${order.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm" style="background: var(--secondary); color: white;" onclick="orderController.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    viewOrder(orderId) {
        const order = orderModel.getOrders().find(o => o.id === orderId);
        if (!order) return;

        let items = '';
        order.items.forEach(item => {
            const menuItem = itemModel.findItem(item.itemId);
            items += `${menuItem ? menuItem.name : 'Unknown'} x${item.quantity} - LKR ${(item.price * item.quantity).toFixed(2)}\n`;
        });

        const customer = customerModel.findCustomer(order.customerId);

        const paidInfo = order.paid !== undefined ? `\nPaid: LKR ${order.paid.toFixed(2)}\nBalance/Change: LKR ${order.balance.toFixed(2)}` : '';

        alert(`
Order Details - ${order.id}
Date: ${new Date(order.date).toLocaleString()}
Customer: ${customer ? customer.name : 'Walk-in'}

Items:
${items}

Subtotal: LKR ${order.subtotal.toFixed(2)}
Discount: ${order.discountPercent}% (LKR ${(order.subtotal * (order.discountPercent / 100)).toFixed(2)})
Tax: LKR ${order.tax.toFixed(2)}
---
Grand Total: LKR ${order.total.toFixed(2)}${paidInfo}
Status: ${order.status}
        `.trim());
    }
}

const orderController = new OrderController();