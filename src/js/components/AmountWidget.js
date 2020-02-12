import { settings, select } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    this.getElements(this.dom.wrapper);
    this.initActions();

    // console.log(this);
    // console.log(this.dom.wrapper);
  }

  getElements() {
    this.dom.input = this.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    this.dom.linkDecrease = this.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    this.dom.linkIncrease = this.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }


  isValid(value) {
    let definedValues = {
      min: settings.amountWidget.defaultMin,
      max: settings.amountWidget.defaultMax
    };

    console.log(definedValues);

    // validations
    if (Number.isNaN(value) == false) {
      // if not NaN
      if (value >= definedValues.min && value <= definedValues.max) {
        //if in range 1-9
        return value;
      } else if (this.dom.input.value < definedValues.min) {
        // if less than min
        return definedValues.min;
      } else if (this.dom.input.value > definedValues.max) {
        // if more than max
        return definedValues.max;
      }else{
        return definedValues.min;
      }
    } else {
      //if Nan -> set value to min
      return definedValues.min;
    }
  }

  renderValue(){
    this.dom.input.value = this.value;
  }

  initActions() {
    const self = this;

    this.dom.input.addEventListener("change", function() {
      // console.log("changed");

      self.setValue(self.dom.input.value);
    });

    this.dom.linkDecrease.addEventListener("click", function(event) {
      // console.log("clicked -1");
      event.preventDefault();
      self.setValue(self.value - 1);
    });

    this.dom.linkIncrease.addEventListener("click", function(event) {
      // console.log("changed +1");
      event.preventDefault();
      self.setValue(self.value + 1);
    });
  }
}

export default AmountWidget;
