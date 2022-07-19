let APP_ID = 123999;
let APP_KEY =
  "app_xyfjgLvgneQFUa5boIt6pIBxdg6OgsenEvmxIK7Q3gKVFVBRjd8nyQ4Qtxqi";
TPDirect.setupSDK(APP_ID, APP_KEY, "sandbox");
let fields = {
  number: {
    // css selector
    element: "#card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    // DOM object
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: "#card-ccv",
    placeholder: "ccv",
  },
};
////////////////////////
/////設定付款資訊欄//////
///////////////////////
TPDirect.card.setup({
  fields: fields,
  styles: {
    // Style all elements
    input: {
      color: "gray",
    },
    // Styling ccv field
    "input.ccv": {
      "font-size": "1rem",
    },
    // Styling expiration-date field
    "input.expiration-date": {
      "font-size": "1rem",
    },
    // Styling card-number field
    "input.card-number": {
      "font-size": "1rem",
    },
    // style focus state
    ":focus": {
      color: "black",
    },
    // style valid state
    ".valid": {
      color: "green",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    "@media screen and (max-width: 400px)": {
      input: {
        color: "orange",
      },
    },
  },
});

//////////////////////////////
///////偵測表單狀態////////
/////////////////////////////
let submitButton = document.querySelector(".booking-button");
let bookingForm = document.querySelector("form");
let scanner = false;
let tappayStatus = false;
let blanks = 0;

TPDirect.card.onUpdate(function (update) {
  // update.canGetPrime === true
  if (update.canGetPrime) {
    tappayStatus = true;
  } else {
    tappayStatus = false;
  }
});

function listenToPayment(tpfields) {
  tpfields.forEach((input) => {
    input.addEventListener("change", () => {
      input.classList.remove("paywarning");
    });
  });
}

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //check all order info has been filled up or not//
  let contactInfo = document.querySelectorAll(".booking-contact input");
  //check contact info
  contactInfo.forEach((input) => {
    if (input.value == "") {
      blanks++;
    }
  });
  if (blanks != 0) {
    // alert("聯絡資訊未填或缺漏");
    alert("聯絡資訊未填或不完整，請檢視。");
    scanner = false;
    //touch a trigger for listening blanks in form
    listenToBlanks(contactInfo);
    return;
  } else {
    scanner = true;
  }
  //if form hads been fill up, get tappay prime
  if (tappayStatus == false) {
    alert("信用卡資訊不完整或有誤，請確認。");
    return;
  }
  //if all blanks has been filled up,go get prime
  if (scanner && tappayStatus) {
    getPrime();
  }
});

function listenToBlanks(contactInfo) {
  contactInfo.forEach((input) => {
    input.addEventListener("change", () => {
      blanks = 0;
    });
  });
}

function alert(msgText) {
  let alertElement = document.querySelector(".alert");
  if (!alertElement) {
    let popupAlert = document.createElement("div");
    popupAlert.className = "alert";
    let msg = document.createElement("p");
    msg.innerHTML = "（！）<br/>" + msgText;
    msg.className = "alert-msg";
    let btn = document.createElement("div");
    btn.innerText = "確認";
    btn.className = "alert-btn";
    let body = document.querySelector("body");
    body.append(popupAlert);
    popupAlert.append(msg, btn);
    listenToEnsure(btn, popupAlert);
  } else {
    let msg = document.querySelector(".alert-msg");
    msg.innerHTML = "（！）<br/>" + msgText;
    alertElement.classList.remove("alert-hide");
  }
}

function listenToEnsure(btn, popupAlert) {
  btn.addEventListener("click", () => {
    popupAlert.classList.add("alert-hide");
  });
}

// call TPDirect.card.getPrime when user submit form to get tappay prime
function getPrime() {
  // 取得 TapPay Fields 的 status
  let tappayStatus = TPDirect.card.getTappayFieldsStatus();
  forceBlurIos();
  // 確認是否可以 getPrime
  if (tappayStatus.canGetPrime === false) {
    alert("付款失敗");
    return;
  }

  // Get prime
  TPDirect.card.getPrime((result) => {
    let prime = result.card.prime;
    // send prime to server, to pay with Pay by Prime API
    startPay(prime);
  });
}

function startPay(prime) {
  let contactName = document.querySelector("input[name='contact-name']");
  let contactEmail = document.querySelector("input[name='contact-email']");
  let contactPhone = document.querySelector("input[name='contact-number']");

  let data = {
    prime: prime,
    order: {
      price: price,
      trip: {
        attraction: bookingInfo["attraction"],
        date: bookingInfo["date"],
        time: bookingInfo["time"],
      },
      contact: {
        name: contactName.value,
        email: contactEmail.value,
        phone: contactPhone.value,
      },
    },
  };
  fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      let res = response.json();
      if (response.ok) {
        res.then((data) => {
          let orderNumber = data["data"]["number"];
          window.location.replace("/thankyou?" + orderNumber);
        });
      } else if (response.status == 400) {
        res.then((data) => {
          window.location.replace("/thankyou?" + orderNumber);
        });
      } else {
        res.then((data) => {
          window.location.replace("/");
        });
      }
    })
    .catch((error) => {
      return error["message"];
    });
}

function forceBlurIos() {
  if (!isIos()) {
    return;
  }
  let creditInput = document.createElement("input");
  creditInput.setAttribute("type", "text");
  // Insert to active element to ensure scroll lands somewhere relevant
  document.activeElement.prepend(creditInput);
  creditInput.focus();
  creditInput.parentNode.removeChild(creditInput);
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
