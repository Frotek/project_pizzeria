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
    this.applyBackground();
  }

  applyBackground(booking, allAvailable) {
    //25 bloców
    if (booking) {
      let colorPattern = [];
      let colorBindings = {
        "0": "green",
        "1": "green",
        "2": "orange",
        "3": "red"
      };

      let finalStringPattern = "linear-gradient(to right, ";

      for (let i = settings.hours.open; i <= settings.hours.close; i += 0.5) {
        let j = i;
        if (j == 24) {
          j = 0;
        }
        if (booking[j]) {
          console.log(booking[j].length);
          colorPattern.push(booking[j].length);
        } else {
          console.log("brak");
          colorPattern.push(0);
        }
      }
      // generate gradient

      for (let i = 0; i < colorPattern.length; i++) {
        let step = 4;
        let percent = i * step;

        let singleString = ` ${
          colorBindings[colorPattern[i]]
        } ${percent}% ${percent + step}%`;
        if (i != colorPattern.length - 1) {
          //not last
          singleString += ",";
        }
        finalStringPattern += singleString;
      }
      finalStringPattern += ")";

      console.log(finalStringPattern);
      const instance = document.getElementsByClassName("rangeSlider")[0];
      instance.style.background = finalStringPattern;
    }
   
  }

  initPlugin() {
    let self = this;
    rangeSlider.create(this.dom.input, {
      fillClass: ""
    });

    this.dom.input.addEventListener("input", function(e) {
      self.value = e.target.value;
    });
    console.log();
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
