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
            Swal.fire({
                icon: 'warning',
                title: 'Out of Stock!',
                text: result.message,
                timer: 3000,
                showConfirmButton: false
            });
        }
        this.updateCartDisplay();
    }

    removeFromCart(index) {
        const result = orderModel.removeFromCart(index);
        if (!result.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: result.message,
                timer: 3000,
                showConfirmButton: false
            });
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
            Swal.fire({
                icon: 'warning',
                title: 'Cart is empty!',
                text: 'Please add items to the cart before proceeding to payment.',
                timer: 3000,
                showConfirmButton: false
            });
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
            Swal.fire({
                icon: 'error',
                title: 'Payment Error!',
                text: 'Insufficient paid amount! Please check the amount entered.',
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }

        const customerId = document.getElementById('customerSelect').value;
        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const totals = orderModel.calculateTotal(discountPercent);

        const result = orderModel.placeOrder(customerId, discountPercent, paidAmount, balance, totals);

        Swal.fire({
            icon: result.success ? 'success' : 'error',
            title: result.success ? 'Order Placed!' : 'Order Failed!',
            html: result.message,
            timer: 5000,
            showConfirmButton: false
        });

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

        let itemsHtml = '';
        order.items.forEach(item => {
            const menuItem = itemModel.findItem(item.itemId);
            itemsHtml += `<li>${menuItem ? menuItem.name : 'Unknown'} x${item.quantity} - LKR ${(item.price * item.quantity).toFixed(2)}</li>`;
        });

        const customer = customerModel.findCustomer(order.customerId);

        const paidInfo = order.paid !== undefined ? `<p><strong>Paid:</strong> LKR ${order.paid.toFixed(2)}<br><strong>Change Due:</strong> LKR ${order.balance.toFixed(2)}</p>` : '';

        Swal.fire({
            title: `Order Details - ${order.id}`,
            html: `
                <div style="text-align: left; margin-bottom: 15px;">
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                    <p><strong>Customer:</strong> ${customer ? customer.name : 'Walk-in'}</p>
                </div>
                <h6 style="text-align: left; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 10px;">Items:</h6>
                <ul style="list-style-type: none; padding: 0; text-align: left;">
                    ${itemsHtml}
                </ul>
                <div style="text-align: right; border-top: 1px solid #eee; padding-top: 10px;">
                    <p>Subtotal: LKR ${order.subtotal.toFixed(2)}</p>
                    <p>Discount: ${order.discountPercent}% (LKR ${(order.subtotal * (order.discountPercent / 100)).toFixed(2)})</p>
                    <p>Tax: LKR ${order.tax.toFixed(2)}</p>
                    <h5 style="margin-top: 10px;">Grand Total: LKR ${order.total.toFixed(2)}</h5>
                </div>
                ${paidInfo}
                <p><strong>Status:</strong> <span class="badge ${order.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${order.status}</span></p>
            `,
            confirmButtonText: 'Close'
        });
    }
}

const orderController = new OrderController();