import { settings, select, templates, classNames } from "../settings.js";
import utils from "../utils.js";

import BaseWidget from "./BaseWidget.js";

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    this.dom.input = wrapper.querySelector(select.widgets.hourPicker.input);
    this.dom.output = wrapper.querySelector(select.widgets.hourPicker.output);
    this.initPlugin();

    this.value = this.dom.input.value;
    
  }

  initPlugin() {
    let self = this;
    rangeSlider.create(this.dom.input);

    this.dom.input.addEventListener("input", function(e){
        self.value = e.target.value;
    })
  }

  parseValue(e) {
    return utils.numberToHour(e);
  }

  isValid(e) {
    return e;
  }

  renderValue() {
    this.dom.output.innerHTML = this.value;
  }
}

export default HourPicker;
