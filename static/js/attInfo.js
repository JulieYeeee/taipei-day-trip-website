//////////////////////////////
////show touring guide fee////
//////////////////////////////
let morningTime=document.querySelector("input[id='morning']");
morningTime.addEventListener("change",()=>{
    let fees=document.querySelector(".fees");
    fees.innerText="新台幣 2000 元整";
})

let afternoonTime=document.querySelector("input[id='afternoon']");
afternoonTime.addEventListener("change",()=>{
    let fees=document.querySelector(".fees");
    fees.innerText="新台幣 2500 元整";
})
//////////////////////////////////
////listen to load and fetch ////
/////////////////////////////////
window.addEventListener("load",()=>{
   let passId=getId();
   console.log("get id:"+passId);
   fetchData(passId);
})
//////////////////////////////
//// get id of attraction////
/////////////////////////////
function getId(){
    let url=window.location.href;
    let id=url.substring(url.lastIndexOf("/")+1);
    return id;
}
/////////////////////////////////
////fetch data of attraction////
////////////////////////////////
let openData={};
function fetchData(id){
    console.log("fetch in process");
    fetch(`/api/attraction/${id}`)
    .then(response=>{
        let res=response.json();
        if (response.ok){
            res.then(data=>{
                openData=data;
                startAppendImages();
                startAppendText();
                console.log("fetch process end");
            })
        }else{
            return "抱歉出錯了";
        }
    })
}


let imageCcontainer=document.querySelector(".image-container");
let trackContainer=document.querySelector(".track-container");
let slidesBox=document.querySelector(".slides-box");//圖片外層ul
let navButtonsBox=document.querySelector(".nav-buttons");
let navButtons=[];
let slides=[];

////////////////////////
////append data////////
//////////////////////
////append images////
function startAppendImages(){
    let coreData=openData["data"];
    let images=coreData["images"];
    let imgAmount=images.length;
    ///append images and build nav-button///
    images.forEach(image => {
        let slide=document.createElement("div");
        slide.classList.add("slide");
        let img=document.createElement("img");
        img.src=image;
        let navButton=document.createElement("button");
        navButton.classList.add("nav-button");
        slidesBox.appendChild(slide);
        slide.appendChild(img);
        navButtonsBox.appendChild(navButton);
    })
    slidesBox.firstElementChild.classList.add("current-slide");
    navButtonsBox.firstElementChild.classList.add("current-button");
    slides=Array.from(slidesBox.children);
    navButtons=Array.from(navButtonsBox.children);
    changNavButton();
    console.log("complete append");
}

////append test////
function startAppendText(){
let coreData=openData["data"];
let attName=document.querySelector(".att-name");
attName.innerText=coreData["name"];

let attInfo=document.querySelector(".att-info");
let cat=document.querySelector(".cat");
cat.innerText=coreData["category"];

let mrt=document.querySelector(".mrt");
mrt.innerText=coreData["mrt"];

let intro=document.querySelector(".intro");
intro.innerText=coreData["description"];

let address=document.querySelector(".address");
address.innerText=coreData["address"];

let transInfo=document.querySelector(".trans-info");
transInfo.innerText=coreData["transport"];

}
////////////////////////////
///listen to next button///
///////////////////////////
let nextButton=document.querySelector(".next-button");
nextButton.addEventListener("click",()=>{
    let currentSlide=document.querySelector(".current-slide");
    let currentIndex=slides.indexOf(currentSlide);
    let slidesLength=slides.length;
    let nextSlide="";

    if(currentIndex!==slidesLength-1){
        nextSlide=currentSlide.nextElementSibling;
        currentSlide.classList.remove("current-slide");
        nextSlide.classList.add("current-slide");
        currentIndex=slides.indexOf(nextSlide);
    }else{
        currentSlide.classList.remove("current-slide");
        slides[0].classList.add("current-slide");
        currentIndex=0;
    }
    let currentButton=document.querySelector(".current-button");
    let nextBtn=navButtons[currentIndex];
    currentButton.classList.remove("current-button");
    nextBtn.classList.add("current-button");
})
///////////////////////////////
///listen to previous button///
///////////////////////////////
let preButton=document.querySelector(".pre-button");
preButton.addEventListener("click",()=>{
    let currentSlide=document.querySelector(".current-slide");
    let currentIndex=slides.indexOf(currentSlide);
    let slidesLength=slides.length;

    if(currentIndex!==0){
        let preSlide=currentSlide.previousElementSibling;
        currentSlide.classList.remove("current-slide");
        preSlide.classList.add("current-slide");
        currentIndex=slides.indexOf(preSlide);
    }else{
        lastIndex=slidesLength-1;
        currentSlide.classList.remove("current-slide");
        slides[lastIndex].classList.add("current-slide");
        currentIndex=lastIndex;
    }
    let currentButton=document.querySelector(".current-button");
    let nextBtn=navButtons[currentIndex];
    currentButton.classList.remove("current-button");
    nextBtn.classList.add("current-button");
})

///////////////////////////
////listen to nav button///
//////////////////////////
function changNavButton(){
    console.log("listen to change nav button");
    navButtons.forEach(button=>{
        button.addEventListener("click",()=>{
            let currentButton=document.querySelector(".current-button");
            let nextButtonIndex=navButtons.indexOf(button);
            currentButton.classList.remove("current-button");
            navButtons[nextButtonIndex].classList.add("current-button");

            let currentSlide=document.querySelector(".current-slide");
            let nextSlide=slides[nextButtonIndex];
            currentSlide.classList.remove("current-slide");
            nextSlide.classList.add("current-slide");
            console.log("change nav button complete");
        })
    })
}

