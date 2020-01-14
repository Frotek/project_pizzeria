import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";

const app = {
  initPages: function() {
    let self = this;
    self.pages = document.querySelector(select.containerOf.pages).children;
    self.navLinks = document.querySelector(select.nav.links);

    const idFromHash = window.location.hash.replace("#/", "");

    let pageMatchingHash = self.pages[0];

    for (let page of self.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    self.activatePage(pageMatchingHash);

    for (let link of self.navLinks) {
      link.addEventListener("click", function(event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute("href").replace("#", "");
        self.activatePage(id);

        window.location.hash = `#/${id}`;
      });
    }
  },

  activatePage: function(pageId) {
    let self = this;

    self.pages = document.querySelector(select.containerOf.pages).children;
    self.navLinks = document.querySelectorAll(select.nav.links);

    for (let page of self.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    console.log(self.navLinks);

    for (let link of self.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute("href") == `#${pageId}`
      );
    }
  },

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
    this.initPages();
    this.initData();
    this.initCart();
    this.initBooking();
  },

  initCart: function() {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    this.productList = document.querySelector(select.containerOf.menu);

    this.productList.addEventListener("add-to-cart", function(event) {
      app.cart.addToCart(event.detail.product);
    });
  },

  initBooking: function() {
    const bookingElem = document.querySelector(select.containerOf.booking);
    this.booking = new Booking(bookingElem);
  }
};

app.init();
