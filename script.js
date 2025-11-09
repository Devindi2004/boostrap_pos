// script.js (Main Application Logic)

class AppController {
    constructor() {
        this.paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
        this.currentGrandTotal = 0; // Global variable to hold the calculated total
        this.initializeListeners();
    }

    initializeListeners() {
        document.getElementById('loginForm').addEventListener('submit', this.login.bind(this));
        document.addEventListener('DOMContentLoaded', () => {
            customerController.loadCustomers(); // Initial customer load
            this.updateDashboardStats(); // Initial dashboard load
        });
    }

    login(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username === 'admin' && password === 'luxe123') {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('sidebar').style.display = 'block';
            document.getElementById('mainContent').style.display = 'block';
            this.showSection('dashboard');
            this.updateDashboardStats();
        } else {
            alert('Invalid credentials! Use: admin / luxe123');
        }
    }

    logout() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    showSection(section, event) {
        const sections = ['dashboard', 'item-management', 'pos', 'order-history', 'customers'];
        sections.forEach(s => {
            const element = document.getElementById(s);
            if (element) {
                element.style.display = s === section ? 'block' : 'none';
            }
        });

        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const targetLink = event ? event.target.closest('.nav-link') : document.querySelector(`.nav-link[onclick*="'${section}'"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Load section data via controllers
        if (section === 'item-management') itemController.loadMenuItems();
        if (section === 'pos') orderController.loadPOS();
        if (section === 'order-history') orderController.loadOrderHistory();
        if (section === 'customers') customerController.loadCustomers();
        if (section === 'dashboard') this.updateDashboardStats();
    }

    updateDashboardStats() {
        const orders = orderModel.getOrders();
        const customers = customerModel.getCustomers();
        const menuItems = itemModel.getMenuItems();

        const today = new Date().toDateString();
        const todayOrders = orders.filter(o => new Date(o.date).toDateString() === today);
        const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

        document.getElementById('todaySales').textContent = `LKR ${todaySales.toFixed(2)}`;
        document.getElementById('todayOrders').textContent = todayOrders.length;
        document.getElementById('totalCustomers').textContent = customers.length;
        document.getElementById('menuItemsCount').textContent = menuItems.length;

        // Recent orders (Copied from OrderController to avoid dependency loop in controllers)
        const recent = orders.slice(-5).reverse();
        const tbody = document.getElementById('recentOrders');
        tbody.innerHTML = '';

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No orders yet</td></tr>';
        } else {
            recent.forEach(order => {
                const customer = customerModel.findCustomer(order.customerId);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${order.id}</strong></td>
                    <td>${customer ? customer.name : 'Walk-in'}</td>
                    <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
                    <td><strong>LKR ${order.total.toFixed(2)}</strong></td>
                    <td><span class="badge ${order.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${order.status}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    }
}

const app = new AppController();