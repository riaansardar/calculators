const display = document.getElementById("display");
const message = document.getElementById("message");
const buttons = document.querySelector(".buttons");
let lastAnswer = 0;

function factorial(number) {
  if (!Number.isInteger(number) || number < 0 || number > 170) {
    throw new Error("Factorial needs a whole number from 0 to 170.");
  }
  let result = 1;
  for (let i = 2; i <= number; i++) result *= i;
  return result;
}

// Convert calculator symbols and functions into JavaScript Math expressions.
function prepareExpression(expression) {
  let value = expression.replace(/\s+/g, "");
  if (!value) throw new Error("Enter a calculation first.");

  // Handle factorial, including simple numeric operands such as 5!
  value = value.replace(/(\d+(?:\.\d+)?|\([^()]*\))!/g, "factorial($1)");
  value = value.replace(/\bpi\b/gi, "Math.PI");
  value = value.replace(/\be\b/g, "Math.E");
  value = value.replace(/\bAns\b/g, "(" + String(lastAnswer) + ")");
  value = value.replace(/\bsqrt\(/g, "Math.sqrt(");
  value = value.replace(/\blog\(/g, "Math.log10(");
  value = value.replace(/\bln\(/g, "Math.log(");
  value = value.replace(/\bsin\(/g, "Math.sin((Math.PI/180)*(");
  value = value.replace(/\bcos\(/g, "Math.cos((Math.PI/180)*(");
  value = value.replace(/\btan\(/g, "Math.tan((Math.PI/180)*(");

  // Close the extra parenthesis added for degree-based trigonometric functions.
  // This supports a simple function argument; e.g. sin(30) becomes Math.sin(...(30)).
  value = value.replace(/(Math\.(?:sin|cos|tan)\(\(Math\.PI\/180\)\*\(([^()]*)\))/g, "$1)");
  value = value.replace(/\^/g, "**");

  // Allow only characters and tokens used by this calculator.
  if (!/^[0-9+\-*/().,!A-Za-z]*$/.test(value)) {
    throw new Error("Please enter a valid calculation.");
  }
  const identifiers = value.match(/[A-Za-z]+/g) || [];
  const allowed = new Set(["Math", "PI", "E", "sqrt", "log10", "log", "sin", "cos", "tan", "factorial"]);
  if (identifiers.some((word) => !allowed.has(word))) {
    throw new Error("Please use the calculator buttons for functions.");
  }
  return value;
}

function calculateExpression(expression) {
  const prepared = prepareExpression(expression);
  const result = Function("factorial", '"use strict"; return (' + prepared + ')')(factorial);
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("This calculation is not possible.");
  }
  lastAnswer = result;
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
  if (button.dataset.action === "sign") {
    if (display.value) display.value = "-(" + display.value + ")";
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
  display.value += button.dataset.value ?? button.dataset.insert ?? "";
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
