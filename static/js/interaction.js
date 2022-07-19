let openData = {};
let keyword = "";
let page = 0;
let checkLoad = false;
///fetch attractions///
function fetchData(keyword, page) {
  let loader = document.createElement("div");
  loader.className = "loader";
  let attractionsContainer = document.querySelector(".adaptLayer");
  attractionsContainer.append(loader);
  fetch(`/api/attractions?keyword=${keyword}&page=${page}`)
    .then((response) => {
      let res = response.json();
      if (response.ok) {
        res.then((data) => {
          openData = data;
          startAppend(openData, attractionsContainer, loader);
        });
      } else {
        res.then((data) => {
          openData = data;
          errorMsg(openData, attractionsContainer, loader);
        });
      }
    })
    .catch((error) => {
      openData = error;
      errorMsg(openData, attractionsContainer, loader);
    });
}

///處理fetch後的景點資料///
function startAppend(data, attractionsContainer, loader) {
  lengthOfData = data["data"].length;
  //清除loader圖示

  for (let start = 0; start < lengthOfData; start++) {
    let entireInfo = data["data"][start];
    //景點資料最外層容器
    let attraction = document.createElement("div");
    attraction.classList.add("attraction");
    //div for attraction image
    let image = document.createElement("div");
    image.classList.add("image");
    //img
    let img = document.createElement("img");
    url = entireInfo["images"][0];
    img.setAttribute("src", url);
    //attraction name
    let attName = document.createElement("h3");
    attName.classList.add("att-name");
    attName.innerText = entireInfo["name"];
    //div for detail info of attraction
    let attInfo = document.createElement("div");
    attInfo.classList.add("att-info");
    //mrt info
    let mrt = document.createElement("p");
    mrt.classList.add("mrt");
    mrt.innerText = entireInfo["mrt"];
    //category of attraction
    let cat = document.createElement("p");
    cat.classList.add("cat");
    cat.innerText = entireInfo["category"];
    //attraction link for heading to///
    let link = document.createElement("div");
    link.classList.add("link");
    link.innerText = "view";
    let a = document.createElement("a");
    a.href = "/attraction/" + entireInfo["id"];

    // //start appending
    attractionsContainer.append(attraction);
    attraction.append(image, attName, attInfo, a);
    image.append(img);
    attInfo.append(mrt, cat);
    a.append(link);
  }
  loader.className = "";
  checkLoad = false;
}
//處理查關鍵字錯誤訊息//
function errorMsg(openData, attractionsContainer, loader) {
  loader.className = "";
  let info = openData["message"];
  let msg = document.createElement("h3");
  msg.classList.add("errorMsg");
  msg.innerText = info;
  attractionsContainer.appendChild(msg);
  attractionsContainer.style.padding = "3.2rem";
}

////listen to load////
window.addEventListener("load", () => {
  checkMemberStatus();
  fetchData(keyword, page);
});

////listen to scroll////
window.addEventListener("scroll", () => {
  if (checkLoad == false) {
    if (
      window.scrollY + window.innerHeight + 1 >=
      document.documentElement.scrollHeight
    ) {
      if (openData["nextpage"] != null) {
        checkLoad = true;
        page++;
        fetchData(keyword, page);
      }
    }
  }
});

////listen to button////
let button = document.querySelector(".search-container .search form button");
button.addEventListener("click", (e) => {
  e.preventDefault();
  let attractionsContainer = document.querySelector(".adaptLayer");
  //clean up content while do new search
  if (attractionsContainer.childNodes.length != 0) {
    attractionsContainer.innerHTML = "";
    attractionsContainer.style.height = "";
  }
  //get data from input and pass to the url to fetch
  let target = new FormData(
    document.querySelector(".search-container .search form")
  );
  keyword = target.get("keyword");
  page = 0;
  fetchData(keyword, page);
});
