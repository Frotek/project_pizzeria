import { settings, select } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";

const app = {
  initMenu: function() {
    // console.log(this.data);

    for (let productData in this.data.products) {
      new Product(
        this.data.products[productData].id,
        this.data.products[productData]
      );
    }
  },

  initData: function() {
    const self = this;
    this.data = {};
    const url = `${settings.db.url}/${settings.db.product}`;
    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log("parsedResponse", parsedResponse);
        self.data.products = parsedResponse;
        self.initMenu();
      });
    console.log("thisApp.data", JSON.stringify(self.data));
  },

  init: function() {
    this.initData();
    this.initCart();
  },

  initCart: function() {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    this.productList = document.querySelector(select.containerOf.menu);

    this.productList.addEventListener("add-to-cart", function(event) {
      app.cart.addToCart(event.detail.product);
    });
  }
};

app.init();
