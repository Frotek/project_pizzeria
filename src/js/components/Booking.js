import { settings, select, templates, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Booking {
  constructor(container) {
    this.container = container;

    this.render(this.container);
    this.initWidgets();
  }

  render(container) {
    const generatedHTML = templates.bookingWidget();

    this.dom = {};
    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = generatedHTML;
    this.dom.peopleAmount = this.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    this.dom.hoursAmount = this.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    //const generatedDOM = utils.createDOMFromHTML(generatedHTML);
  }

  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
  }
}

export default Booking;
