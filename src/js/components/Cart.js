import { settings, select, templates, classNames } from "../settings.js";
import utils from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
  constructor(element) {
    const thisCart = this;
    this.products = [];
    this.getElements(element);
    this.initActions();
    this.deliveryFee = settings.cart.defaultDeliveryFee;
    // console.log('new Cart', this);
  }

  update() {
    this.totalNumber = 0;
    this.subtotalPrice = 0;

    for (let product of this.products) {
      this.subtotalPrice += product.price;
      this.totalNumber += product.amount;
    }

    this.totalPrice = this.subtotalPrice + this.deliveryFee;

    console.log(`
      TOTALNA CENA! MÓWIE CI! \n
      totalNumber: ${this.totalNumber} \n
      subtotalPrice: ${this.subtotalPrice} \n
      totalPrice: ${this.totalPrice} \n
      DONT DELAY! BUY TODAY!
      `);

    for (let key of this.renderTotalsKeys) {
      for (let elem of this.dom[key]) {
        elem.innerHTML = this[key];
      }
    }
  }

  getElements(element) {
    this.dom = {};
    this.dom.inputs = {};

    this.dom.wrapper = element;
    this.dom.productList = element.querySelector(".cart__order-summary");
    this.dom.toggleTrigger = this.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
    this.dom.inputs.phone = this.dom.wrapper.querySelector(select.cart.phone);
    this.dom.inputs.address = this.dom.wrapper.querySelector(
      select.cart.address
    );

    this.renderTotalsKeys = [
      "totalNumber",
      "totalPrice",
      "subtotalPrice",
      "deliveryFee"
    ];

    for (let key of this.renderTotalsKeys) {
      this.dom[key] = this.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions() {
    const self = this;

    this.dom.productList.addEventListener("updated", function() {
      self.update();
    });

    this.dom.productList.addEventListener("remove", function() {
      self.remove(event.detail.cartProduct);
    });

    this.dom.toggleTrigger.addEventListener("click", function(event) {
      self.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    this.dom.form.addEventListener("submit", function(event) {
      event.preventDefault();
      self.sendOrder();
    });
  }

  sendOrder() {
    const url = `${settings.db.url}/${settings.db.order}`;

    const payload = {
      phone: this.dom.inputs.phone.value,
      address: this.dom.inputs.address.value,
      totalNumber: this.totalPrice,
      subtotalPrice: this.subtotalPrice,
      totalPrice: this.totalPrice,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: []
    };

    for (let product of this.products) {
      payload.products.push(product.getData());
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      })
      .then(function(parsedResponse) {
        console.log(parsedResponse);
      });
  }

  remove(cartProduct) {
    const ind = this.products.indexOf(cartProduct);

    this.products.splice(ind, 1);
    console.log(cartProduct.dom.wrapper);
    document
      .querySelector(".cart__order-summary")
      .removeChild(cartProduct.dom.wrapper);
    this.update();
  }

  add(menuProduct) {
    // console.log("adding product ", menuProduct)

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    this.products.push(new CartProduct(menuProduct, generatedDOM));
    this.dom.productList.appendChild(generatedDOM);
    // console.log(this.element);
    console.warn(this.products);
    this.update();
  }

  addToCart(product) {
    product.name = product.data.name;
    product.amount = product.amountWidget.value;
    this.add(product);
  }
}

export default Cart;
