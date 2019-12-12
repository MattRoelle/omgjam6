import "./index.scss";
import Vue from "vue";
import "./components/game";

document.addEventListener("DOMContentLoaded", () => {
  const app = new Vue({
    el: "#game-root",
    data: {
      message: "test"
    }
  });
});
