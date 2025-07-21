const displayText = document.querySelector("#display-text");

const operands = [];
let operation;
let result;

const operations = {
    addition: new Operation("+", (operand1, operand2) => operand1 + operand2),
    subtraction: new Operation("-", (operand1, operand2) => operand1 - operand2),
    multiplication: new Operation("x", (operand1, operand2) => operand1 * operand2),
    division: new Operation("/", (operand1, operand2) => {
        if(operand2 === "0") return "CAN'T DIVIDE BY 0";
        else return operand1 / operand2;
    }),
};

const body = document.querySelector("body");
["click", "keydown"].forEach((eventType) => {
    body.addEventListener(eventType, (event) => {
        let input = event.type === "click" ? 
                        event.target.textContent : 
                        event.key;

        if((input >= "0" && input <= "9") || input === ".") {
            let newCharacter = input;

            const isNewOperand = operands.length === 0 ||
                                 (operands.length === 1 && operation !== undefined);

            if(isNewOperand) {
                if(result) {
                    displayText.textContent = "";
                    result = undefined;
                }

                if(newCharacter === ".") newCharacter = "0" + newCharacter;

                operands.push(newCharacter);
                displayText.textContent += newCharacter;
            } else {
                const isValidInput = (!isNaN(+newCharacter) ||
                                     (newCharacter === "." && !operands.at(-1).includes("."))) &&
                                     operands.at(-1).length < 8;

                if(isValidInput) {
                    operands[operands.length - 1] += newCharacter;
                    displayText.textContent += newCharacter;
                }
            }
        }
    });
});

function Operation(operator, operate) {
    this.operator = operator;
    this.operate = operate;
}

function clear() {
    operands.length = 0;
    operation = undefined;
    displayText.textContent = "";
}

function getResult() {
    if(isNaN(operands[0].slice(-1))) operands[0] = operands[0].split("e")[0];
    
    let result = operation.operate(+operands[0], +operands[1]);

    if(!typeof result === "string") {
        result = Math.round(result * 100) / 100;
        result = result.toString();
        if(result.length > 8) result = result.toExponential(2);
    }

    return result;
}