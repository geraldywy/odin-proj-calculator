let screenCur = document.querySelector(".screen .cur")
let cur = "0"
screenCur.innerHTML = "0"
let hasDec = false

let screenPrev = document.querySelector(".screen .prev")
let prev = ""

const charLimit = 24

let btns = document.querySelectorAll(".btn")

let elements = []  // hold the nodes to evaluate later

const initElements = () => {
    elements = [
        {
            val: "",
            hasDec: false,
        },
    ]
}

const operators = new Set(["x", "/", "%", "(", ")", "+", "-"])

const validate = (elements) => {
    const set1 = new Set(["/", "%", "x", "("])
    const set2 = new Set(["/", "%", "x", "+", "-"])

    const badPairs = {
        "x": set1,
        "/": set1,
        "%": set1,
        ")": set2,
    }
    let openCnt = 0
    prev = ""
    for (let i in elements) {
        const s = elements[i].val
        if (s == "") {
            continue
        }

        if (s.length > 0 && s.charAt(s.length-1) == ".")  {  // digit ending with .
            return false
        }

        // validate brackets
        if (s == "(") {
            openCnt++
        } else if (s == ")") {
            if (openCnt == 0) {
                return false
            } else {
                openCnt--
            }
        }

        // some operators cannot be consecutive
        if (badPairs[s] != undefined && badPairs[s].has(prev)) {
            return false
        }

        prev = s
    }

    if (prev != ")" && operators.has(prev)) {
        return false
    }

    return openCnt == 0
}

const opMap = {
    // standalone ops
    "+": 0,
    "-": 1,
    "x": 2,
    "/": 3,
    "%": 4,

    // combined ops
    "x-": 5,
    "/-": 6,
    "%-": 7,
}

const doOp = (op, stack, e) => {
    switch (op) {
        case opMap["+"]:
            stack.push(e)
            break
        case opMap["-"]:
            stack.push(-e)
            break
        case opMap["x"]:
            stack[stack.length-1] *= e
            break
        case opMap["/"]:
            if (e == 0) {
                return "ERROR"
            }
            stack[stack.length-1] /= e
            break
        case opMap["%"]:
            stack[stack.length-1] %= e
            break
        case opMap["x-"]:
            stack[stack.length-1] *= -e
            break
        case opMap["/-"]:
            if (e == 0) {
                return "ERROR"
            }
            stack[stack.length-1] /= -e
            break
        case opMap["%-"]:
            stack[stack.length-1] %= -e
            break
        case -1:
            break
        default:
            console.log("unknown op: ", op)
            return "ERROR"
    }
}

/*
    Recursive function calling itself when it encounters a '(' character

    concat with some special logic to handle 
    1. '123(' => 123x, 
    2. ')123' => x123,
    3. '(+' => (
    4. '-' => 


    returns [idx to resume, ]
*/
const calc = (elements, i) => {
    let stack = [1]
    let lastOp = opMap["x"] // inferred multiplication  )123 => x123
    let err = undefined

    while (i < elements.length && elements[i].val != ")") {
        switch (elements[i].val) {
            case "(":
                const temp = calc(elements, i+1)
                i = temp[0]
                if (lastOp == -1) { // inferred multiplication  123( => 123x, 
                    lastOp = opMap["x"]
                }
                err = doOp(lastOp, stack, temp[1])
                if (err != undefined) {
                    return [elements.length, err]
                }
                lastOp = -1
                break
            case "-": case "+": case "x": case "/": case "%": // operators to note
                let curOp = opMap[elements[i].val]
                if (curOp == opMap["-"]) {
                    if (lastOp == opMap["x"] || lastOp == opMap["/"] || lastOp == opMap["%"]) {
                        curOp = lastOp + 3
                    } else if (lastOp == opMap["-"]) {  // -- = +, double negation
                        curOp = opMap["+"]
                    }
                } else if (curOp == opMap["+"]) {
                    if (lastOp != -1) {
                        curOp = lastOp
                    }
                }

                lastOp = curOp
                break
            default:   // any number
                err = doOp(lastOp, stack, parseInt(elements[i].val))
                if (err != undefined) {
                    return [elements.length, err]
                }
                lastOp = -1
        }

        i++
    }

    let res = 0
    while (stack.length > 0) {
        res += stack.pop()
    }

    return [i, res]
}

/*
    Evaluates a stringified mathematical expression. 
    Returns "ERROR" for illegal expressions.

    Methods requirement:
    1. +, -, *, /, %, (, )
    2. Nested expressions are supported
    3. Decimal values are allowed
*/
const evaluate = (elements) => {
    if (!validate(elements)) {
        return "ERROR"
    }

    return calc(elements, 0)[1]
}

btns.forEach((btn) => {
    btn.addEventListener('click', () => {
        let key = btn.getAttribute("data-key")
        if (prev == "") {
            prev = cur
            screenPrev.innerHTML = `Ans: ${prev}`
            cur = "0"
            initElements()
        }
        if (key == "=") {
            cur = evaluate(elements)
            prev = ""
        } else if (key == "clear") {
            if (elements[elements.length-1].val == "") {  
                if (elements.length == 1) {  // ignore
                    return
                }
                elements = elements.slice(0, elements.length-1)
            }
            const lastElem = elements[elements.length-1]
            if (lastElem.val[lastElem.val.length-1] == ".") {
                lastElem.hasDec = false
            }
            lastElem.val = lastElem.val.substring(0, lastElem.val.length-1)
            cur = cur.substring(0, cur.length-1)
            if (cur == "") {
                cur = "0"
            }
        } else {
            if (key == ".") {
                if (elements.length == 0 || elements[elements.length-1].hasDec == true) {
                    return
                }
                elements[elements.length-1].hasDec = true
            }
            
            if (key != "(" && key != ")" && key != "-" && key != "." && elements[elements.length-1].val == "") {
                if (elements.length == 1 && (key <= "0" || key > "9")) {
                    return
                }
                
                elements[elements.length-1].val = key
            } else {
                if (cur.length > charLimit) {
                    alert(`sorry, i only support an expr up till ${charLimit} chars, consider simplifying the expression.`)
                    return
                }
                
                if (key == "." || (key >= "0" && key <= "9")) {
                    elements[elements.length-1].val += key
                } else {  // one of the 7 special symbols
                    if (elements[elements.length-1].val == "") { // does not affect result, just helps to reduce unnecessary items in `elements` array
                        elements[elements.length-1].val = key
                    } else {
                        elements = elements.concat({val: key})
                    }
                }
            }

            if (cur == "0" && key != ".") {
                cur = ""
            }
            cur += key

            if (operators.has(elements[elements.length-1].val)) {
                elements = elements.concat({val: "", hasDec: false}) 
            }
        }

        screenCur.innerHTML = cur
    })
})

