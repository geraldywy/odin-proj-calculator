document.addEventListener("keydown", (evt) => {
    let key = evt.key
    if (key == "c" || key == "Backspace") {
        key = "clear"
    }
    if (key == "*") {
        key = "x"
    }
    if (key == "Enter") {
        key = "="
    }
    const btn = document.querySelector(`.btn[data-key="${key}"]`)
    if (btn == null) {
        return
    }
    btn.click()
})