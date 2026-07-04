const container = document.querySelector(".container");

let isdrawing = false;
document.addEventListener("mousedown",()=>{
    isdrawing = true;
});
document.addEventListener("mouseup", ()=>{
    isdrawing = false;
})
// container.style.width = "512px";

const refresh = document.querySelector(".refresh");

const reset = document.querySelector(".reset");


// const size = prompt("What is the frame size: ");
function creategrid(size = 32){
    container.innerHTML="";
    const maximum = size * size;
    const conatinerwidth = container.clientWidth;
    const gridsize = size;
    const squaresize = conatinerwidth / gridsize;

for(let i=0;i<maximum;i++){
    const div = document.createElement("div");

    div.style.width = squaresize + "px";
    div.style.height = squaresize + "px";
    div.style.border = "1px solid black"
    div.addEventListener("mousedown", ()=>{
        div.style.backgroundColor = "black";
    })

    div.addEventListener("mouseenter", ()=>{
        if(isdrawing){
            div.style.backgroundColor = "black";
        }
    });
    div.classList.add("square");
    container.appendChild(div);
    refresh.addEventListener("click",()=>{
        div.style.backgroundColor = "";
    })
    }

}

creategrid();
reset.addEventListener("click", ()=>{
    
    const size = prompt("What is the frame size: ");
    creategrid(size);
});

