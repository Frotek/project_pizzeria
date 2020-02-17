import BaseWidget from "./BaseWidget.js";
import { settings, select, templates, classNames } from "../settings.js";
import utils from "../utils.js";

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    this.dom.input = wrapper.querySelector(select.widgets.datePicker.input);
    this.initPlugin();
    console.log(utils.dateToStr(new Date()))
  }

  initPlugin() {
    const self = this;
    this.minDate = new Date(this.value);
    this.maxDate = utils.addDays(
      this.minDate,
      settings.datePicker.maxDaysInFuture
    );

    flatpickr(this.dom.input, {
      defaultDate: utils.dateToStr(this.minDate),
      minDate: utils.dateToStr(this.minDate),
      maxDate: utils.dateToStr(this.maxDate),
      locale: {
        firstDayOfWeek: 1
      },
      disable: [
        function(date) {
          // return true to disable
          return date.getDay() === 1;
        }
      ],
      onChange: function(selectedDates, dateStr) {
        self.value = dateStr;
      }
    });

    this.dom.input.value = utils.dateToStr(this.minDate);
  }

  parseValue(e) {
    return e;
  }

  isValid(e) {
    return e;
  }

  renderValue() {
    return;
  }
}

export default DatePicker;
