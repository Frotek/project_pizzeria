import { settings, select } from "../settings.js";

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
    this.linkDecrease = this.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    this.linkIncrease = this.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  setValue(value) {
    let definedValues = {
      min: settings.amountWidget.defaultMin,
      max: settings.amountWidget.defaultMax
    };

    const newValue = parseInt(value);

    // validations
    if (Number.isNaN(newValue) == false) {
      // if not NaN
      if (newValue >= definedValues.min && newValue <= definedValues.max) {
        //if in range 1-9
        this.value = newValue;
      } else if (this.input.value < definedValues.min) {
        // if less than min
        this.value = definedValues.min;
      } else if (this.input.value > definedValues.max) {
        // if more than max
        this.value = definedValues.max;
      }
    } else {
      //if Nan -> set value to min
      this.value = definedValues.min;
    }
    this.input.value = this.value;
    this.announce();
  }

  initActions() {
    const self = this;

    this.input.addEventListener("change", function() {
      // console.log("changed");

      self.setValue(self.input.value);
    });

    this.linkDecrease.addEventListener("click", function(event) {
      // console.log("clicked -1");
      event.preventDefault();
      self.setValue(self.value - 1);
    });

    this.linkIncrease.addEventListener("click", function(event) {
      // console.log("changed +1");
      event.preventDefault();
      self.setValue(self.value + 1);
    });
  }

  announce() {
    const event = new CustomEvent("updated", {
      bubbles: true
    });
    this.element.dispatchEvent(event);
  }
}

export default AmountWidget;
