// js/controllers/CustomerController.js

const customerModel = new CustomerModel();

class CustomerController {
    loadCustomers() {
        const customers = customerModel.getCustomers();
        const tbody = document.getElementById('customersTable');
        tbody.innerHTML = '';
        const select = document.getElementById('customerSelect');
        select.innerHTML = '<option value="">Walk-in Customer</option>'; // Always reset the select

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No customers yet</td></tr>';
            return;
        }

        customers.forEach(customer => {
            const customerOrders = db.orders.filter(o => o.customerId === customer.id);

            // Populate table
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${customer.id}</td>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customerOrders.length}</td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="customerController.editCustomer('${customer.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);

            // Populate select
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.name} (${customer.phone})`;
            select.appendChild(option);
        });
    }

    addCustomer() {
        const name = document.getElementById('customerName').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();

        const result = customerModel.addCustomer({ name, email, phone });
        alert(result.message);

        if (result.success) {
            this.loadCustomers();
            this.clearCustomerForm();
        }
    }

    editCustomer(id) {
        const customer = customerModel.findCustomer(id);
        if (customer) {
            document.getElementById('editCustomerId').value = id; // Store ID for update/delete
            document.getElementById('customerIdDisplay').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerEmail').value = customer.email;
            document.getElementById('customerPhone').value = customer.phone;

            document.getElementById('updateCustomerBtn').style.display = 'inline-block';
            document.getElementById('deleteCustomerBtn').style.display = 'inline-block';
        }
    }

    updateCustomer() {
        const id = document.getElementById('editCustomerId').value;
        if (!id) return;

        const name = document.getElementById('customerName').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();

        const result = customerModel.updateCustomer(id, { name, email, phone });
        alert(result.message);

        if (result.success) {
            this.loadCustomers();
            this.clearCustomerForm();
        }
    }

    deleteCustomer() {
        const id = document.getElementById('editCustomerId').value;
        if (!id || !confirm('Delete this customer? This cannot be undone.')) return;

        const result = customerModel.deleteCustomer(id);
        alert(result.message);

        if (result.success) {
            this.loadCustomers();
            this.clearCustomerForm();
        }
    }

    clearCustomerForm() {
        document.getElementById('editCustomerId').value = '';
        document.getElementById('customerIdDisplay').value = '';
        document.getElementById('customerName').value = '';
        document.getElementById('customerEmail').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('updateCustomerBtn').style.display = 'none';
        document.getElementById('deleteCustomerBtn').style.display = 'none';
    }
}

const customerController = new CustomerController();