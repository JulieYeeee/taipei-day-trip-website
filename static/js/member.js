let page="member";
window.addEventListener("load",()=>{
    checkMemberStatus();
})

//if user's status is login, function below will be touched
function showMemberInfo(username,email){
    let userName=document.querySelector(".username");
    userName.innerText="使用者名稱："+username;
    let photoP=document.querySelector(".photo-p");
    photoP.innerText=username[0];
    let userEmail=document.querySelector(".email");
    userEmail.innerText="註冊信箱："+email;
    let psw=document.querySelector(".psw-label");
    let pswItem=document.querySelector(".psw-item");
    pswItem.innerText="當前密碼：";
    let pswInput=document.querySelector("#psw");
    pswInput.value="●●●●●●●●";
    let changeBtn=document.querySelector(".change-psw");
    changeBtn.innerText="修改密碼";
    let cancelBtn=document.querySelector(".cancel-psw");
    cancelBtn.innerText="取消";
    listenToPsw(changeBtn,cancelBtn,pswInput);
}

function listenToPsw(changeBtn,cancelBtn,pswInput){
    changeBtn.addEventListener("click",()=>{
        //當按鈕顯示"修改密碼"功能，點擊後改為"儲存修改"並新增"取消修改"按鈕
        if(changeBtn.innerText=="修改密碼"){
            pswInput.disabled="";
            pswInput.value="";
            changeBtn.innerText="儲存";
            cancelBtn.classList.remove("cancel-hide");
            listenToCancel(changeBtn,cancelBtn,pswInput);
        }else{ //當按鈕顯示"儲存修改",點擊後發送修改資料至後端，前端修改顯示
            changeBtn.innerText="修改密碼";
            pswInput.disabled="disabled";
            
            cancelBtn.classList.add("cancel-hide");
            let data={
                "email":email,
                "password":pswInput.value
            }
            fetch("/api/memberinfo",{
                method:"PATCH",
                headers:{
                    "content-type":"application/json"
                },
                body:JSON.stringify(data)
            })
            .then(response=>{
                let res=response.json();
                if(response.ok){
                    res.then(data=>{
                        showChangeResult(data);
                    })
                }else{
                    res.then(data=>{
                        showChangeResult(data);
                    })
                }
            })
            .catch(error=>{
                showChangeResult(error);
            })
        }
        
    })
}
function listenToCancel(changeBtn,cancelBtn,pswInput){
    cancelBtn.addEventListener("click",()=>{
        changeBtn.innerText="修改密碼";
        pswInput.disabled="disabled";
        pswInput.value="●●●●●●●●";
        cancelBtn.classList.add("cancel-hide");
    })
}

function showChangeResult(data){
    let checkmsg=document.querySelector(".change-msg");
    //check message box exists or not. 
    if (!checkmsg){
        let body=document.querySelector("body");
        let msg=document.createElement("div");
        msg.className="change-msg";
        let text=document.createElement("p");
        text.className="msg-text";
        let btn=document.createElement("div");
        btn.className="OK-btn";
        btn.innerText="確認";
        msg.append(text,btn);
        body.append(msg);      
    }else{
        checkmsg.classList.remove("change-hide");
    }
    //if response is OK, show success message
    //if response is error, show failure message
    let text=document.querySelector(".msg-text");
    if(data["ok"]){     
        text.innerHTML="（！）<br/>修改成功，下次請以新密碼登入。";
    }else{
        text.innerHTML="（！）<br/>修改失敗，網路出錯請稍後再試。";
    }
    let pswInput=document.querySelector(".psw-input");
    pswInput.disabled="disabled";
    pswInput.value="●●●●●●●●";
    listenToOK();  
}


function listenToOK(){
    let btn=document.querySelector(".OK-btn");
    let msg=document.querySelector(".change-msg");
    btn.addEventListener("click",()=>{
        msg.classList.add("change-hide");
    })
}

//if user's status is login, function below will be touched
//get user's orders 
function getOrders(){
    fetch("/api/memberinfo",{method:"GET"})
    .then(response=>{
        let res=response.json();
        if(response.ok){
            res.then(data=>{
                showOrders(data);
            })
        }else{
            res.then(data=>{
                window.location.replace("/");
        })
    }

})
}

function showOrders(data){
    let orderlist=document.querySelector(".orderlist");
    console.log(data["data"]);
    data["data"].forEach(singleOrder => {
        let order=document.createElement("div");
        let orderNum=document.createElement("p");
        orderNum.innerText=singleOrder["number"];
        let attName=document.createElement("p");
        attName.innerText=singleOrder["attraction"];
        let bookingDate=document.createElement("p");
        bookingDate.innerText=singleOrder["date"];
        let payment=document.createElement("p");
        if (singleOrder["status"]==1){
            payment.innerText="付款完成";
        }else{
            payment.innerText="尚未付款";
        }
        order.append(orderNum,attName,bookingDate,payment);
        orderlist.append(order);
        let loader=document.querySelector(".loader-cover");
        loader.classList.add("loader-hide");
    });
    

}