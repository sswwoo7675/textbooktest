class Events {
  constructor(el) {
    this.events = {};
    if (!el) {
      this.el = document.createElement("div");
    } else {
      this.el = el;
    }
    return this;
  }

  createEvent(event) {
    var e = new CustomEvent(event);
    this.events[event] = e;
    return e;
  }

  on(event, func, bindto) {
    if (!this.events[event]) {
      this.createEvent(event);
    }
    if (bindto) {
      this.el.addEventListener(event, func.bind(bindto), false);
    } else {
      this.el.addEventListener(event, func, false);
    }
  }

  off(event, func) {
    this.el.removeEventListener(event, func, false);
  }

  trigger(event, data) {
    var e;
    if (!this.events[event]) {
      e = this.createEvent(event);
    } else {
      e = this.events[event];
    }
    if (data) {
      e.data = data;
    }
    this.el.dispatchEvent(e);
  }
}