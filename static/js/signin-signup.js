////check member status on every page on taipei tour website確認會員登入狀態////
function checkMemberStatus(){
    console.log("準備確認會員狀態")
    fetch("/api/user",{
        method:"GET"
    })
    .then(response=>{
        let res=response.json();
        if(response.ok){
            res.then(status=>{
                if (status["data"]==null){
                    showSignin();
                }
                else{
                    showSignout(status);
                }
            })
        }
    })
}

///show "signin" or "signout" top right after checking member status 確認會員狀態後，修改右上角按鈕文字並觸發載入頁面資料///
///狀態未登入，顯示"登入/註冊"///
function showSignin(){
    let memberStatusBtn=document.querySelector(".member-status");
    memberStatusBtn.innerText="登入/註冊";
    console.log("顯示尚未登入");
}
///狀態已登入，顯示"登出系統"///
function showSignout(status){
    let memberStatusBtn=document.querySelector(".member-status");
    memberStatusBtn.innerText="登出系統";
    if (page=="booking"){
        let username=status["data"]["name"];
        let welcome=document.querySelector(".booking-welcome")
        welcome.innerText=`你好，${username}，待預定的行程如下：`;
    }
    console.log("顯示已登入");
}



let body=document.querySelector("body");
let memberStatusBtn=document.querySelector(".member-status");
///listen to signin/signup button 監聽右上角按鈕，並觸發對應函式///
memberStatusBtn.addEventListener("click",()=>{
    if (memberStatusBtn.innerText==="登入/註冊"){
        buildForm();
        console.log("complete building form");
    }
    if(memberStatusBtn.innerText==="登出系統"){
        signout();
        console.log("sign out");
    }
})
///fetch for signing out///
function signout(){
    fetch("/api/user",{
        method:"DELETE",
    })
    .then(response=>{
        let res=response.json();
        if(response.ok){
            res.then(data=>{
                if(data["ok"]){
                    reloadPage()
                    console.log("已經登出");
                }
            })
        }else{
            return;
        }
    }) 
}
/////trigger for reload page////
function reloadPage(){
    window.location.reload();
}

////trigger for build signin/signup form////
function buildForm(){
    ///create elements first///
    let signInBackground=document.createElement("div");
    signInBackground.className="signInBackground";

    let signinSignupForm=document.createElement("form");
    signinSignupForm.className="signin-signup-form turn-on";
    // signinSignupForm.action="#";

    let formDeco=document.createElement("div");
    formDeco.className="border-deco";

    let closeButton=document.createElement("div");
    closeButton.className="close-button";

    let signinSignupTitle=document.createElement("h3");
    signinSignupTitle.className="signin-signup-title";

    let signinSignupInputs=document.createElement("div");
    signinSignupInputs.className="signin-signup-inputs";

    let inputName=document.createElement("input");
    inputName.className="input-name";
    inputName.type="text";
    inputName.placeholder="輸入姓名";

    let inputEmail=document.createElement("input");
    inputEmail.className="input-email";
    inputEmail.type="email";
    inputEmail.placeholder="輸入信箱";

    let inputPassword=document.createElement("input");
    inputPassword.className="input-password";
    inputPassword.type="password";
    inputPassword.placeholder="輸入密碼";

    let inputButton=document.createElement("button");
    inputButton.className="input-button";
    inputButton.type="submit";

    let reminder=document.createElement("p");
    reminder.className="reminder";

    let noteZone=document.createElement("div");
    noteZone.className="note-zone";

    let note=document.createElement("p");
    note.className="note";

    let signinSignup=document.createElement("a");
    signinSignup.className="signin-signup";

    let blankSpace=document.createElement("div");
    blankSpace.className="blank-space";
    ///then append elements///
    body.append(signInBackground,signinSignupForm);
    signinSignupForm.append(formDeco,closeButton,signinSignupTitle,signinSignupInputs,reminder,noteZone,blankSpace);
    signinSignupInputs.append(inputName,inputEmail,inputPassword,inputButton);
    noteZone.append(note,signinSignup);
    /// touch off relative function///
    defaultShowUp(signInBackground,signinSignupForm,closeButton,signinSignupTitle,inputName,inputButton,note,signinSignup,reminder);
    listenToCloseBtn(closeButton,signInBackground,signinSignupForm,reminder);
    listenToBackground(signInBackground,signinSignupForm,reminder);
    listenToInputButton(inputButton,inputName,inputEmail,inputPassword,reminder);
    listenToSignup(signInBackground,signinSignupForm,closeButton,signinSignupTitle,inputName,inputButton,note,signinSignup,reminder);
}
///show "signin" version,"not signed in" will be the dafault status///
function defaultShowUp(signInBackground,signinSignupForm,closeButton,signinSignupTitle,inputName,inputButton,note,signinSignup,reminder){
    signinSignupTitle.innerText="登入會員帳號";
    inputButton.innerText="登入帳戶";
    note.innerText="還沒有帳戶?";
    signinSignup.innerText="點此註冊";
    signInBackground.style.display="block";
    signinSignupForm.classList.remove("turn-on");
    inputName.style.display="none";
    reminder.innerText="";
}

