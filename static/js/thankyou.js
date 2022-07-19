window.addEventListener("load", () => {
  //check member has logged in or not
  checkMemberStatus();
  //check order existing or not which belongs to user
  checkOrderStatus();
});

function checkOrderStatus() {
  //get order number from url
  let url = window.location.href;
  let orderNumber = url.substring(url.lastIndexOf("?") + 1);
  //connect backend server to to check order status
  fetch(`/api/order/${orderNumber}`)
    .then((response) => {
      let res = response.json();
      if (response.ok) {
        res.then((data) => {
          if (data["data"] != null) {
            showOrder(data);
          } else {
            showOrderNull();
          }
          let loaderCover = document.querySelector(".loader-cover");
          loaderCover.classList.add("loader-hide");
        });
      } else {
        res.then((data) => {
          window.location.replace("/");
        });
      }
    })
    .catch((error) => {
      showError(error);
      let loaderCover = document.querySelector(".loader-cover");
      loaderCover.classList.add("loader-hide");
    });
}

function showOrder(data) {
  let title = document.querySelector(".thankU-title");
  if (data["data"]["status"] == 1) {
    title.innerText = " 付款成功，您的預定旅程如下：";
    let orderInfo = document.querySelector(".order-info");
    let image = createElement("div", "image");
    let img = createElement("img", null);
    img.src = data["data"]["trip"]["attraction"]["image"];
    let info = createElement("div", "info");
    let orderNum = createElement("p", "order-number");
    let number = data["data"]["number"];
    orderNum.innerText = `訂單編號：${number}`;
    let attName = createElement("p", "att-name");
    let name = data["data"]["trip"]["attraction"]["name"];
    attName.innerText = `預定景點：${name}`;
    let attAddress = createElement("p", "att-address");
    let address = data["data"]["trip"]["attraction"]["address"];
    attAddress.innerText = `景點地址：${address}`;
    let bookingDate = createElement("p", "booking-date");
    let date = data["data"]["trip"]["date"];
    bookingDate.innerText = `預定日期：${date}`;
    let bookingTime = createElement("p", "booking-time");
    let time = data["data"]["trip"]["time"];
    bookingTime.innerText = `預定時間：${time}`;
    orderInfo.append(image, info);
    image.append(img);
    info.append(orderNum, attName, attAddress, bookingDate, bookingTime);
  } else {
    title.innerText = "付款失敗，請回預定行程重新付款。";
  }
}

function createElement(element, classname) {
  let obj = document.createElement(element);
  obj.className = classname;
  return obj;
}

function showOrderNull() {
  let message = document.querySelector(".message");
  message.innerText = "您目前沒有任何訂單";
}

function showError(data) {
  let message1 = document.querySelector(".m1");
  message1.innerText = data["message"];
}
