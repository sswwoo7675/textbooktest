var Receiver = {
  port: undefined,
  connect: function () {
    const handleMessage = (event) => {
      /*
      if (event.origin !== "*") {
        return;
      }
      */
      [this.port] = event.ports || [];
      if (!this.port) {
        return;
      }

      // this.port2.postMessage({command: "success", params: {}});
      this.port.onmessage = this.onmessage;
      window.removeEventListener("message", handleMessage);

      console.log("Message channel connect success...");
    }
    window.addEventListener("message", handleMessage);
  },
  onmessage: function (event) {}
};