const saveButton =
    document.querySelector("#saveButton");

const saveFormat =
    document.querySelector("#saveFormat");

const container =
    document.querySelector(".container");

const refresh =
    document.querySelector(".refresh");

const eraser =
    document.querySelector(".eraser");

const colorPicker =
    document.querySelector(".color-picker");

const currentColorText =
    document.querySelector(".current-color");

const palette =
    document.querySelector(".palette");

const magicButton =
    document.querySelector(".magic-button");

const gridButtons =
    document.querySelectorAll(".grid-size");

const undoButton =
    document.querySelector("#undo");

const redoButton =
    document.querySelector("#redo");


/* =========================
   STATE
========================= */

let isDrawing = false;
let isEraser = false;

let currentColor = "#111111";
let currentGridSize = 32;

let undoStack = [];
let redoStack = [];

let strokeBeforeState = null;


/* =========================
   PALETTE LIBRARY
========================= */

const palettes = [

    ["#FF6B6B", "#F7B267", "#FFE29A", "#355070", "#2F3C7E"],

    ["#6C2BD9", "#00D9FF", "#FF3CAC", "#FFD93D", "#111111"],

    ["#173F35", "#386641", "#6A994E", "#F2E8CF", "#BC6C25"],

    ["#023E8A", "#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"],

    ["#590D22", "#800F2F", "#C9184A", "#FF4D6D", "#FFCCD5"],

    ["#3B3024", "#6B705C", "#A5A58D", "#CB997E", "#FFE8D6"],

    ["#10002B", "#240046", "#5A189A", "#9D4EDD", "#E0AAFF"],

    ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],

    ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#C6F91F"],

    ["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#FFF3B0"],

    ["#FF99C8", "#FCF6BD", "#D0F4DE", "#A9DEF9", "#E4C1F9"],

    ["#101010", "#343434", "#6B6B6B", "#B8B8B8", "#F2F2F2"],

    ["#240046", "#5A189A", "#FF5400", "#FFBD00", "#FFF3B0"],

    ["#D62828", "#F77F00", "#FCBF49", "#003049", "#EAE2B7"],

    ["#03071E", "#370617", "#6A040F", "#0A9396", "#94D2BD"],

    ["#283618", "#606C38", "#A3B18A", "#DAD7CD", "#BC6C25"],

    ["#09090B", "#FF0054", "#FF5400", "#39FF14", "#00E5FF"],

    ["#1B262C", "#3C6E71", "#D9D9D9", "#D9BF77", "#7F5539"]

];


/* =========================
   CANVAS STATE
========================= */

function getCanvasState() {

    const squares =
        document.querySelectorAll(".square");

    return Array.from(squares).map(
        square =>
            square.style.backgroundColor || "white"
    );
}


function applyCanvasState(state) {

    const squares =
        document.querySelectorAll(".square");

    squares.forEach(
        (square, index) => {

            square.style.backgroundColor =
                state[index] || "white";

        }
    );
}


/* =========================
   PAINT
========================= */

function paintSquare(square) {

    if (!square) {
        return;
    }

    square.style.backgroundColor =
        isEraser
            ? "white"
            : currentColor;
}


/* =========================
   CREATE GRID
========================= */

function createGrid(size = 32) {

    currentGridSize = size;

    container.innerHTML = "";

    undoStack = [];
    redoStack = [];
    strokeBeforeState = null;

    container.style.gridTemplateColumns =
        `repeat(${size}, 1fr)`;

    container.style.gridTemplateRows =
        `repeat(${size}, 1fr)`;


    const total =
        size * size;


    for (
        let i = 0;
        i < total;
        i++
    ) {

        const square =
            document.createElement("div");

        square.classList.add("square");

        container.appendChild(square);

    }
}


/* =========================
   FIND SQUARE
========================= */

function getSquareAtPoint(x, y) {

    const element =
        document.elementFromPoint(x, y);

    if (!element) {
        return null;
    }

    const square =
        element.closest(".square");

    if (!square) {
        return null;
    }

    if (!container.contains(square)) {
        return null;
    }

    return square;
}


/* =========================
   START DRAWING
========================= */

