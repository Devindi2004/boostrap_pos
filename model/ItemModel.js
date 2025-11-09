// js/models/ItemModel.js

class ItemModel {
    getMenuItems() {
        return db.menuItems;
    }

    findItem(id) {
        return db.menuItems.find(i => i.id === id);
    }

    addItem(itemData) {
        if (!itemData.name || isNaN(itemData.price) || isNaN(itemData.stock)) return { success: false, message: 'Please fill all fields correctly.' };
        if (itemData.price <= 0 || itemData.stock < 0) return { success: false, message: 'Price must be positive and stock non-negative.' };

        const newId = 'I' + String(db.menuItems.length + 1).padStart(3, '0');
        const newItem = new ItemDTO(
            newId,
            itemData.name,
            itemData.price,
            itemData.stock,
            'https://images.unsplash.com/photo-1563205799-a42e51921312?auto=format&fit=crop&w=500&q=80' // Default cafe image
        );
        db.menuItems.push(newItem);
        return { success: true, message: 'Menu item added successfully!' };
    }

    updateItem(id, itemData) {
        if (!itemData.name || isNaN(itemData.price) || isNaN(itemData.stock)) return { success: false, message: 'Please fill all fields correctly.' };
        if (itemData.price <= 0 || itemData.stock < 0) return { success: false, message: 'Price must be positive and stock non-negative.' };

        const item = db.menuItems.find(i => i.id === id);
        if (!item) return { success: false, message: 'Item not found.' };

        item.name = itemData.name;
        item.price = itemData.price;
        item.stock = itemData.stock;
        return { success: true, message: 'Menu item updated!' };
    }

    deleteItem(id) {
        const initialLength = db.menuItems.length;
        db.menuItems = db.menuItems.filter(i => i.id !== id);
        return { success: db.menuItems.length < initialLength, message: 'Menu item deleted.' };
    }

    // Used by OrderModel to deduct stock
    deductStock(itemId, quantity) {
        const item = db.menuItems.find(i => i.id === itemId);
        if (item && item.stock >= quantity) {
            item.stock -= quantity;
            return true;
        }
        return false;
    }
}