///listen to "signup" button in the form 根據表單中的"點此註冊"按鈕觸發對應表單內容///
function listenToSignup(signInBackground,signinSignupForm,closeButton,signinSignupTitle,inputName,inputButton,note,signinSignup,reminder){
    signinSignup.addEventListener("click",()=>{
        if(signinSignup.innerText==="點此註冊"){
            signinSignupTitle.innerText="註冊會員帳號";
            inputName.style.display="block";
            inputButton.innerText="註冊新帳戶";
            note.innerText="已經有帳戶了?";
            signinSignup.innerText="點此登入";
            reminder.innerText="";
        }else{
            defaultShowUp(signInBackground,signinSignupForm,closeButton,signinSignupTitle,inputName,inputButton,note,signinSignup,reminder)
        }
    })
}

////listen to signInBackground and closeButton for closing signin/signup form////
function listenToBackground(signInBackground,signinSignupForm){
    signInBackground.addEventListener("click",()=>{
        closeForm(signInBackground,signinSignupForm);
    })
}

function listenToCloseBtn(closeButton,signInBackground,signinSignupForm){
    closeButton.addEventListener("click",()=>{
        closeForm(signInBackground,signinSignupForm);
    })
}

////trigger for closing signin/signup form////
function closeForm(signInBackground,signinSignupForm){
    signInBackground.style.display="none";
    signinSignupForm.classList.add("turn-on");
}

///listen to signin-button then fetch////
function listenToInputButton(inputButton,inputName,inputEmail,inputPassword,reminder){
    inputButton.addEventListener("click",e=>{
        e.preventDefault();
        let username=inputName.value;
        let email=inputEmail.value;
        let password=inputPassword.value;
        if(inputButton.innerText==="註冊新帳戶"){
            console.log("註冊會員介面");
            if(username && email && password){
                signup(username,email,password,reminder);
            }else{
                remind("請輸入註冊資料",reminder);
            }
        }

        if(inputButton.innerText==="登入帳戶"){
            console.log("登入會員介面");
            if(email && password){
                signin(email,password,reminder);        
            }else{
                remind("請輸入會員資料",reminder);
            }
        }
    })
}

///fetch for signing up///
function signup(username,email,password,reminder){
    let data={
        "name": username,
        "email": email,
        "password": password
    };
    fetch("/api/user",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data),
    })
    .then(response=>{
        let res=response.json();
        if(response.ok){
            res.then(result=>{
                if(result["ok"]){
                    remind("註冊會員成功",reminder);
                    reloadPage();
                }
            })
        }else{
            res.then(result=>{
                if(result["error"]){
                    remind(result["message"],reminder);
                }
            })
        }
    })
}
///fetch for signing in///
function signin(email,password,reminder){
    let data={
        "email": email,
        "password": password
    };
    fetch("/api/user",{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    })
    .then(response=>{
        let res=response.json();
        if(response.ok){
            res.then(result=>{
                if(result["ok"]){
                    remind("會員登入成功",reminder);
                    reloadPage();
                }
            })
        }else{
            res.then(result=>{
                if(result["error"]){
                    remind(result["message"],reminder);
                }
            })
        }

    })
}
/////show relative message after checking the content which user just send out////
function remind(msg,reminder){
    reminder.innerText=msg;
    reminder.style.display="block";
    
}


let goBooking=document.querySelector(".go-booking");
console.log(goBooking);
goBooking.addEventListener("click",()=>{
    let memberStatusBtn=document.querySelector(".member-status");
    if (memberStatusBtn.innerText==="登入/註冊"){
        buildForm();
        console.log("complete building form");
    }
    if(memberStatusBtn.innerText==="登出系統"){
        goBooking.href="/booking";
    }
})