import BaseWidget from "./BaseWidget.js";
import { settings, select, templates, classNames } from "../settings.js";
import utils from "../utils.js";

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    this.dom.input = wrapper.querySelector(select.widgets.datePicker.input);

    this.initPlugin();
  }

  initPlugin() {
    this.minDate = new Date(this.value);
    this.maxDate = utils.addDays(
      this.minDate,
      settings.datePicker.maxDaysInFuture
    );

    
    
    flatpickr(this.dom.input, {
      minDate: utils.dateToStr(this.minDate),
      maxDate: utils.dateToStr(this.maxDate),
      defaultDate: utils.dateToStr(this.minDate),
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
        this.value = dateStr;
      }
    });
  }

  parseValue(e) {
    return e;
  }

  isValid() {
    return true;
  }

  renderValue() {
    return;
  }
}

export default DatePicker;
