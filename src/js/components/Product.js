import { select, classNames, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Product {
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.element = {};
    this.renderInMenu();
    this.getElements();
    this.initAccordion();
    this.initOrderForm();
    this.initAmountWidget();
    this.processOrder(); // invoke once for setup everything properly
    this.price = this.data.price;
    // console.log('nowy produkt= ', this);
  }

  initAmountWidget() {
    const self = this;
    this.amountWidget = new AmountWidget(this.amountWidgetElem);
    this.amountWidgetElem.addEventListener("updated", function(e) {
      self.processOrder();
    });
  }

  renderInMenu() {
    const generatedHTML = templates.menuProduct(this.data);
    this.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(this.element);
    // console.log(this.element);
  }

  getElements() {
    this.accordionTrigger = this.element.querySelector(
      select.menuProduct.clickable
    );
    this.form = this.element.querySelector(select.menuProduct.form);
    this.formInputs = this.form.querySelectorAll(select.all.formInputs);
    this.cartButton = this.element.querySelector(select.menuProduct.cartButton);
    this.priceElem = this.element.querySelector(select.menuProduct.priceElem);
    this.imageWrapper = this.element.querySelector(
      select.menuProduct.imageWrapper
    );
    this.amountWidgetElem = this.element.querySelector(
      select.menuProduct.amountWidget
    );
    // console.log('imgwrap', this.imageWrapper);
  }

  initAccordion() {
    const clickableHeader = this.accordionTrigger;
    clickableHeader.addEventListener("click", clickHandlerHeader);

    function clickHandlerHeader(event) {
      // console.log(this);
      const allArticles = document.querySelectorAll(select.all.menuProducts);
      // console.log("parents", allArticles);

      let thisArticle = this.parentNode;

      // console.log(thisArticle.tagName);

      for (let article of allArticles) {
        if (article != thisArticle) {
          article.classList.remove(classNames.menuProduct.wrapperActive);
        } else {
          article.classList.toggle(classNames.menuProduct.wrapperActive);
        }
      }
    }
  }

  initOrderForm() {
    const thisProduct = this;
    // console.log('initOrderForm');
    this.form.addEventListener("submit", function(event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of this.formInputs) {
      input.addEventListener("change", function() {
        thisProduct.processOrder();
      });
    }

    this.cartButton.addEventListener("click", function(event) {
      event.preventDefault();
      thisProduct.processOrder();
      //app.cart.addToCart(thisProduct);

      const eve = new CustomEvent("add-to-cart", {
        bubbles: true,
        detail: {
          product: thisProduct
        }
      });

      thisProduct.element.dispatchEvent(eve);
    });
  }

  processOrder() {
    // console.log('processOrder');
    const self = this;
    this.params = {};
    this.price = this.data.price;
    const formData = utils.serializeFormToObject(this.form);

    // console.log('formData', formData);
    for (let param in this.data.params) {
      for (let option in this.data.params[param].options) {
        let isDefault = this.data.params[param].options[option].default;
        let thisPrice = this.data.params[param].options[option].price;

        if (typeof isDefault == "undefined") {
          isDefault = false;
        }
        // console.log("klucz: ", option, "default: ", isDefault, "price: ", thisPrice);

        const optionSelected =
          formData.hasOwnProperty(param) &&
          formData[param].indexOf(option) > -1;
        // console.log(optionSelected);
        if (optionSelected && !isDefault) {
          // console.log("dodaje");
          this.price = this.price + thisPrice;
        } else if (!optionSelected && isDefault) {
          // console.log("odejmuje")
          this.price = this.price - thisPrice;
        }
        //  qs(`.${param}-${option}`)

        let thisImage = self.element.querySelector(`.${param}-${option}`);

        if (optionSelected && thisImage) {
          // check if exists

          if (!this.params[param]) {
            this.params[param] = {
              label: this.data.params[param].label,
              options: {}
            };
          }

          this.params[param].options[option] = this.data.params[param].options[
            option
          ].label;

          thisImage.classList.add(classNames.menuProduct.imageVisible);
        } else if (thisImage) {
          // else but still if exists
          thisImage.classList.remove(classNames.menuProduct.imageVisible);
          // console.log('obrazek= 'thisImage);
        }
      }
    }
    this.priceSingle = this.price;
    this.price = this.priceSingle * this.amountWidget.value;

    this.priceElem.innerHTML = this.price;
    // console.error(this.price);
    // console.log(this.params);
  }
}

export default Product;
