const display = document.getElementById("display");
const message = document.getElementById("message");
const buttons = document.querySelector(".buttons");

// Only allow calculator characters before evaluating an arithmetic expression.
function calculateExpression(expression) {
  const cleaned = expression.replace(/\s+/g, "");
  if (!cleaned || !/^[0-9+\-*/().]+$/.test(cleaned)) {
    throw new Error("Please enter a valid calculation.");
  }
  const result = Function('"use strict"; return (' + cleaned + ')')();
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("This calculation is not possible.");
  }
  return Number.parseFloat(result.toPrecision(12)).toString();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  message.textContent = "";

  if (button.dataset.action === "clear") {
    display.value = "";
    return;
  }

  if (button.dataset.action === "delete") {
    display.value = display.value.slice(0, -1);
    return;
  }

  if (button.dataset.action === "calculate") {
    try {
      display.value = calculateExpression(display.value);
    } catch (error) {
      message.textContent = error.message || "Invalid calculation.";
    }
    return;
  }

  display.value += button.dataset.value;
});

display.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    try {
      display.value = calculateExpression(display.value);
      message.textContent = "";
    } catch (error) {
      message.textContent = error.message || "Invalid calculation.";
    }
  } else if (event.key === "Escape") {
    display.value = "";
    message.textContent = "";
  }
});
