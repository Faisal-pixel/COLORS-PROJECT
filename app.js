//Global Selections and Variables
const colorDivs = document.querySelectorAll(".color")
const generateBtn = document.querySelector(".generate")
const sliders = document.querySelectorAll(`input[type="range"]`)
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container")
let initialColors;

//Event Listeners

sliders.forEach(slider => {
    slider.addEventListener("input", hslControls)
})

colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {updateTextUI(index)})
})

popup.addEventListener("transitionend", () => {
    popup.classList.remove("active")
    popup.children[0].classList.remove("active")
})

currentHexes.forEach(hex => {
    hex.addEventListener("click", () => {
        copyToClipBoard(hex);
    })
})


//Functions
function generateHex() {
    const hexColor = chroma.random()
    return hexColor
}




function randomColors() {
    initialColors = []
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        div.style.backgroundColor = randomColor
        hexText.innerText = randomColor;

        initialColors.push(chroma(randomColor).hex())

        //Check for contrast
        checkTextContrast(randomColor, hexText)

        //Initial Colorize SLiders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input")
        const hue = sliders[0]
        const brightness = sliders[1]
        const saturation = sliders[2]

        colorizeSliders(color, hue, brightness, saturation)
    })

    resetInputs()
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance()
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white"
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    const noSat = color.set("hsl.s", 0);
    const fullSat = color.set("hsl.s", 1)
    const scaleSat = chroma.scale([noSat, color, fullSat])

    //Scale Brightness
    const midBrightness = color.set("hsl.l", 0.5);
    const scaleBrightness = chroma.scale(["black", midBrightness, "white"])

    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(0)}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
}

function hslControls(e) {
    const index = e.target.getAttribute("data-hue") || e.target.getAttribute("data-sat") ||e.target.getAttribute("data-bright")
    let sliders = e.target.parentElement.querySelectorAll(`input[type="range"]`)
    let hue = sliders[0]
    let sat = sliders[2]
    let bright = sliders[1]

    let bgColor = initialColors[index];

    let color = chroma(bgColor).set("hsl.h", hue.value).set("hsl.s", sat.value).set("hsl.l", bright.value)

    colorDivs[index].style.backgroundColor = color

    colorizeSliders(color, hue, bright, sat)
}

function updateTextUI(index) {
    const activeDiv = colorDivs[index]
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button")
    textHex.innerText = color.hex();

    //Check Contrast
    checkTextContrast(color, textHex)
    icons.forEach(icon => {
        checkTextContrast(color, icon)
    })
}

function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")]
            const hueValue = chroma(hueColor).hsl()[0]
            slider.value = Math.floor(hueValue)
        }

        if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")]
            const brightValue = chroma(brightColor).hsl()[2]
            slider.value = Math.floor(brightValue * 100)/100
        }

        if (slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")]
            const satValue = chroma(satColor).hsl()[1]
            slider.value = Math.floor(satValue * 100)/100
        }
    })
}

function copyToClipBoard(hex) {
    const el = document.createElement("textarea")
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select()
    document.execCommand("copy");
    document.body.removeChild(el);

    //Pop up animation
    const popupBox = popup.children[0]
    popup.classList.add("active")
    popupBox.classList.add("active")
}

randomColors()