
from flask import *
from flask import make_response
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
import math
from configparser import ConfigParser

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config['JSON_SORT_KEYS'] = False
app.config['SECRET_KEY'] ="asdfghjkl"

cfg=ConfigParser()
cfg.read("db.ini")
db_cfg=dict(cfg.items("logindata"))

#connection pool
mysqlPool = mysql.connector.pooling.MySQLConnectionPool(
	pool_name="taipeitour",
	pool_reset_session=True,
    host="localhost",     
    user=db_cfg["user"],      
    passwd=db_cfg["psw"],      
    database='website',
    pool_size= 5
)


# mydb = mysql.connector.connect(
#   host="localhost",
#   user=db_cfg["user"],
#   password=db_cfg["psw"],
#   database="website"
# )
# mycursor=mydb.cursor(buffered=True)


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
	page=int(request.args.get("page"))#要求字串轉數值
	sql="SELECT COUNT(*) FROM attractions WHERE stitle LIKE %s"
	val=("%"+keyword+"%",)
	connection=mysqlPool.get_connection()
	cursor=connection.cursor(buffered=True)
	cursor.execute(sql,val)
	result=cursor.fetchone()
	count=result[0] #景點數量
	pages=count/12  #可能是整數也可能含有小數,後續再透過判斷式處理
	attractions=[]

	if pages>1 and isinstance(pages, int): #如果搜尋結果的總頁數為整數且大於一頁
		totalPages=pages
		if page==0: #當第0頁時，顯示最前面的12筆資料
			start=page #從第start個顯示景點，也就是0
			 #結束於第end個景點,也就是11
			grabData(keyword,start,attractions,cursor) #執行函式
		else: #其他頁數顯示的資料處理
			start=page*12
			grabData(keyword,start,attractions,cursor)
		cursor.close()
		connection.close()  
	elif pages>1 and isinstance(pages, float): #如果搜尋結果的總頁數非整數且大於一頁
		totalPages=math.ceil(pages) #向上進位,將總頁數修正為整數
		if page==0:
			start=page
			grabData(keyword,start,attractions,cursor)
		else:
			start=page*12
			grabData(keyword,start,attractions,cursor)
		cursor.close()
		connection.close()  
	else: #如果搜尋結果有資料但小於等於1頁
		totalPages=math.ceil(pages) #向上進位校正頁數
		start=page*12
		grabData(keyword,start,attractions,cursor)
		cursor.close()
		connection.close()  


	if page>=0 and page<totalPages-1:	#當指定頁碼大於等於0，小於資料總頁數時
		return jsonify({"nextpage":page+1,"data":attractions}),200
	elif page>=0 and page==totalPages-1:  #當指定頁碼大於等於0,等於資料最後一頁時
		return jsonify({"nextpage":None,"data":attractions}),200	
	elif pages==0: #當查不到相關資料時
		return jsonify({"error":True,"message":"無相關景點，請使用其他關鍵字"}),400
	else:
		return jsonify({"error":True,"message": "oops!網站出了差錯"}),500


def grabData(keyword,start,attractions,cursor):
    sql="SELECT id,stitle,CAT2,xbody,address,info,MRT,latitude,longitude,file FROM attractions WHERE stitle LIKE %s LIMIT %s,%s"
    val=("%"+keyword+"%",start,12,)
    cursor.execute(sql,val)
    result=cursor.fetchall()
    for attraction in result:
        images=attraction[9].split(",")
        data={"id":attraction[0],"name":attraction[1],"category":attraction[2],"description":attraction[3],"address":attraction[4],"transport":attraction[5],"mrt":attraction[6],"latitude":attraction[7],"longitude":attraction[8],"images":images}
        attractions.append(data)

