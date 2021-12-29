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

    return openCnt == 0
}

/*
    Evaluates a stringified mathematical expression. 
    Returns "ERROR" for illegal expressions.
    Methods requirement:
    1. +, -, *, /, %, (, )
    2. Nested expressions are supported
    3. Decimal values are allowed
*/
const calc = (elements) => {
    if (!validate(elements)) {
        return "ERROR"
    }
    
    console.log(elements)
    return "VALID"
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
            cur = calc(elements)
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
        console.log(elements)
    })
})

