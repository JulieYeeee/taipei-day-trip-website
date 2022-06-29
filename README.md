# Taipei-day-trip-website 台北一日遊 
台北一日遊是一個景點導覽預約平台，選擇預約日期並付款，即可預約。  

----

上線網址: http://54.225.122.244:3000/  
測試帳號: test@gmail.com  
測試密碼: test  

----

## 主要功能  
+ 會員登入與註冊功能
+ 滾動觸發景點載入
+ 關鍵字搜尋功能
+ 單一景點瀏覽
+ 付款預訂行程
+ 瀏覽訂單紀錄與修改密碼

---

## 功能展示
+ Popup 會員登入介面
  + 使用預訂服務前，使用者皆須註冊並登入會員。點擊右上角即可使用登入/註冊介面。    
  ![](https://github.com/JulieYeeee/git-work/blob/main/popup1.gif)   
    
+ Infinite Scroll (Lazy Loading) 滾動載入更多景點  
  + 初始載入首頁預設顯示前 20 筆景點資料。若想瀏覽更多，透過滾動觸發載入更多景點資訊。  
  ![](https://github.com/JulieYeeee/git-work/blob/main/infinite%20scroll1.gif)  
     
+ 瀏覽景點 Hover Effect  
  + 游標滑至景點上方會顯示 Hover Effect，增加互動回饋。  
  ![](https://github.com/JulieYeeee/git-work/blob/main/hover1.gif)   
    
+ 關鍵字搜尋功能  
  + 輸入想搜尋的台北景點或關鍵字，若與任一景點名稱符合的搜尋字詞，將在同一頁面展示。  
  ![](https://github.com/JulieYeeee/git-work/blob/main/search1.gif)  
    
+ 景點照片輪播效果  
  + 點擊進入景點即可瀏覽更多資訊。景點照片以輪播效果展示，點擊左右箭頭或照片下方圓點都可以更換圖片。  
  ![](https://github.com/JulieYeeee/git-work/blob/main/view1.gif)  
    
+ 預定導覽與付款  
  + 填寫預定資料及信用卡付款資訊，若付款成功，將跳轉至感謝頁面。預定及付款資料若未填寫完整或錯誤，系統將跳出提示。  
  ![](https://github.com/JulieYeeee/git-work/blob/main/payment2.gif)  
    
+ 瀏覽訂單紀錄與修改密碼  
  + 進入會員專區即可觀看歷史訂單，也可以更改會員登入密碼。密碼更改後，於下次登入時生效。  
  ![](https://github.com/JulieYeeee/git-work/blob/main/password2.gif)  

----

## 關於專案技術實踐  
+ 前端：HTML、CSS (SCSS)、JavaScript、AJAX
+ 後端：Python Flask、MySQL、ConnectionPool
+ 其他：AWS EC2、Git/GitHub

+ 登入介面 Popup 效果
  + 在 CSS 設定 「position: fixed」、「z-index 值」讓登入介面可固定顯示在頁面最表層。
  + 透過添加或移除 class name，套用對應的 display 設定，達到展示或關閉的效果。 

+ 首頁 Infinite Scroll (Lazy Loading)  
  + 透過 scrollY 與 innerHeight 高度比較，偵測卷軸是否已經滑到整體頁面最底部。
  + 當頁面滑到最底部，再觸發 AJAX 取得資料庫中的景點資料。
  + 為避免過度觸發 AJAX ，設定 buffer 機制，當資料未取得前，將不會觸發下次 AJAX。

+ 關鍵字搜尋功能
  + 取得 input 內的 value，並且透過 AJAX 至後端資料庫比對。
  + 設定 e.preventDefault() ，停止表單預設跳轉行為。
  + 偵測展示景點區塊是否存在資料，若有會進行清除，再將搜尋後的資料 append 上去。

+ 景點照片輪播效果  
  + 輪播區塊分為兩層架構: 外層展示框、內層圖片容器。
  + 最外層是固定的展示區外框，設有「 overflow: hidden 」，遮蔽不在展示區塊內的圖片。
  + 內層圖片容器存放景點照片，並且排列成如底片條的一列形式。不在展示區範圍內的照片將被遮蔽。
  + 透過 getBoundingClientRect() 取得外層展示框的 width ，作為圖片容器位移的依據。
  + 每當按下圖片左右箭頭或下方圓點，將計算該圖片排列順序 * width ，設定圖片容器 left 的數值，達到輪播效果。
 
+ 預定導覽與付款 
  + 串接第三方金流套件 TapPay 達成付款功能。

+ 瀏覽訂單紀錄與修改密碼
  + 使用 AJAX 將新密碼送至資料庫更新。

----
![](https://github.com/JulieYeeee/git-work/blob/main/taipei-rwd.png)   
## 開發者資訊：  
葉怡君 Julie Ye  
📩 oopsyeh056@gmail.com   
🔗 https://www.linkedin.com/in/julieyeeee/  

