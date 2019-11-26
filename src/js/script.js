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
      this.initAccordion();

      this.element = {};
      // console.log('new product=', this);
    }

    renderInMenu() {
      const generatedHTML = templates.menuProduct(this.data);
      this.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
      // console.log(this.element);
    }

    initAccordion() {
      const clickableHeader = this.element.querySelector(select.menuProduct.clickable);


      clickableHeader.addEventListener('click', clickHandlerHeader);


      function clickHandlerHeader(event) {
        const allArticles = document.querySelectorAll(select.all.menuProducts);
        // console.log("parents", allArticles);

        let thisArticle = event.target.parentNode.parentNode; //default when clicked on h3

        if (thisArticle.tagName !== "ARTICLE") { // if clicked on i
          thisArticle = thisArticle.parentNode;
        }

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
