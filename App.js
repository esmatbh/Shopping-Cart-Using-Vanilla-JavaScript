//Variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartItems = document.querySelector('.cart-items');
const productsDOM = document.querySelector('.products-center');

let cart = [];
// get products from products flie
class Products {
    async getProducts() {

        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;

            products = products.map(item => {
                    const { id } = item.sys;
                    const { title, price } = item.fields;
                    const image = item.fields.image.fields.file.url;

                    return { title, price, id, image };
                })
                //add counter for each product
            products.forEach(item => { item.count = 0; });

            return products;

        } catch (error) {
            console.log(error)
        }
    }
}

// Display products
class UI {

    // display products 
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
            <article class="product">
             <div class="img-container">
                <img src=${product.image}  class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                <i class="fa fa-shopping-cart"></i>
                    Add To bag
                </button>
             </div>
             <h3>${product.title}d</h3>
             <h4>$ ${Number(product.price).toFixed(2)}</h4>
            </article>`

        });
        productsDOM.innerHTML = result;
        document.querySelector('.cart-btn').addEventListener('click', () => {
            document.querySelector('.cart-overlay').style.visibility = "visible";
            document.querySelector('.cart').style.visibility = "visible";
        })

    }

    static getBagButtons() {
        // get Buttons
        const Buttons = [...document.querySelectorAll('.bag-btn')];
        // get Products
        const products = Storage.getProducts();
        // get Cart items
        cart = Storage.getCart();
        // to check if the product exist in the Cart
        let InCart = false;
        let isSelected = false;
        Buttons.forEach(button => {
            let id = button.dataset.id;
            // All selected items should have disabled buttons
            cart.forEach(item => {
                if (item.id === id) {
                    button.innerText = "IN CART";
                    button.disabled = true;
                    InCart = true;
                }
            })
            if (InCart === false) {
                button.innerText = "ADD TO BAG";
                button.disabled = false;
            }
            // Add event for product button
            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get selected product(filter will return array)
                const Selected = products.filter(product => {
                    return product.id === id;
                });
                const SelectedProduct = Selected[0];
                cart.forEach(item => {
                    if (item.id === SelectedProduct.id) {
                        SelectedProduct.count++;
                        isSelected = true;
                    }
                })
                if (isSelected === false) {
                    SelectedProduct.count = 0;
                    SelectedProduct.count++;
                    cart.push(SelectedProduct);
                }
                //display cart
                document.querySelector('.cart-overlay').style.visibility = "visible";
                document.querySelector('.cart').style.visibility = "visible";
                // save cart to local  Storage
                Storage.saveCart(cart);
                // call update cart to show selected product
                Cart.updateCart();
            })
        })
    }
}

//local storage 

class Storage {
    // save products to storage
    static saveProducts(products) {
            localStorage.setItem('products', JSON.stringify(products));
        }
        //get products from storage
    static getProducts() {
            const products = JSON.parse(localStorage.getItem('products'))
            return products;
        }
        // save cart to storage
    static saveCart(cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
            Cart.updateCart();
        }
        // get cart from storage
    static getCart() {

        let cart = JSON.parse(localStorage.getItem('cart'));
        if (cart === null) { cart = []; }
        return cart;
    }


}

class Cart {
    static updateCart() {
        let result = "";
        let Item = "";
        let itemTotal = 0;
        let total = 0;
        let itemsCount = 0;
        // get product from Storage
        cart = Storage.getCart();
        // display product in the cart
        cart.forEach(product => {
                itemsCount += product.count;
                itemTotal = product.count * product.price
                total += (product.count * product.price);
                result += `
            <div class="cart-item">
              <img src=${product.image}>

              <div>
                <h4>${product.title}</h4>
                <h5>$ ${Number(itemTotal).toFixed(2)}</h5>
                <span class="remove-item" id=${product.id}>remove</span>
              </div>
     
              <div>
                <i class="fa fa-chevron-up" id=${product.id}></i>
                <p class="item-amount">${product.count}</p>
                <i class="fa fa-chevron-down"  id=${product.id}></i>
              </div>
            </div>`
            })
            // display the amount of cart item 
        cartItems.innerText = itemsCount;
        //display the price of cart item 
        document.querySelector('.cart-total').innerText = total.toFixed(2);
        // showing items in the cart
        document.querySelector('.cart-content').innerHTML = result;
        // close cart 
        document.querySelector('.close-cart').addEventListener('click', () => {
                document.querySelector('.cart-overlay').style.visibility = "hidden";
                document.querySelector('.cart').style.visibility = "hidden";
            })
            // Clear Cart
        document.querySelector('.clear-cart').addEventListener("click", () => {
            cart = [];
            Storage.saveCart(cart);
            UI.getBagButtons();
        })

        // control item of cart
        if (cart.length !== 0) {
            //remove item from the cart
            let removeBtn = document.querySelectorAll('.remove-item');
            for (let index = 0; index < removeBtn.length; index++) {
                removeBtn[index].addEventListener('click', () => {
                    cart = cart.filter(item => {
                        return item.id !== removeBtn[index].id;
                    })
                    Storage.saveCart(cart);
                    UI.getBagButtons();
                    Cart.updateCart();
                })
            }

            // increase item
            let increaseBtn = document.querySelectorAll('.fa-chevron-up');
            for (let index = 0; index < increaseBtn.length; index++) {
                increaseBtn[index].addEventListener('click', () => {
                    cart.forEach(item => {
                        if (item.id === increaseBtn[index].id) {
                            item.count++;
                        }
                    })
                    Storage.saveCart(cart);
                    Cart.updateCart();
                })
            }
            // decrease item
            let decreaseBtn = document.querySelectorAll('.fa-chevron-down');
            for (let index = 0; index < decreaseBtn.length; index++) {
                decreaseBtn[index].addEventListener('click', () => {
                    cart.forEach(item => {
                        if (item.id === decreaseBtn[index].id) {
                            if (item.count > 1) { item.count--; }
                        }
                    })
                    Storage.saveCart(cart);
                    Cart.updateCart();
                })
            }

        }

    }
}

// when page loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => { UI.getBagButtons() }).then(() => { Cart.updateCart(); })

});