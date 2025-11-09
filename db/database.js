// database.js

// Mock Data Arrays
const db = {
    menuItems: [
        { id: 'I001', name: 'Cappuccino', price: 450, stock: 50, image: '../images/cappuchino.jpg' },
        { id: 'I002', name: 'Espresso', price: 350, stock: 80, image: '../images/Espresso.jpg' },
        { id: 'I003', name: 'Latte Macchiato', price: 480, stock: 40, image: '../images/Latte Macchiato.jpg' },
        { id: 'I004', name: 'Chocolate Cake', price: 380, stock: 25, image: '../images/Chocolate Cake2.png' },
        { id: 'I005', name: 'Croissant', price: 280, stock: 60, image: '../images/Croissant.jpg' },
        { id: 'I006', name: 'Green Tea', price: 320, stock: 70, image: '../images/Green Tea.jpg' }
    ],
    customers: [],
    orders: [],
    cart: []
};

const constants = {
    TAX_RATE: 0.00, // 0% tax for cafe model
    LOW_STOCK_THRESHOLD: 10
};