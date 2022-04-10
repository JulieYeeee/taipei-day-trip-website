
let APP_ID=123999;
let APP_KEY="app_xyfjgLvgneQFUa5boIt6pIBxdg6OgsenEvmxIK7Q3gKVFVBRjd8nyQ4Qtxqi";
TPDirect.setupSDK(APP_ID, APP_KEY, 'sandbox');
let fields={
    number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'ccv'
    }
};
////////////////////////
/////設定付款資訊欄//////
///////////////////////
TPDirect.card.setup({
    fields: fields,
    styles: {
    // Style all elements
    'input': {
        'color': 'gray'
    },
    // Styling ccv field
    'input.ccv': {
        'font-size': '1rem'
    },
    // Styling expiration-date field
    'input.expiration-date': {
        'font-size': '1rem'
    },
    // Styling card-number field
    'input.card-number': {
        'font-size': '1rem'
    },
    // style focus state
    ':focus': {
        'color': 'black'
    },
    // style valid state
    '.valid': {
        'color': 'green'
    },
    // style invalid state
    '.invalid': {
        'color': 'red'
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
        'input': {
            'color': 'orange'
        }
    }
}
});



//////////////////////////////
///////偵測表單狀態////////
/////////////////////////////
let submitButton=document.querySelector(".booking-button");
let bookingForm=document.querySelector("form");
let scanner=false;
let tappayStatus=false;
let blanks=0;

bookingForm.addEventListener("submit",e=>{
    e.preventDefault();
     //check all order info has been filled up or not//
     let contactInfo=document.querySelectorAll(".booking-contact input");
     //check contact info
     
     contactInfo.forEach(input=>{
         if(input.value==""){
             blanks++;
            //  input.classList.add("warning");
         }
     })
     console.log(blanks);
     if (blanks!=0){
        alert("聯絡資訊未填或缺漏");
        scanner=false;
        console.log("正常");
     }else{
         console.log("error??");
        scanner=true;
     }    
     //touch a trigger for listening blanks in form
     listenToBlanks(contactInfo);    
     //if form hads been fill up, get tappay prime
    if (tappayStatus==false){
        alert("信用卡資訊缺漏或有誤");
    }
    if(scanner && tappayStatus){
        getPrime();
    }

}) 

function listenToBlanks(contactInfo){
    contactInfo.forEach(input=>{
        input.addEventListener("change",()=>{
            blanks=0;
        })
    })
}

TPDirect.card.onUpdate(function (update) {   
    // update.canGetPrime === true
    if (update.canGetPrime) {
        tappayStatus=true;

    } else {
        tappayStatus=false;
    }    
});





// call TPDirect.card.getPrime when user submit form to get tappay prime

function getPrime(){
    // 取得 TapPay Fields 的 status
    let tappayStatus = TPDirect.card.getTappayFieldsStatus();
    forceBlurIos();
    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('付款失敗');
        return;
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        // if (result.status !== 0) {
        //     alert('get prime error ' + result.msg);
        //     return;
        // }
        // alert('get prime 成功，prime: ' + result.card.prime);
        console.log(result.msg);
        console.log(result.card.prime);
        let prime=result.card.prime;
         // send prime to server, to pay with Pay by Prime API
        startPay(prime);
       
    })
}


// let orderNumber="";
function startPay(prime){
    let contactName=document.querySelector("input[name='contact-name']");
    let contactEmail=document.querySelector("input[name='contact-email']");
    let contactPhone=document.querySelector("input[name='contact-number']");
    
    let data={
        "prime": prime,
        "order": {
          "price": price,
          "trip": {
            "attraction": bookingInfo["attraction"],
            "date": bookingInfo["date"],
            "time": bookingInfo["time"]
          },
          "contact": {
            "name": contactName.value,
            "email": contactEmail.value,
            "phone": contactPhone.value
          }
        }
      }
      console.log(data);
    fetch("/api/orders",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    })
    .then(response=>{
        let res=response.json();
        if(response.ok){
            res.then(data=>{
                let orderNumber=data["data"]["number"];
                window.location.replace("/thankyou?"+orderNumber);
                console.log(data);
            })
        }else if(response.status==400){
            res.then(data=>{
                window.location.replace("/thankyou?"+orderNumber);
                console.log(data);
            })
        }else{
            res.then(data=>{
                window.location.replace("/");
            })
            
        }
    })
    .catch(error=>{
        return error["message"];
    })
}


function forceBlurIos() {
    if (!isIos()) {
        return;
    }
    let creditInput = document.createElement('input');
    creditInput.setAttribute('type', 'text');
    // Insert to active element to ensure scroll lands somewhere relevant
    document.activeElement.prepend(creditInput);
    creditInput.focus();
    creditInput.parentNode.removeChild(creditInput);
}

function isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}


function setNumberFormGroupToError(selector) {
    $(selector).addClass('has-error')
    $(selector).removeClass('has-success')
}

function setNumberFormGroupToSuccess(selector) {
    $(selector).removeClass('has-error')
    $(selector).addClass('has-success')
}

function setNumberFormGroupToNormal(selector) {
    $(selector).removeClass('has-error')
    $(selector).removeClass('has-success')
}

///尚未解決iframe元素取得的方法

// let x=document.querySelector("iframe");
// let y=x.contentWindow;
// let z=y.document;
// let inputelm=z.querySelector("body form");
// // inputelm.classList.add("paywarning");
// console.log(x);
// console.log(y);
// console.log(z);
// console.log(inputelm);
let contactName=document.querySelector("input[name='contact-name']");
console.log(contactName);