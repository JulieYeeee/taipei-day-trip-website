////show touring guide fee////
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

////listen to load and fetch ////
window.addEventListener("load",()=>{
    checkMemberStatus();
    let passId=getId();
    console.log("get id:"+passId);
    fetchAttData(passId);
})

//// get id of attraction////
function getId(){
    let url=window.location.href;
    let id=url.substring(url.lastIndexOf("/")+1);
    return id;
}

////fetch data of attraction////
let openData={};
function fetchAttData(id){
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


////append data////////
////append images first////
function startAppendImages(){
    let coreData=openData["data"];
    let images=coreData["images"];
    let imgAmount=images.length;
/////specific appending for carousel function////
////the order for appending can not be changed////
    let slide1=document.createElement("div");
    slide1.classList.add("slide");
    let img1=document.createElement("img");
    img1.src=images[imgAmount-1];
    slidesBox.appendChild(slide1);
    slide1.appendChild(img1);

////appending ////
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
//////specific appending for carousel function////
////the order for appending can not be changed////
    let slide2=document.createElement("div");
    slide2.classList.add("slide");
    let img2=document.createElement("img");
    img2.src=images[0];
    slidesBox.appendChild(slide2);
    slide2.appendChild(img2);

    slidesBox.firstElementChild.id="lastClone";
    slidesBox.lastElementChild.id="firstClone";

    navButtonsBox.firstElementChild.classList.add("current-button");
    slides=Array.from(slidesBox.children);
    navButtons=Array.from(navButtonsBox.children);
    changNavButton();
    console.log("complete append");
}

////append text////
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

//////preparation//////
let moveWay=slidesBox.getBoundingClientRect().width;
console.log("moveWayOK");
let index=1;
slidesBox.style.transform="translateX(-"+moveWay*index+"px)";


///listen to next button///
let nextButton=document.querySelector(".next-button");
nextButton.addEventListener("click",()=>{
    if(index<slides.length-1){
    index++;
    slidesBox.style.transform="translateX(-"+moveWay*index+"px)";
    slidesBox.style.transition="ease 0.5s";
    controlNavButton();
    }
})


///listen to previous button///
let preButton=document.querySelector(".pre-button");
preButton.addEventListener("click",()=>{
    if(index<=0) return;
    index--;
    slidesBox.style.transform="translateX(-"+moveWay*index+"px)"; //point!
    slidesBox.style.transition="ease 0.5s";
    controlNavButton();
    })


//////listen to transtionend/////
slidesBox.addEventListener("transitionend",()=>{
    if(slides[index].id==="firstClone"){
        index=1;
        slidesBox.style.transform="translateX(-"+moveWay*index+"px)";
        slidesBox.style.transition="none";
        controlNavButton();
    }
    if(slides[index].id==="lastClone"){
        console.log("prebutton");
        index=slides.length-2;
        slidesBox.style.transform="translateX(-"+moveWay*index+"px)";
        slidesBox.style.transition="none";
        controlNavButton();
    }
})


////listen to nav button///
function changNavButton(){
    console.log("listen to change nav button");
    navButtons.forEach(button=>{
        button.addEventListener("click",()=>{
            let currentButton=document.querySelector(".current-button");
            let nextButtonIndex=navButtons.indexOf(button);
            currentButton.classList.remove("current-button");
            navButtons[nextButtonIndex].classList.add("current-button");
            slidesBox.style.transform="translateX(-"+moveWay*(nextButtonIndex+1)+"px)"; //point!
            slidesBox.style.transition="ease 0.5s";
            index=nextButtonIndex+1;
        })
    })
}

/////處理nav button同步變動//////
function controlNavButton(){
    let currentButton=document.querySelector(".current-button");
    let nextButton=navButtons[index-1];
    nextButton.classList.add("current-button");
    currentButton.classList.remove("current-button");
}

