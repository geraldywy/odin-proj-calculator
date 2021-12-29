let screenCur = document.querySelector(".screen .cur")
let cur = "0"
screenCur.innerHTML = "0"
let hasDec = false

let screenPrev = document.querySelector(".screen .prev")
let prev = ""

const charLimit = 20

let btns = document.querySelectorAll(".btn")

const calc = () => {
    return "123.123"
}

btns.forEach((btn) => {
    btn.addEventListener('click', () => {
        let key = btn.getAttribute("data-key")
        if (prev == "") {
            prev = cur
            screenPrev.innerHTML = `Ans: ${prev}`
            cur = "0"
        }
        if (key == "=") {
            const res = calc(cur)
            screenCur.innerHTML = res
            cur = res
            prev = ""
        } else {
            if (key == ".") {
                if (hasDec) {
                    return
                }
                hasDec = true
            }

            if (cur == "0") {
                cur = key
            } else {
                if (cur.length > charLimit) {
                    alert(`sorry, i only support an expr up till ${charLimit} chars, consider simplifying the expression.`)
                    return
                }
                cur += key
            }

            screenCur.innerHTML = cur
        }
    })
})

