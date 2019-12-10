/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';


  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED\
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    //CODE ADDED END
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    //END_ADDED_CODE
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };


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
      this.amountWidgetElem.addEventListener('updated', function (e) {
        self.processOrder();
      })
    }

    renderInMenu() {
      const generatedHTML = templates.menuProduct(this.data);
      this.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
      // console.log(this.element);
    }

    getElements() {
      this.accordionTrigger = this.element.querySelector(select.menuProduct.clickable);
      this.form = this.element.querySelector(select.menuProduct.form);
      this.formInputs = this.form.querySelectorAll(select.all.formInputs);
      this.cartButton = this.element.querySelector(select.menuProduct.cartButton);
      this.priceElem = this.element.querySelector(select.menuProduct.priceElem);
      this.imageWrapper = this.element.querySelector(select.menuProduct.imageWrapper);
      this.amountWidgetElem = this.element.querySelector(select.menuProduct.amountWidget);
      // console.log('imgwrap', this.imageWrapper);
    }



    initAccordion() {
      const clickableHeader = this.accordionTrigger;
      clickableHeader.addEventListener('click', clickHandlerHeader);

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
      this.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of this.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      this.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        app.cart.addToCart(thisProduct);
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

          if (typeof (isDefault) == 'undefined') {
            isDefault = false;
          }
          // console.log("klucz: ", option, "default: ", isDefault, "price: ", thisPrice);

          const optionSelected = formData.hasOwnProperty(param) && formData[param].indexOf(option) > -1;
          // console.log(optionSelected);
          if (optionSelected && !isDefault) {
            // console.log("dodaje");
            this.price = this.price + thisPrice;
          } else if (!optionSelected && isDefault) {
            // console.log("odejmuje")
            this.price = this.price - thisPrice;
          }
          //  qs(`.${param}-${option}`)

          let thisImage = self.element.querySelector(`.${param}-${option}`)

          if (optionSelected && thisImage) { // check if exists

            if (!this.params[param]) {
              this.params[param] = {
                label: this.data.params[param].label,
                options: {}
              };
            };

            this.params[param].options[option] = this.data.params[param].options[option].label;

            thisImage.classList.add(classNames.menuProduct.imageVisible);
          } else if (thisImage) { // else but still if exists
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

  class AmountWidget {
    constructor(element) {
      this.element = element;
      this.input = null;
      this.linkDecrease = null;
      this.linkIncrease = null;
      this.value = null;

      this.getElements(this.element);
      this.input.value = settings.amountWidget.defaultValue;
      this.setValue(this.input.value);
      this.initActions();

      // console.log(this);
      // console.log(this.element);
    }

    getElements() {
      this.input = this.element.querySelector(select.widgets.amount.input);
      this.linkDecrease = this.element.querySelector(select.widgets.amount.linkDecrease);
      this.linkIncrease = this.element.querySelector(select.widgets.amount.linkIncrease);
    }


    setValue(value) {

      let definedValues = {
        min: settings.amountWidget.defaultMin,
        max: settings.amountWidget.defaultMax
      };

      const newValue = parseInt(value);

      // validations
      if (Number.isNaN(newValue) == false) { // if not NaN
        if (newValue >= definedValues.min && newValue <= definedValues.max) { //if in range 1-9
          this.value = newValue;
        } else if (this.input.value < definedValues.min) { // if less than min
          this.value = definedValues.min;
        } else if (this.input.value > definedValues.max) { // if more than max
          this.value = definedValues.max;
        }
      } else { //if Nan -> set value to min
        this.value = definedValues.min;
      }
      this.input.value = this.value;
      this.announce();
    }

    initActions() {
      const self = this;

      this.input.addEventListener('change', function () {
        // console.log("changed");

        self.setValue(self.input.value);
      });

      this.linkDecrease.addEventListener('click', function (event) {
        // console.log("clicked -1");
        event.preventDefault();
        self.setValue(self.value - 1);
      });

      this.linkIncrease.addEventListener('click', function (event) {
        // console.log("changed +1");
        event.preventDefault();
        self.setValue(self.value + 1);
      });
    }

    announce() {
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }
  }

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
      this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
      this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
      this.dom.inputs.phone = this.dom.wrapper.querySelector(select.cart.phone);
      this.dom.inputs.address = this.dom.wrapper.querySelector(select.cart.address);

      this.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for (let key of this.renderTotalsKeys) {
        this.dom[key] = this.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }

    initActions() {
      const self = this;

      this.dom.productList.addEventListener('updated', function () {
        self.update();
      });

      this.dom.productList.addEventListener('remove', function () {
        self.remove(event.detail.cartProduct);
      });

      this.dom.toggleTrigger.addEventListener('click', function (event) {
        self.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      this.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        self.sendOrder();
      })
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options).then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log(parsedResponse);
      })
    }

    remove(cartProduct) {
      const ind = this.products.indexOf(cartProduct);

      this.products.splice(ind, 1);
      console.log(cartProduct.dom.wrapper);
      document.querySelector(".cart__order-summary").removeChild(cartProduct.dom.wrapper);
      this.update();
    }

    add(menuProduct) {
      // console.log("adding product ", menuProduct)

      const generatedHTML = templates.cartProduct(menuProduct)
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
      app.cart.add(product);
    }

  }

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
      return ({
        id: this.id,
        amount: this.amount,
        price: this.price,
        priceSingle: this.priceSingle,
        params: this.params
      })
    }

    remove() {
      const self = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: self
        }
      });
      this.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const self = this;

      this.dom.edit.addEventListener('click', function (e) {
        e.preventDefault();
      });

      this.dom.remove.addEventListener('click', function (e) {
        e.preventDefault();
        self.remove();
        console.log("removed");
      });

    }

    getElements(element) {
      this.dom = {};
      this.dom.wrapper = element;
      this.dom.amountWidget = this.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      this.dom.price = this.dom.wrapper.querySelector(select.cartProduct.price);
      this.dom.edit = this.dom.wrapper.querySelector(select.cartProduct.edit);
      this.dom.remove = this.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const self = this;
      this.amountWidget = new AmountWidget(this.dom.amountWidget);
      this.amountWidget.setValue(this.amount);
      this.dom.amountWidget.addEventListener('updated', function (e) {
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

  const app = {
    initMenu: function () {
      // console.log(this.data);

      for (let productData in this.data.products) {
        new Product(this.data.products[productData].id, this.data.products[productData]);
      }
    },

    initData: function () {
      const self = this;
      this.data = {};
      const url = `${settings.db.url}/${settings.db.product}`;
      fetch(url).then(function (rawResponse) {
        return rawResponse.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        self.data.products = parsedResponse;
        self.initMenu();
      });
      console.log('thisApp.data', JSON.stringify(self.data));
    },

    init: function () {
      this.initData();
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);
      this.initCart();
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
}
