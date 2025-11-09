// js/dto/ItemDTO.js

class ItemDTO {
    constructor(id, name, price, stock, image) {
        this.id = id;
        this.name = name;
        this.price = parseFloat(price);
        this.stock = parseInt(stock);
        this.image = image;
    }
}