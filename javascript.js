const displayText = document.querySelector("#display-text");

// This array will always contain two operands at most, both of which to be used in the next expression.
const operands = [];

// This variable will hold an object containing both the operator of the next operation to be performed,
// and a function that performs the operation.
let currentOperation;

// This variable will only be defined when the result of an expression is calculated and being displayed.
// Any actions that take place while the result variable is defined will either clear the variable
// entirely, or move its value to the operands array for future operations.
let result;

// The current operation will be retrieved from this object when the user enters an operator.
const operations = {
    addition: new Operation("+", (operand1, operand2) => operand1 + operand2),
    subtraction: new Operation("-", (operand1, operand2) => operand1 - operand2),
    multiplication: new Operation("x", (operand1, operand2) => operand1 * operand2),
    division: new Operation("/", (operand1, operand2) => {
        if (operand2 === 0) return "CAN'T DIVIDE BY 0";
        else return operand1 / operand2;
    }),
};

const body = document.querySelector("body"); 
["click", "keydown"].forEach((eventType) => {
    body.addEventListener(eventType, (event) => {
        // It's possible for the enter key to trigger unwanted button clicks. This line of code
        // ensures that only mouse clicks will trigger them.
        if (event.type === "click" && event.pointerType !== "mouse") return;

        // Both button clicks and key presses will be handled here.
        let input = event.type === "click" ? 
                    event.target.textContent : 
                    event.key;

        if ((input >= "0" && input <= "9") || input === ".") {
            let newCharacter = input;

            const isNewOperand = operands.length === 0 ||
                                 (operands.length === 1 && currentOperation !== undefined);

            if (isNewOperand) {
                // Starting a new operand while a result is being displayed will clear the result.
                if (result) {
                    displayText.textContent = "";
                    result = undefined;
                }

                if (newCharacter === ".") newCharacter = "0" + newCharacter;

                operands.push(newCharacter);
                displayText.textContent += newCharacter;
            } else {
                // Note: The current operand being worked on will always be at the end of the operands array.
                const isValidInput = ((newCharacter >= "0" && newCharacter <= "9") ||
                                     (newCharacter === "." && !operands.at(-1).includes("."))) &&
                                     operands.at(-1).length < 8;

                if (isValidInput) {
                    operands[operands.length - 1] += newCharacter;
                    displayText.textContent += newCharacter;
                }
            }

        } else if (input === "+" || 
                   input === "-" || 
                  (input === "x" || input === "*") || 
                   input === "/") {

            const isValidInput = operands.length !== 0 || result !== undefined;
            if (isValidInput) {
                if (operands.length === 2) {
                    result = getResult();
                    displayResult();
                } 

                // If a result is being displayed, then it will be moved to the operands array to be used
                // in the following expression (if it's not the divide by 0 error message).
                if (result) {
                    if (result === "CAN'T DIVIDE BY 0") return;

                    operands[0] = result;
                    result = undefined;
                }

                // If two consecutive operators are entered, the second will override the first.
                // Note: Operators contain a space before and after them, so three characters must be deleted.
                if (currentOperation) displayText.textContent = displayText.textContent.slice(0, -3);

                // The button ids for the operators are "addition", "subtraction", "multiplication",
                // and "division" respectively, which match up with the properties of the operations object.
                if (event.type === "click") currentOperation = operations[event.target.id];
                else {
                    // "*", and "x" both represent multiplication, but "x" is used to retrieve the
                    // operation from key presses.
                    if (input === "*") input = "x";

                    // Retrieve the operation object whose operator property matches the input key.
                    for (const operation in operations) {
                        const operator = operations[operation].operator;
                        if (input === operator) {
                            currentOperation = operations[operation];
                            break;
                        }
                    }
                }

                displayText.textContent += " " + currentOperation.operator + " ";
            }           
        
        } else if (input === "=" || input === "Enter") {
            if (operands.length === 2) { 
                result = getResult();
                displayResult();
            }
            
        } else if (input === "DEL" || input === "Backspace") {
            if (result) {
                // The divide by 0 error message should be fully cleared if it is being displayed.
                // Otherwise, the result should be treated as an operand and have its latest character removed.
                if (result === "CAN'T DIVIDE BY 0") displayText.textContent = "";
                else operands[0] = result;
                result = undefined;
            }

            const operatorIsBeingDeleted = operands.length === 1 && currentOperation !== undefined;
            if (operatorIsBeingDeleted) {
                // Note: Operators contain a space before and after them, so three characters must be deleted.
                displayText.textContent = displayText.textContent.slice(0, -3);
                currentOperation = undefined;
            } else if (operands.length !== 0) {
                displayText.textContent = displayText.textContent.slice(0, -1);
                operands[operands.length - 1] = operands.at(-1).slice(0, -1);
                if (operands.at(-1).length === 0) operands.pop();
            }
            
        } else if (input.toLowerCase() === "c") {
            clear();
            result = undefined;
        }
    });
});

function Operation(operator, operate) {
    this.operator = operator;
    this.operate = operate;
}

function clear() {
    operands.length = 0;
    currentOperation = undefined;
    displayText.textContent = "";
}

function getResult() {
    // It is possible that the first operand will be in exponential notation if it is taken from the
    // previous result. If the user deleted a part of this operand and it is not in proper exponential
    // notation form (e.g. "4.32e+"), then only the number portion of the operand will be used.
    if (isNaN(operands[0].slice(-1))) operands[0] = operands[0].split("e")[0];
    
    let result = currentOperation.operate(+operands[0], +operands[1]);

    if (result !== "CAN'T DIVIDE BY 0") {
        result = Math.round(result * 100) / 100;
        result = result.toString();
        if (result.length > 8) result = Number(result).toExponential(2);
    }

    return result;
}

function displayResult() {
    clear();
    displayText.textContent = result;
}