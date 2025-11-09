// js/controllers/ItemController.js

const itemModel = new ItemModel();

class ItemController {
    loadMenuItems() {
        const items = itemModel.getMenuItems();
        const tbody = document.getElementById('itemsTable');
        tbody.innerHTML = '';

        items.forEach(item => {
            const statusClass = item.stock < constants.LOW_STOCK_THRESHOLD ? 'low-stock' : '';
            const statusText = item.stock > 0 ? '<span class="badge" style="background: rgba(74, 124, 89, 0.2); color: var(--success);">Available</span>' : '<span class="badge badge-unpaid">Out of Stock</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.name}</strong></td>
                <td>LKR ${item.price.toFixed(2)}</td>
                <td class="${statusClass}">${item.stock}</td>
                <td>${statusText}</td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="itemController.editMenuItem('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        document.getElementById('menuItemsCount').textContent = items.length;
    }

    addMenuItem() {
        const name = document.getElementById('itemName').value.trim();
        const price = parseFloat(document.getElementById('itemPrice').value);
        const stock = parseInt(document.getElementById('itemStock').value);

        const result = itemModel.addItem({ name, price, stock });
        alert(result.message);

        if (result.success) {
            this.loadMenuItems();
            this.clearItemForm();
        }
    }

    editMenuItem(id) {
        const item = itemModel.findItem(id);
        if (item) {
            document.getElementById('editItemId').value = id; // Store ID for update/delete
            document.getElementById('itemIdDisplay').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemStock').value = item.stock;

            document.getElementById('updateBtn').style.display = 'inline-block';
            document.getElementById('deleteBtn').style.display = 'inline-block';
        }
    }

    updateMenuItem() {
        const id = document.getElementById('editItemId').value;
        if (!id) return;

        const name = document.getElementById('itemName').value.trim();
        const price = parseFloat(document.getElementById('itemPrice').value);
        const stock = parseInt(document.getElementById('itemStock').value);

        const result = itemModel.updateItem(id, { name, price, stock });
        alert(result.message);

        if (result.success) {
            this.loadMenuItems();
            this.clearItemForm();
        }
    }

    deleteMenuItem() {
        const id = document.getElementById('editItemId').value;
        if (!id || !confirm('Are you sure you want to delete this item?')) return;

        const result = itemModel.deleteItem(id);
        alert(result.message);

        if (result.success) {
            this.loadMenuItems();
            this.clearItemForm();
        }
    }

    clearItemForm() {
        document.getElementById('editItemId').value = '';
        document.getElementById('itemIdDisplay').value = '';
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemStock').value = '';
        document.getElementById('updateBtn').style.display = 'none';
        document.getElementById('deleteBtn').style.display = 'none';
    }

    loadPOSMenu() {
        const items = itemModel.getMenuItems();
        const grid = document.getElementById('menuGrid');
        grid.innerHTML = '';

        items.forEach(item => {
            if (item.stock > 0) {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4';
                col.innerHTML = `
                    <div class="item-card" onclick="orderController.addToCart('${item.id}')">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-overlay">
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">LKR ${item.price.toFixed(2)}</div>
                                <div class="item-stock">${item.stock} in stock</div>
                            </div>
                        </div>
                        <div class="item-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">${item.name}</h5>
                                <span class="item-price">LKR ${item.price.toFixed(2)}</span>
                            </div>
                            <button class="add-to-cart">
                                <i class="fas fa-cart-plus me-2"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(col);
            }
        });
    }
}

const itemController = new ItemController();