// js/models/CustomerModel.js

class CustomerModel {
    getCustomers() {
        return db.customers;
    }

    findCustomer(id) {
        return db.customers.find(c => c.id === id);
    }

    addCustomer(customerData) {
        if (!customerData.name || !customerData.email || !customerData.phone) return { success: false, message: 'Please fill all fields.' };
        if (!customerData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return { success: false, message: 'Invalid email format.' };
        if (!customerData.phone.match(/^\d{10}$/)) return { success: false, message: 'Phone must be 10 digits.' };

        const exists = db.customers.some(c => c.email === customerData.email || c.phone === customerData.phone);
        if (exists) return { success: false, message: 'Customer with this email or phone already exists.' };

        const newId = 'C' + String(db.customers.length + 1).padStart(3, '0');
        const newCustomer = new CustomerDTO(newId, customerData.name, customerData.email, customerData.phone);
        db.customers.push(newCustomer);
        return { success: true, message: 'Customer added successfully!' };
    }

    updateCustomer(id, customerData) {
        if (!customerData.name || !customerData.email || !customerData.phone) return { success: false, message: 'Please fill all fields.' };
        if (!customerData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return { success: false, message: 'Invalid email format.' };
        if (!customerData.phone.match(/^\d{10}$/)) return { success: false, message: 'Phone must be 10 digits.' };

        const customer = db.customers.find(c => c.id === id);
        if (!customer) return { success: false, message: 'Customer not found.' };

        const exists = db.customers.some(c => (c.email === customerData.email || c.phone === customerData.phone) && c.id !== id);
        if (exists) return { success: false, message: 'Another customer with this email or phone exists.' };

        customer.name = customerData.name;
        customer.email = customerData.email;
        customer.phone = customerData.phone;
        return { success: true, message: 'Customer updated!' };
    }

    deleteCustomer(id) {
        const hasOrders = db.orders.some(o => o.customerId === id);
        if (hasOrders) return { success: false, message: 'Cannot delete customer with existing orders.' };

        const initialLength = db.customers.length;
        db.customers = db.customers.filter(c => c.id !== id);

        return { success: db.customers.length < initialLength, message: 'Customer deleted.' };
    }
}