container.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        isDrawing = true;

        strokeBeforeState =
            getCanvasState();


        const square =
            getSquareAtPoint(
                event.clientX,
                event.clientY
            );

        paintSquare(square);


        try {
            container.setPointerCapture(
                event.pointerId
            );
        } catch (error) {
            console.log(
                "Pointer capture unavailable."
            );
        }

    }
);


/* =========================
   DRAW WHILE DRAGGING
========================= */

container.addEventListener(
    "pointermove",
    event => {

        if (!isDrawing) {
            return;
        }

        event.preventDefault();


        const square =
            getSquareAtPoint(
                event.clientX,
                event.clientY
            );


        paintSquare(square);

    }
);


/* =========================
   FINISH STROKE
========================= */

function finishStroke(event) {

    if (!isDrawing) {
        return;
    }


    const afterState =
        getCanvasState();


    if (strokeBeforeState) {

        const changed =
            JSON.stringify(
                strokeBeforeState
            ) !==
            JSON.stringify(
                afterState
            );


        if (changed) {

            undoStack.push(
                strokeBeforeState
            );

            redoStack = [];

        }

    }


    isDrawing = false;

    strokeBeforeState = null;


    try {

        if (
            event &&
            container.hasPointerCapture(
                event.pointerId
            )
        ) {

            container.releasePointerCapture(
                event.pointerId
            );

        }

    } catch (error) {

        console.log(
            "Pointer release unavailable."
        );

    }

}


container.addEventListener(
    "pointerup",
    finishStroke
);


container.addEventListener(
    "pointercancel",
    finishStroke
);


/* =========================
   MOBILE SCROLL PROTECTION
========================= */

document.addEventListener(
    "touchmove",
    event => {

        if (isDrawing) {

            event.preventDefault();

        }

    },
    {
        passive: false
    }
);


/* =========================
   CLEAR
========================= */

refresh.addEventListener(
    "click",
    () => {

        const before =
            getCanvasState();


        const squares =
            document.querySelectorAll(
                ".square"
            );


        const alreadyClear =
            Array.from(squares).every(
                square =>
                    !square.style.backgroundColor ||
                    square.style.backgroundColor ===
                    "white"
            );


        if (!alreadyClear) {

            undoStack.push(before);

            redoStack = [];

        }


        squares.forEach(
            square => {

                square.style.backgroundColor =
                    "white";

            }
        );

    }
);


/* =========================
   GRID SIZE
========================= */

gridButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const size =
                    Number(
                        button.dataset.size
                    );


                gridButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                createGrid(size);

            }
        );

    }
);


/* =========================
   ERASER
========================= */

eraser.addEventListener(
    "click",
    () => {

        isEraser =
            !isEraser;


        eraser.classList.toggle(
            "active",
            isEraser
        );


        container.classList.toggle(
            "eraser-mode",
            isEraser
        );

    }
);


/* =========================
   COLOR PICKER
========================= */

colorPicker.addEventListener(
    "input",
    () => {

        currentColor =
            colorPicker.value.toUpperCase();


        currentColorText.textContent =
            currentColor;


        isEraser = false;

        eraser.classList.remove(
            "active"
        );

        container.classList.remove(
            "eraser-mode"
        );


        updatePaletteActiveState();

    }
);


/* =========================
   SET COLOR
========================= */

function setColor(color) {

    currentColor =
        color.toUpperCase();


    colorPicker.value =
        currentColor;


    currentColorText.textContent =
        currentColor;


    isEraser = false;

    eraser.classList.remove(
        "active"
    );

    container.classList.remove(
        "eraser-mode"
    );


    updatePaletteActiveState();

}


/* =========================
   DISPLAY PALETTE
========================= */

function displayPalette(colors) {

    palette.innerHTML = "";


    colors.forEach(
        color => {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "palette-color";

            button.dataset.color =
                color;

            button.style.backgroundColor =
                color;

            button.title =
                color;


            button.addEventListener(
                "click",
                () => {

                    setColor(color);

                }
            );


            palette.appendChild(
                button
            );

        }
    );


    updatePaletteActiveState();

}


/* =========================
   ACTIVE COLOR
========================= */

function updatePaletteActiveState() {

    const buttons =
        document.querySelectorAll(
            ".palette-color"
        );


    buttons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.color
                    .toUpperCase() ===
                currentColor
            );

        }
    );

}


/* =========================
   MAGIC PALETTE
========================= */

