window.addEventListener("load",()=>{
    //check member has logged in or not
    checkMemberStatus();
    //check order existing or not which belongs to user
    checkOrderStatus();
})

function checkOrderStatus(){
    //get order number from url
    let url=window.location.href;
    let orderNumber=url.substring(url.lastIndexOf("?")+1)
    //connect backend server to to check order status
    fetch(`/api/order/${orderNumber}`)
    .then(response=>{
        let res=response.json();
        if(response.ok){
            res.then(data=>{
                if(data["data"]!=null){
                    showOrder(data);
                }else{
                    showOrderNull();
                }
            })
        }else{
            res.then(data=>{
                window.location.replace("/");
            })
        }
    })
    .catch(error=>{
        showError(error);
    })
}

function showOrder(data){
    let message1=document.querySelector(".m1");
    let message2=document.querySelector(".m2");
    let orderNumber=document.querySelector(".order-number");
    let note=document.querySelector(".note");
    if(data["data"]["status"]==1){
        message1.innerText="行程預定成功";
        message2.innerText="您的訂單編號如下";
        orderNumber.innerText=data["data"]["number"];
        note.innerText="請記下訂單編號以便預定當日核對";
    }else{
        message1.innerText="行程預定未付款成功</br>您的訂單編號如下";
        orderNumber.innerText=orderNumber;
        note.innerText="請回到預定頁面重新付款";
    }
}

function showOrderNull(){
    let message=document.querySelector(".message");
    message.innerText="您目前沒有任何訂單";

}

function showError(data){
    let message1=document.querySelector(".m1");
    message1.innerText=data["message"];
}