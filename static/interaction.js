
let openData={};
let keyword="";
let page=0;
///fetch attractions///
function fetchData(keyword,page){
    let attractionsContainer=document.querySelector(".adaptLayer");
    console.log("are you kidding")
    fetch(`/api/attractions?keyword=${keyword}&page=${page}`)
    .then(response=>{
        let res=response.json();
        if (response.ok){
            res.then(data=>{
                openData=data;
                startAppend(openData,attractionsContainer);
            })
    
        }else{
            res.then(data=>{
                openData=data;
                errorMsg(openData,attractionsContainer);
            })
        }
        
    })
}



function startAppend(data,attractionsContainer){
    lengthOfData=data["data"].length;
    // console.log(lengthOfData);
    for (let start=0;start<lengthOfData;start++){
    let entireInfo=data["data"][start];
    //景點資料最外層容器
    let attraction=document.createElement("div");
    attraction.classList.add("attraction");
    //div for attraction image
    let image=document.createElement("div");
    image.classList.add("image");
    //img
    let img=document.createElement("img");
    url=entireInfo["images"][0];
    img.setAttribute("src",url);
    //attraction name
    let attName=document.createElement("h3");
    attName.classList.add("att-name");
    attName.innerText=entireInfo["name"];
    //div for detail info of attraction
    let attInfo=document.createElement("div")
    attInfo.classList.add("att-info");
    //mrt info
    let mrt=document.createElement("p");
    mrt.classList.add("mrt");
    mrt.innerText=entireInfo["mrt"];
    //category of attraction
    let cat=document.createElement("p");
    cat.classList.add("cat");
    cat.innerText=entireInfo["category"];
    // //start appending
    attractionsContainer.appendChild(attraction);
    attraction.appendChild(image);
    image.appendChild(img);
    attraction.appendChild(attName);
    attraction.appendChild(attInfo);
    attInfo.appendChild(mrt);
    attInfo.appendChild(cat);
    }
}
//處理查關鍵字錯誤訊息//
function errorMsg(openData,attractionsContainer){
    let info=openData["message"];
    console.log(info);
    let msg=document.createElement("h3");
    msg.classList.add("errorMsg");
    msg.innerText=info;
    attractionsContainer.appendChild(msg);
    attractionsContainer.style.height="100vw";
}

////listen to load////
window.addEventListener("load",()=>{
    fetchData(keyword,page);
})

////listen to scroll////
window.addEventListener("scroll",()=>{
    if(window.scrollY+window.innerHeight+1>=document.documentElement.scrollHeight){
        if (openData["nextpage"]!==null){
            page++;
            console.log(page);
            console.log(keyword);
            fetchData(keyword,page);
         
}
    // else if(openData["nextpage"]===null){
    //     window.removeEventListener("scroll",loadData,false);
    // }
}
})

////listen to button//// 
let button=document.querySelector(".search-container .search form button")
button.addEventListener("click",e=>{
    e.preventDefault();
    let attractionsContainer=document.querySelector(".adaptLayer");
    //clean up content while do new search
    if (attractionsContainer.childNodes.length!=0){
        attractionsContainer.innerHTML="";
        attractionsContainer.style.height="";
    }
    //get data from input and pass to the url to fetch
    let target=new FormData(document.querySelector(".search-container .search form"));
    keyword=target.get("keyword");
    page=0;
    fetchData(keyword,page);    
})