magicButton.addEventListener(
    "click",
    () => {

        const randomIndex =
            Math.floor(
                Math.random() *
                palettes.length
            );


        displayPalette(
            palettes[randomIndex]
        );

    }
);


/* =========================
   UNDO
========================= */

undoButton.addEventListener(
    "click",
    () => {

        if (undoStack.length === 0) {
            return;
        }


        const currentState =
            getCanvasState();

        const previousState =
            undoStack.pop();


        redoStack.push(
            currentState
        );


        applyCanvasState(
            previousState
        );

    }
);


/* =========================
   REDO
========================= */

redoButton.addEventListener(
    "click",
    () => {

        if (redoStack.length === 0) {
            return;
        }


        const currentState =
            getCanvasState();

        const nextState =
            redoStack.pop();


        undoStack.push(
            currentState
        );


        applyCanvasState(
            nextState
        );

    }
);

/* =========================
   CREATE EXPORT CANVAS
========================= */

function createExportCanvas() {

    const squares =
        document.querySelectorAll(".square");

    const size =
        currentGridSize;

    const exportSize = 1200;

    const squareSize =
        exportSize / size;


    const canvas =
        document.createElement("canvas");

    canvas.width =
        exportSize;

    canvas.height =
        exportSize;


    const ctx =
        canvas.getContext("2d");


    /* White background */

    ctx.fillStyle =
        "white";

    ctx.fillRect(
        0,
        0,
        exportSize,
        exportSize
    );


    squares.forEach(
        (square, index) => {

            const color =
                square.style.backgroundColor;


            if (
                !color ||
                color === "white" ||
                color === "rgb(255, 255, 255)"
            ) {
                return;
            }


            const row =
                Math.floor(
                    index / size
                );

            const column =
                index % size;


            ctx.fillStyle =
                color;


            ctx.fillRect(
                column * squareSize,
                row * squareSize,
                squareSize,
                squareSize
            );

        }
    );


    return canvas;
}


/* =========================
   DOWNLOAD FILE
========================= */

function downloadFile(
    dataUrl,
    extension
) {

    const link =
        document.createElement("a");


    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );


    link.download =
        `etch-a-sketch-${timestamp}.${extension}`;


    link.href =
        dataUrl;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );

}


/* =========================
   SAVE PNG
========================= */

function savePNG(canvas) {

    const dataUrl =
        canvas.toDataURL(
            "image/png"
        );


    downloadFile(
        dataUrl,
        "png"
    );

}


/* =========================
   SAVE JPG
========================= */

function saveJPG(canvas) {

    const dataUrl =
        canvas.toDataURL(
            "image/jpeg",
            0.95
        );


    downloadFile(
        dataUrl,
        "jpg"
    );

}


/* =========================
   SAVE WEBP
========================= */

function saveWEBP(canvas) {

    const dataUrl =
        canvas.toDataURL(
            "image/webp",
            0.95
        );


    downloadFile(
        dataUrl,
        "webp"
    );

}


/* =========================
   SAVE PDF
========================= */

function savePDF(canvas) {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "PDF export is unavailable right now."
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });


    const imageData =
        canvas.toDataURL(
            "image/png"
        );


    const pageWidth =
        pdf.internal.pageSize.getWidth();

    const pageHeight =
        pdf.internal.pageSize.getHeight();


    const margin = 15;


    const imageSize =
        Math.min(
            pageWidth - margin * 2,
            pageHeight - margin * 2
        );


    const x =
        (pageWidth - imageSize) / 2;

    const y =
        (pageHeight - imageSize) / 2;


    pdf.addImage(
        imageData,
        "PNG",
        x,
        y,
        imageSize,
        imageSize
    );


    pdf.save(
        "etch-a-sketch.pdf"
    );

}


/* =========================
   SAVE BUTTON
========================= */

saveButton.addEventListener(
    "click",
    () => {

        const canvas =
            createExportCanvas();


        const format =
            saveFormat.value;


        switch (format) {

            case "png":
                savePNG(canvas);
                break;

            case "jpg":
                saveJPG(canvas);
                break;

            case "webp":
                saveWEBP(canvas);
                break;

            case "pdf":
                savePDF(canvas);
                break;

        }

    }
);
/* =========================
   INITIAL LOAD
========================= */

createGrid(32);

displayPalette(
    palettes[0]
);