@app.route("/api/attraction/<attractionId>",methods=["get"])
def showAttraction(attractionId):
	sql="SELECT id,stitle,CAT2,xbody,address,info,MRT,latitude,longitude,file FROM attractions WHERE id=%s"
	val=(attractionId,)
	connection=mysqlPool.get_connection()
	cursor=connection.cursor(buffered=True) 
	cursor.execute(sql,val)
	result=cursor.fetchone()
	cursor.close()
	connection.close() 
	if result:
		images=result[9].split(",")
		data={"id":result[0],"name":result[1],"category":result[2],"description":result[3],"address":result[4],"transport":result[5],"mrt":result[6],"latitude":result[7],"longitude":result[8],"images":images}
		return jsonify({"data":data}),200
	elif not result:
		warning={"error": True,"message": "景點編號不正確"}
		return jsonify(warning),400
	else:
		warning={"error": True,"message": "OOPS!系統出了點錯誤"}
		return jsonify(warning),500
	

#以下新增user操作之Api
@app.route("/api/user",methods=["GET"])
def checkMemberStatus():
	email=session.get("email")
	if email==None:
		data=None
		print("會員未登入，session狀態:",email)
		return jsonify({"data":data})
	else:
		sql="SELECT * FROM tourmember WHERE email=%s LIMIT %s"
		val=(email,1,)
		connection=mysqlPool.get_connection()
		cursor=connection.cursor(buffered=True) 
		cursor.execute(sql,val)
		result=cursor.fetchone()
		cursor.close()
		connection.close() 
		data={"id":result[0],"name":result[1],"email":result[2]}
		print("會員已登入，session狀態:",email)
		return jsonify({"data":data})


@app.route("/api/user",methods=["POST"])
def signup():
	requestData = request.get_json()
	name=requestData["name"]
	email=requestData["email"]
	password=requestData["password"]
	connection=mysqlPool.get_connection()
	cursor=connection.cursor(buffered=True) 
	memberData=getMemberData(email,cursor)

	if memberData==None:
		sql="INSERT INTO tourmember (name,email,password) VALUES (%s,%s,%s)"
		val=(name,email,password,)
		cursor.execute(sql,val)
		# mydb.commit()
		mysqlPool.commit()
		print("email可註冊，並執行註冊完成")
		session["email"]=email
		cursor.close()
		connection.close() 
		return jsonify({"ok":True}),200
	elif memberData!=None:
		print("信箱已被註冊，阻擋註冊")
		cursor.close()
		connection.close() 
		return jsonify({"error": True,"message": "Email已被註冊"}),400
	else:
		print("內部出錯")
		cursor.close()
		connection.close() 
		return jsonify({"error": True,"message": "OOPS!網站出了點錯誤"}),500
	

def getMemberData(email,cursor):
	sql="SELECT * FROM tourmember WHERE email=%s LIMIT %s"
	val=(email,1,)
	cursor.execute(sql,val)
	result=cursor.fetchone()
	return result

@app.route("/api/user",methods=["PATCH"])
def signin():
	requestData = request.get_json()
	print("接收request body:",requestData)
	email=requestData["email"]
	password=requestData["password"]
	connection=mysqlPool.get_connection()
	cursor=connection.cursor(buffered=True) 
	identification=checkMemberData(email,password,cursor)
	cursor.close()
	connection.close() 
	if identification==1:
		session["email"]=email
		print("有符合的會員資料，登入OK")
		return jsonify({"ok":True}),200
	elif identification==0:
		print("無符合的會員資料，登入錯誤")
		return jsonify({"error":True,"message":"帳號或密碼錯誤"}),400
	else:
		print("內部出錯")
		return jsonify({"error":True,"message":"OOPS!網路出了點錯誤"}),500		

def checkMemberData(email,password,cursor):
	sql="SELECT COUNT(*) FROM tourmember WHERE email=%s AND password=%s LIMIT %s"
	val=(email,password,1,)
	cursor.execute(sql,val)
	result=cursor.fetchone()
	print ("確認符合會員比數:",result[0])
	return result[0]

@app.route("/api/user",methods=["DELETE"])
def signout():
	session.pop("email")
	email=session.get("email")
	print("已登出，目前session狀態:",email)
	return jsonify({"ok": True})




if __name__ == "__main__":
	app.debug = True
	app.run(host="0.0.0.0",port=3000)