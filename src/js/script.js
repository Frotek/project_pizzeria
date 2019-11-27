/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {

    constructor(id, data) {
      this.id = id;
      this.data = data;
      this.renderInMenu();
      this.getElements();
      this.initAccordion();
      this.initOrderForm();
      this.element = {};
      this.price = this.data.price;
      // console.log('new product=', this);
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
    }


    initAccordion() {
      const clickableHeader = this.accordionTrigger;
      clickableHeader.addEventListener('click', clickHandlerHeader);

      function clickHandlerHeader(event) {
        console.log(this);
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
      console.log('initOrderForm');
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
      });
    }

    processOrder() {
      console.log('processOrder');
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
          //console.log("klucz: ", option, "default: ", isDefault, "price: ", thisPrice);

          const optionSelected = formData.hasOwnProperty(param) && formData[param].indexOf(option) > -1;
          // console.log(optionSelected);
          if (optionSelected && !isDefault) {
            // console.log("dodaje");
            this.price = this.price + thisPrice;
          } else if (!optionSelected && isDefault) {
            // console.log("odejmuje")
            this.price = this.price - thisPrice;
          }
        }
      }
      this.priceElem.innerHTML = this.price;
      // console.error(this.price);
    }
  }

  const app = {
    initMenu: function () {
      this.initData();
      // console.log(this.data);

      for (let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },

    initData: function () {
      this.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      this.initMenu();
    },
  };

  app.init();
}
