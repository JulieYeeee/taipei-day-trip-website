let page="booking";
let price=0;

window.addEventListener("load",()=>{
    checkBooking();
    checkMemberStatus();
})

///if user access booking page directly,check signin status and respond////
function checkBooking(){
    fetch("/api/booking",{method:"GET"})
    .then(response=>{
        res=response.json();
        if(response.ok){ //200-299 member status = already signin
            res.then(data=>{
                showOrder(data);
            })
        }else{
            res.then(data=>{ //member status = already signout
                window.location.replace("/");
            })
        }
    })
}

////if member already sgin in,show the booking information////
function showOrder(data){
    ///if booking data exist,show them up///
    if(data["data"]!=null){
        //show order form
        let form=document.querySelector("form");
        form.classList.remove("form-hide");
        //show booking info
        let bookingAttInfo=document.querySelector(".booking-att-info");
        //build every single booking
        let att=buildItem("div","att");
        let bookingDelete=buildItem("div","booking-delete");
        bookingAttInfo.append(att);
        ///image of bookin info
        let imgDiv=buildItem("div","booking-img");
        let img=buildItem("img",null);
        imgDiv.append(img);
        ///textarea of booking info
        let attInfoDiv=buildItem("div","booking-att-text");
        let attName=buildItem("h2","att-name");
        let attItemsDiv=buildItem("div","att-items");
        attInfoDiv.append(attName,attItemsDiv);
        att.append(bookingDelete,imgDiv,attInfoDiv);
        ///date
        let attItem1=buildItem("div","item-box");
        let item1=buildItem("h2","item");
        item1.innerText="日期：";
        let itemContent1=buildItem("h2","item-content");
        attItem1.append(item1,itemContent1);
        ///time
        let attItem2=buildItem("div","item-box");
        let item2=buildItem("h2","item");
        item2.innerText="時間：";
        let itemContent2=buildItem("h2","item-content");
        attItem2.append(item2,itemContent2);
        ///price
        let attItem3=buildItem("div","item-box");
        let item3=buildItem("h2","item");
        item3.innerText="費用："
        let itemContent3=buildItem("h2","item-content");
        attItem3.append(item3,itemContent3);
        ///address
        let attItem4=buildItem("div","item-box");
        let item4=buildItem("h2","item");
        item4.innerText="地點："   
        let itemContent4=buildItem("h2","item-content");
        attItem4.append(item4,itemContent4);

        attItemsDiv.append(attItem1,attItem2,attItem3,attItem4);  
        //// touch relative function: show attraction info, listen to delete button, calculate fee////
        fillContent(data,img,attName,itemContent1,itemContent2,itemContent3,itemContent4);
        listenToDelete();
        sum();
    }else{ ///if booking data doesnt exist,show reminder message up///
        console.log("目前沒有任何待預定的行程")
        let responseDiv=document.querySelector(".response")
        let message=buildItem("h2","message");
        let body=document.querySelector("body");
        body.className="bodyheight";
        message.innerText="目前沒有任何待預定的行程";
        responseDiv.append(message);
    }

}
///function for create element and add classname///
function buildItem(obj,classname){
    let item=document.createElement(obj);
    item.className=classname;
    return item;
}
////function for show full information which user books//// 
function fillContent(data,img,attName,itemContent1,itemContent2,itemContent3,itemContent4){
    let date=new Date(data["data"]["date"]);
    let mydate=date.toLocaleDateString();
    mydate=mydate.replace("/","-");
    mydate=mydate.replace("/","-");
    img.src=data["data"]["attraction"]["image"];
    attName.innerText=data["data"]["attraction"]["name"];
    itemContent1.innerText=mydate;
    itemContent2.innerText=data["data"]["time"];
    itemContent3.innerText=data["data"]["price"];
    itemContent4.innerText=data["data"]["attraction"]["address"];
}
////function for calculate total fee////
function sum(){
    let fees=document.querySelectorAll(".item-content");
    fees.forEach(fee=>{
        if(fee.innerText=="新台幣 2000 元整"){
            price+=2000;
        }
        if(fee.innerText=="新台幣 2500 元整"){
            price+=2500;
        }
    })
    let totalFee=document.querySelector(".total-fee");
    totalFee.innerText=`總價： ${price} 新台幣`;
}


////function for listening to delete button.if clicked, delete booking order. if member doesnt sign in,redirect to index page.////
function listenToDelete(){
    let deleteBtn=document.querySelector(".booking-delete");
    deleteBtn.addEventListener("click",()=>{
        fetch("/api/booking",{method:"DELETE"})
        .then(response=>{
            res=response.json();
            if(response.ok){
                res.then(data=>{
                    cleanPage();
                    showOrder(data);
                })
            }else{
                res.then(data=>{ 
                    console.log(data);
                    window.location.replace("/");
                })
            }
        })
    })
}
///function for clean the booking page after clicking delete button//// 
function cleanPage(){
    let bookingAttInfo=document.querySelector(".booking-att-info");
    let form=document.querySelector("form");
    let body=document.querySelector("body");
    if(bookingAttInfo.innerHTML!=null){
        bookingAttInfo.innerHTML="";
        form.className="form-hide";
        body.className="bodyheight";
    }

}

