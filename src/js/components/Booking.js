import { settings, select, templates, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(container) {
    this.container = container;

    this.selectedToBook = null;

    this.render(this.container);
    this.initWidgets();
    this.getData();
    this.setListeners();
  }

  setListeners() {
    const self = this;
    this.dom.datePicker.onchange = function(e) {
      console.log("zmiana daty", e.target.classList);
      self.clearAllSelectedTables();
      self.updateDOM();
    };

    document.getElementById("confirmBookTable").onclick = function() {
      let finalOrder = {
        //  id: 1,
        phone: document.getElementById("phoneBooking").value,
        email: document.getElementById("emailBooking").value,
        date: self.datePicker.value,
        hour: self.hourPicker.value,
        table: parseInt(self.selectedToBook),
        duration: self.hoursAmount.value,
        ppl: self.peopleAmount.value,
        starters: []
      };
      for (let starter of document.getElementsByName("starter")){
        if(starter.checked){
          finalOrder.starters.push(starter.value);
        }
      }

      if(finalOrder.table){
        self.sendBooking(finalOrder);
      }else{
        alert("Musisz wybrać stolik");
      }
    };
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      "=" +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      "=" +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam]
    };

    const urls = {
      booking:
        settings.db.url +
        "/" +
        settings.db.booking +
        "?" +
        params.booking.join("&"),
      eventsCurrent:
        settings.db.url +
        "/" +
        settings.db.event +
        "?" +
        params.eventsCurrent.join("&"),
      eventsRepeat:
        settings.db.url +
        "/" +
        settings.db.event +
        "?" +
        params.eventsRepeat.join("&")
    };

    console.log(`getData urls`, urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function(allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  sendBooking(order){
    const url = `${settings.db.url}/${settings.db.booking}`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      })
      .then(function(parsedResponse) {
        console.log(parsedResponse);
        alert("Zamówienie Gotowe!");
        window.location.reload();
      });

    console.log(order);
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const self = this;

    self.booked = {};

    for (let item of eventsCurrent) {
      self.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of bookings) {
      self.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = this.datePicker.minDate;
    const maxDate = this.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == "daily") {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          self.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    console.log(this.booked);
    this.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    if (typeof this.booked[date] == "undefined") {
      this.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof this.booked[date][hourBlock] == "undefined") {
        this.booked[date][hourBlock] = [];
      }

      this.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const self = this;

    let tableStatus = [] //.l = 24 => amount 

    this.date = this.datePicker.value;
    this.hour = utils.hourToNumber(this.hourPicker.value);

    let allAvailable = false;

    if (
      typeof this.booked[this.date] == "undefined" ||
      typeof this.booked[this.date][this.hour] == "undefined"
    ) {
      allAvailable = true;
    }

    this.hourPicker.applyBackground(this.booked[this.date], allAvailable);

    for (let table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable &&
        this.booked[this.date][this.hour].includes(tableId)
      ) {
        console.log("koloruje stolik ", tableId);
        table.classList.add(classNames.booking.tableBooked);
        table.onclick = function() {
          return;
        };
      } else {
        console.log("nie koloruje stolika ", tableId);
        table.classList.remove(classNames.booking.tableBooked);

        table.onclick = function(e) {
          let selected = e.target;
          let tableId = selected.getAttribute(
            settings.booking.tableIdAttribute
          );
          for (let tab of self.dom.tables) {
            tab.classList.remove("wantToBook");
          }
          table.classList.add("wantToBook");
          self.selectedToBook = tableId;

          console.log(self.selectedToBook);
        };
      }
    }
  }

  clearAllSelectedTables() {
    this.selectedToBook = null;

    for (let table of this.dom.tables) {
      table.classList.remove("wantToBook");
      table.onclick = function() {
        return;
      };
    }
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
    this.dom.datePicker = this.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    this.dom.hourPicker = this.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );

    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    //const generatedDOM = utils.createDOMFromHTML(generatedHTML);
  }

  initWidgets() {
    const self = this;
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener("updated", function(e) {
      console.log(e.target.classList);

      if (
        e.target.classList.contains("flatpickr-input") ||
        e.target.classList.contains("hour-picker")
      ) {
        self.clearAllSelectedTables();
        self.updateDOM();
      }
    });
  }
}

export default Booking;
