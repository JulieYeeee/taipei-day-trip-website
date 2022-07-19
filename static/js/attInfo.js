////show touring guide fee////
let morningTime = document.querySelector("input[id='morning']");
morningTime.addEventListener("change", () => {
  let fees = document.querySelector(".fees");
  fees.innerText = "新台幣 2000 元整";
  fees.value = "2000";
});

let afternoonTime = document.querySelector("input[id='afternoon']");
afternoonTime.addEventListener("change", () => {
  let fees = document.querySelector(".fees");
  fees.innerText = "新台幣 2500 元整";
  fees.value = "2500";
});

////listen to load and fetch ////
window.addEventListener("load", () => {
  checkMemberStatus();
  let passId = getId();
  fetchAttData(passId);
  setDateLimit();
});

function setDateLimit() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
  let yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  today = yyyy + "-" + mm + "-" + dd;
  document.querySelector(".date input").setAttribute("min", today);
}
//// get id of attraction////
function getId() {
  let url = window.location.href;
  let id = url.substring(url.lastIndexOf("/") + 1);
  return id;
}

////fetch data of attraction////
let openData = {};
function fetchAttData(id) {
  let loaderCover = document.querySelector(".loader-cover");
  loaderCover.classList.add("loader-hide");
  fetch(`/api/attraction/${id}`).then((response) => {
    let res = response.json();
    if (response.ok) {
      res.then((data) => {
        openData = data;
        startAppendImages();
        startAppendText();
      });
    } else {
      return "抱歉出錯了";
    }
  });
}

let imageCcontainer = document.querySelector(".image-container");
let trackContainer = document.querySelector(".track-container");
let slidesBox = document.querySelector(".slides-box"); //圖片外層ul
let navButtonsBox = document.querySelector(".nav-buttons");
let navButtons = [];
let slides = [];
////append data////////
////append images first////
function startAppendImages() {
  let coreData = openData["data"];
  let images = coreData["images"];
  let imgAmount = images.length;
  /////specific appending for carousel function////
  ////the order for appending can not be changed////
  let slide1 = document.createElement("div");
  slide1.classList.add("slide");
  let img1 = document.createElement("img");
  img1.src = images[imgAmount - 1];
  slidesBox.appendChild(slide1);
  slide1.appendChild(img1);

  ////appending ////
  images.forEach((image) => {
    let slide = document.createElement("div");
    slide.classList.add("slide");
    let img = document.createElement("img");
    img.src = image;
    let navButton = document.createElement("button");
    navButton.classList.add("nav-button");
    slidesBox.appendChild(slide);
    slide.appendChild(img);
    navButtonsBox.appendChild(navButton);
  });
  //////specific appending for carousel function////
  ////the order for appending can not be changed////
  let slide2 = document.createElement("div");
  slide2.classList.add("slide");
  let img2 = document.createElement("img");
  img2.src = images[0];
  slidesBox.appendChild(slide2);
  slide2.appendChild(img2);

  slidesBox.firstElementChild.id = "lastClone";
  slidesBox.lastElementChild.id = "firstClone";

  navButtonsBox.firstElementChild.classList.add("current-button");
  slides = Array.from(slidesBox.children);
  navButtons = Array.from(navButtonsBox.children);
  changNavButton();
}

////append text////
function startAppendText() {
  let coreData = openData["data"];
  let attName = document.querySelector(".att-name");
  attName.innerText = coreData["name"];

  let attInfo = document.querySelector(".att-info");
  let cat = document.querySelector(".cat");
  cat.innerText = coreData["category"];

  let mrt = document.querySelector(".mrt");
  mrt.innerText = coreData["mrt"];

  let intro = document.querySelector(".intro");
  intro.innerText = coreData["description"];

  let address = document.querySelector(".address");
  address.innerText = coreData["address"];

  let transInfo = document.querySelector(".trans-info");
  transInfo.innerText = coreData["transport"];
}

//////preparation//////
let moveWay = slidesBox.getBoundingClientRect().width;
let index = 1;
slidesBox.style.transform = "translateX(-" + moveWay * index + "px)";

///listen to next button///
let nextButton = document.querySelector(".next-button");
nextButton.addEventListener("click", () => {
  if (index < slides.length - 1) {
    index++;
    slidesBox.style.transform = "translateX(-" + moveWay * index + "px)";
    slidesBox.style.transition = "ease 0.5s";
    controlNavButton();
  }
});

///listen to previous button///
let preButton = document.querySelector(".pre-button");
preButton.addEventListener("click", () => {
  if (index <= 0) return;
  index--;
  slidesBox.style.transform = "translateX(-" + moveWay * index + "px)"; //point!
  slidesBox.style.transition = "ease 0.5s";
  controlNavButton();
});

//////listen to transtionend/////
slidesBox.addEventListener("transitionend", () => {
  if (slides[index].id === "firstClone") {
    index = 1;
    slidesBox.style.transform = "translateX(-" + moveWay * index + "px)";
    slidesBox.style.transition = "none";
    controlNavButton();
  }
  if (slides[index].id === "lastClone") {
    index = slides.length - 2;
    slidesBox.style.transform = "translateX(-" + moveWay * index + "px)";
    slidesBox.style.transition = "none";
    controlNavButton();
  }
});

////listen to nav button///
function changNavButton() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      let currentButton = document.querySelector(".current-button");
      let nextButtonIndex = navButtons.indexOf(button);
      currentButton.classList.remove("current-button");
      navButtons[nextButtonIndex].classList.add("current-button");
      slidesBox.style.transform =
        "translateX(-" + moveWay * (nextButtonIndex + 1) + "px)"; //point!
      slidesBox.style.transition = "ease 0.5s";
      index = nextButtonIndex + 1;
    });
  });
}

/////處理nav button同步變動//////
function controlNavButton() {
  let currentButton = document.querySelector(".current-button");
  let nextButton = navButtons[index - 1];
  nextButton.classList.add("current-button");
  currentButton.classList.remove("current-button");
}

let bookingBtn = document.querySelector(".booking-button");
bookingBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let url = location.href;
  let preId = url.substring(url.lastIndexOf("/") + 1).lastIndexOf("#");
  let attractionId = 0;
  if (preId != -1) {
    attractionId = url.substring(url.lastIndexOf("/") + 1, preId);
  }
  if (preId == -1) {
    attractionId = url.substring(url.lastIndexOf("/") + 1);
  }

  let date = document.querySelector(".date input").value;
  let time = document.querySelector(".time-radios input:checked").value;
  let price = document.querySelector(".fees").innerText;
  if (price == "新台幣 2000 元整") {
    price = 2000;
  }
  if (price == "新台幣 2500 元整") {
    price = 2500;
  }
  let body = {
    attractionId: attractionId,
    date: date,
    time: time,
    price: price,
  };

  fetch("/api/booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      res = response.json();
      if (response.ok) {
        res.then((data) => {
          window.location.replace("/booking");
        });
      } else if (response.status == 400) {
        res.then((data) => {
          warning(data);
        });
      } else {
        res.then((data) => {
          buildForm();
        });
      }
    })
    .catch((error) => {
      warning(error);
    });
});

function warning(data) {
  let warning = document.querySelector(".warning");
  warning.innerText = data["message"];
  listenToDate();
}

function listenToDate() {
  let warning = document.querySelector(".warning");
  let inputDate = document.querySelector(".date input");
  inputDate.addEventListener("change", () => {
    warning.innerText = "";
  });
}
