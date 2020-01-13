import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class CartProduct {
  constructor(menuProduct, element) {
    this.menuProduct = menuProduct;
    this.element = element;

    this.id = menuProduct.id;
    this.name = menuProduct.name;
    this.price = menuProduct.price;
    this.priceSingle = menuProduct.priceSingle;
    this.amount = menuProduct.amount;
    this.params = JSON.parse(JSON.stringify(menuProduct.params));

    this.getElements(element);
    this.initAmountWidget();
    this.initActions();
    // console.log(this);
  }

  getData() {
    return {
      id: this.id,
      amount: this.amount,
      price: this.price,
      priceSingle: this.priceSingle,
      params: this.params
    };
  }

  remove() {
    const self = this;
    const event = new CustomEvent("remove", {
      bubbles: true,
      detail: {
        cartProduct: self
      }
    });
    this.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const self = this;

    this.dom.edit.addEventListener("click", function(e) {
      e.preventDefault();
    });

    this.dom.remove.addEventListener("click", function(e) {
      e.preventDefault();
      self.remove();
      console.log("removed");
    });
  }

  getElements(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.amountWidget = this.dom.wrapper.querySelector(
      select.cartProduct.amountWidget
    );
    this.dom.price = this.dom.wrapper.querySelector(select.cartProduct.price);
    this.dom.edit = this.dom.wrapper.querySelector(select.cartProduct.edit);
    this.dom.remove = this.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  initAmountWidget() {
    const self = this;
    this.amountWidget = new AmountWidget(this.dom.amountWidget);
    this.amountWidget.setValue(this.amount);
    this.dom.amountWidget.addEventListener("updated", function(e) {
      console.log(self.amountWidget.value);
      self.price = self.priceSingle * self.amountWidget.value;
      console.log(self.price);
      self.dom.price.innerHTML = self.price;
      //! TUTAJ JEST ŚMIERĆ
    });

    this.amount = this.amountWidget.value;
    this.price = this.priceSingle * this.amount;

    this.dom.price.value = this.price;
    console.log(this.amountWidget);
  }
}

export default CartProduct;
