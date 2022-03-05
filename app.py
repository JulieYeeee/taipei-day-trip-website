
from flask import *
from flask import make_response
import mysql.connector
import math
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config['JSON_SORT_KEYS'] = False

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="test1234",
  database="website"
)
mycursor=mydb.cursor(buffered=True)


@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):

	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

@app.route("/api/attractions",methods=["get"])
def search():
	#先處理關鍵字查詢抓取資料
	keyword=request.args.get("keyword")
	sql="SELECT id,stitle,CAT2,xbody,address,info,MRT,latitude,longitude,file FROM attractions WHERE stitle LIKE %s"
	val=("%"+keyword+"%",)
	mycursor.execute(sql,val)
	result=mycursor.fetchall()
	page=int(request.args.get("page"))#要求字串轉數值
	#確認符合資料筆數
	length=len(result)
	#確認以每頁顯示12筆可以顯示幾頁
	length/=12  #可能是整數也可能含有小數,後續再透過判斷式處理
	attractions=[]  #用來承接景點資料的空列表
	if length>1 and isinstance(length, int): #如果搜尋結果的總頁數為整數且大於一頁
		totalPages=length
		if page==0: #當第0頁時，顯示最前面的12筆資料
			start=page #從第start個顯示景點，也就是0
			end=page+11 #結束於第end個景點,也就是11
			grabData(start,end,result,attractions) #執行函式
		else: #其他頁數顯示的資料處理
			start=page*12
			end=start+11
			grabData(start,end,result,attractions)
	elif length>1 and isinstance(length, float): #如果搜尋結果的總頁數非整數且大於一頁
		totalPages=math.ceil(length) #向上進位,將總頁數修正為整數
		if page==0:
			start=page
			end=page+11
			grabData(start,end,result,attractions)
		else:
			start=page*12
			end=start+11
			grabData(start,end,result,attractions)
	else: #如果搜尋結果有資料但小於等於1頁
		totalPages=math.ceil(length) #向上進位校正頁數
		start=page*12
		end=page+11
		grabData(start,end,result,attractions)


	if page>=0 and page<totalPages-1:	#當指定頁碼大於等於0，小於資料總頁數時
		return jsonify({"nextpage":page+1,"data":attractions}),200
	elif page>=0 and page==totalPages-1:  #當指定頁碼大於等於0,等於資料最後一頁時
		return jsonify({"nextpage":None,"data":attractions}),200	
	elif length==0: #當查不到相關資料時
		return jsonify({"error":True,"message":"無相關景點，請使用其他關鍵字"}),400
	else:
		return jsonify({"error":True,"message": "oops!網站出了差錯"}),500

def grabData(start,end,result,attractions):
	for attraction in result[start:end]:
			images=attraction[9].split(",")
			data={"id":attraction[0],"name":attraction[1],"category":attraction[2],"description":attraction[3],"address":attraction[4],"transport":attraction[5],"mrt":attraction[6],"latitude":attraction[7],"longitude":attraction[8],"images":images}
			attractions.append(data)

@app.route("/api/attraction/<attractionId>",methods=["get"])
def showAttraction(attractionId):
	sql="SELECT id,stitle,CAT2,xbody,address,info,MRT,latitude,longitude,file FROM attractions WHERE id=%s"
	val=(attractionId,)
	mycursor.execute(sql,val)
	result=mycursor.fetchone()
	if result:
		images=result[9].split(",")
		data={"id":result[0],"name":result[1],"category":result[2],"description":result[3],"address":result[4],"transport":result[5],"mrt":result[6],"latitude":result[7],"longitude":result[8],"images":images}
		return jsonify(data),200
	elif not result:
		warning={"error": True,"message": "景點編號不正確"}
		return jsonify(warning),400
	else:
		warning={"error": True,"message": "OOPS!系統出了點錯誤"}
		return jsonify(warning),500
	




if __name__ == "__main__":
	app.run(port=3000)