
from flask import *
from flask import make_response
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
import math
import requests
import time
from dotenv import load_dotenv
import os

load_dotenv()  # take environment variables from .env.

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config['JSON_SORT_KEYS'] = False
app.config['SECRET_KEY'] ="asdfghjkl"


#connection pool
mysqlPool = mysql.connector.pooling.MySQLConnectionPool(
	pool_name="taipeitour",
	pool_reset_session=True,
    host="localhost",         
	user=os.getenv("dbUser"),      
    passwd=os.getenv("dbPsw"),    
    database='website',
    pool_size= 5
)


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

@app.route("/member")
def member():
	return render_template("member.html")

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
			cursor.close()
			connection.close() 
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
			cursor.close()
			connection.close() 
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
		connection.commit()
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



########api for booking process##########
@app.route("/api/booking",methods=["GET"])
def checkbooking():
	if session.get("email"):
		email=session.get("email")
		print("會員:",email,"已登入，準備確認預定資料")
		sql="SELECT * FROM booking WHERE account = %s AND status=%s LIMIT %s"
		val=(email,0,1,)
		connection=mysqlPool.get_connection()
		cursor=connection.cursor(buffered=True)
		cursor.execute(sql,val)
		result=cursor.fetchone()
		print("購物車資訊:",result)
		cursor.close()
		connection.close() 
		if result:
			attraction={"id":result[2],"name":result[3],"address":result[4],"image":result[8]}
			data={"attraction":attraction,"date":result[5],"time":result[6],"price":result[7]} 
			print("訂單內容:",data,"付款狀態:",result[9])
			return jsonify({"data":data}),200
		else:
			print("訂單內容:",result)
			return jsonify({"data":None}),200
	else:
		print("會員登入狀態:",session.get("email"))
		return jsonify({"error":True,"message":"尚未登入會員"}),403


@app.route("/api/booking",methods=["POST"])
def order():
	email=session.get("email")
	if email:
		requestData=request.get_json()
		if requestData["attractionId"] and requestData["date"] and requestData["time"] and requestData["price"]:
			#connect to connection pool
			connection=mysqlPool.get_connection()
			cursor=connection.cursor(buffered=True)
			sql="SELECT COUNT(*) FROM booking WHERE account=%s AND status=%s LIMIT %s"
			val=(email,0,1,)
			cursor.execute(sql,val)
			if cursor.fetchone():
				print("正在清除資料")
				delete(email)
			attId=requestData["attractionId"]
			#get info from attractions table
			sql="SELECT * FROM attractions WHERE id=%s LIMIT %s"
			val=(attId,1,)
			cursor.execute(sql,val)
			result=cursor.fetchone()
			attName=result[2]
			address=result[21]
			file=result[15].split(",")[0]
			#insert data into booking table
			sql="INSERT INTO booking (account,att_id,att_name,att_address,date,time,price,image,status) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)"
			val=(email,attId,attName,address,requestData["date"],requestData["time"],requestData["price"],file,0,)
			cursor.execute(sql,val)
			connection.commit()
			#return connection
			cursor.close()
			connection.close() 
			print("已加入預定")
			return jsonify({"ok":True}),200
		else:
			return jsonify({"error": True,"message": "訂單資訊不完整"}),400
		
	elif not email:
		return jsonify({"error": True,"message": "尚未登入會員"}),403
	else:
		return jsonify({"error": True,"message": "OOPS!網路出了錯誤"}),500


@app.route("/api/booking",methods=["DELETE"])
def cancelbooking():
	email=session.get("email")
	if email:
		delete(email)
		return jsonify({"ok": True}),200
	else:
		return jsonify({"error": True,"message": "尚未登入會員"}),403

def delete(email):
	sql="DELETE FROM booking WHERE account=%s AND status=%s LIMIT %s"
	val=(email,0,1,)
	connection=mysqlPool.get_connection()
	cursor=connection.cursor(buffered=True)
	cursor.execute(sql,val)
	connection.commit()
	cursor.close()
	connection.close() 


########api for order and payment process##########
@app.route("/api/orders",methods=["POST"])
def payOrder():
	#check member has logged in or not
	email=session.get("email")
	if email:
		#request json data from front-end
		orderInfo=request.get_json()
		#when user try to pay order,build an order data in orderlist table in DB
		##0.open connection pool
		connection=mysqlPool.get_connection()
		cursor=connection.cursor(buffered=True)
		##1.build order number: booking date + member id
		sql="SELECT id FROM tourmember WHERE email=%s LIMIT %s"
		val=(email,1,)
		cursor.execute(sql,val)
		memberId=cursor.fetchone()[0]
		orderNum= str(time.strftime('%Y%m%d%H%M%S', time.localtime(time.time())))[-4:]+ str(time.time()).replace('.', '')[-3:]+str(memberId)
		##2.get part of order info from request body
		bookingName=orderInfo["order"]["contact"]["name"]
		bookingEmail=orderInfo["order"]["contact"]["email"]
		bookingPhone=orderInfo["order"]["contact"]["phone"]
		attName=orderInfo["order"]["trip"]["attraction"]["name"]
		##3.get booking id from booking table in DB
		sql="SELECT id FROM booking WHERE account=%s AND att_name=%s"
		val=(email,attName,)
		cursor.execute(sql,val)
		bookingId=cursor.fetchone()[0]
		##4.insert order info into orderlist table in DB
		sql="INSERT INTO orderlist VALUE (%s,%s,%s,%s,%s,%s,%s)"
		val=(email,orderNum,0,bookingId,bookingName,bookingEmail,bookingPhone,)
		cursor.execute(sql,val)
		connection.commit()
		##5.return conntection
		cursor.close()
		connection.close() 
		# preparing request json data to TapPay server
		partnerKey=os.getenv("partnerKey")
		merchantId=os.getenv("merchantId")
		paymentInfo={
			"prime": orderInfo["prime"],
			"partner_key": partnerKey,
			"merchant_id": merchantId,
			"amount": orderInfo["order"]["price"],
			"currency": "TWD",
			"details":"TapPay Test",		
			"cardholder": {
				"phone_number":orderInfo["order"]["contact"]["phone"],
				"name": orderInfo["order"]["contact"]["name"],
				"email": orderInfo["order"]["contact"]["email"],
				"zip_code": "",
				"address": "",
				"national_id": ""
				},
			}
		tappayApi="https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
		headers={ 
			"Content-Type": "application/json",
			"x-api-key": partnerKey
			} 
		# send request to TapPay server		
		paymentRequest=requests.post(tappayApi,headers=headers,data=json.dumps(paymentInfo).encode('utf-8')) #json dumps is point
		# response from TapPay server
		tappayRes=json.loads(paymentRequest.text) #json loads is point
		print("付款狀態: ",tappayRes["status"])
		#if pay order successfully, update payment status in orderlist and booking data in booking table
		if tappayRes["status"]==0:
			#0.open connection
			connection=mysqlPool.get_connection()
			cursor=connection.cursor(buffered=True)
			#1.update payment status in orderlist table in DB
			sql="UPDATE orderlist SET payment_status=%s WHERE order_number=%s LIMIT %s"
			val=(1,orderNum,1,)
			cursor.execute(sql,val)
			connection.commit()
			#2.update status from 0 to 1 in booking table in DB
			sql="UPDATE booking SET status=%s WHERE id=%s LIMIT %s"
			val=(1,bookingId,1,)
			cursor.execute(sql,val)
			connection.commit()
			#3.return conntection
			cursor.close()
			connection.close() 
			#return success response
			response={
					"number": orderNum,
					"payment": {
						"status": 0,
						"message": "付款成功"
					}
			}
			return jsonify({"data":response}),200
		elif tappayRes["status"]!=0:
			print("付款錯誤:",tappayRes["status"])
			return jsonify({"error": True,"message": "付款失敗"}),400
		else:
			print("內部出錯")
			return jsonify({"error": True,"message": "OOPS!網站出了點差錯"}),500
	else:
		print("尚未登入會員")
		return jsonify({"error": True,"message": "尚未登入會員"}),403		


@app.route("/api/order/<orderNumber>",methods=["GET"])
def checkOrderStatus(orderNumber):
	print(orderNumber)
	email=session.get("email")
	if email:
		#0.open connection
		connection=mysqlPool.get_connection()
		cursor=connection.cursor(buffered=True)
		#1.get final order data 
		sql="SELECT * FROM orderlist WHERE order_number=%s LIMIT %s"
		val=(orderNumber,1,)
		cursor.execute(sql,val)
		orderData=cursor.fetchone()
		#2.check data being exixsted or not 
		if orderData:
			#3.get booking data for response
			bookingId=orderData[3]
			sql="SELECT * FROM booking WHERE id=%s LIMIT %s"
			val=(bookingId,1,)
			cursor.execute(sql,val)
			bookingData=cursor.fetchone()
			#4.return conntection
			cursor.close()
			connection.close() 
			#data for response
			data={
				"number": orderData[1],
				"price": bookingData[7],
				"trip": {
				"attraction": {
					"id": bookingData[2],
					"name": bookingData[3],
					"address": bookingData[4],
					"image": bookingData[8]
				},
				"date": str(bookingData[5]),
				"time": bookingData[6]
				},
				"contact": {
				"name": orderData[4],
				"email": orderData[5],
				"phone": orderData[6]
				},
				"status": orderData[2]
			}
			return jsonify({"data":data}),200
		else:
			return jsonify({"data":None}),200	
	else:
		return jsonify({"error": True,"message": "尚未登入會員"}),403

@app.route("/api/memberinfo",methods=["GET"])
def getMemberOrder():
	email=session.get("email");
	#if user has logged in, get entire member data
	if email :
		#0.open connection
		connection=mysqlPool.get_connection()
		cursor=connection.cursor(buffered=True)
		#1.execute sql command
		sql="SELECT * FROM orderlist LEFT JOIN booking ON orderlist.booking_id = booking.id WHERE email=%s"
		val=(email,)
		cursor.execute(sql,val)
		memberData=cursor.fetchall()
		print(memberData)
		#2.return conntection
		cursor.close()
		connection.close()
		orders=[]		
		if memberData:
			for order in memberData:
				singleOrder={
					"number":order[1],
					"attraction":order[10],
					"date":str(order[12]),
					"status":order[2]
				} 
				orders.append(singleOrder)
		else:
			orders=None		

		return jsonify({"data":orders}),200
	else:
		return jsonify({"error": True, "message":"尚未登入會員"}),403

@app.route("/api/memberinfo",methods=["PATCH"])
def changeMemberInfo():
	email=session.get("email");
	print(email)
	if email:
		changeData=request.get_json()
		# 0.open connection
		connection=mysqlPool.get_connection()
		cursor=connection.cursor(buffered=True)
		sql="UPDATE tourmember SET password=%s WHERE email=%s"
		val=(changeData["password"],changeData["email"],)
		cursor.execute(sql,val)
		connection.commit()
		#2.return conntection
		cursor.close()
		connection.close()
		return jsonify({"ok":True}),200
	elif not email:
		return jsonify({"erro":True,"message":"尚未登入會員"}),403
	else:
		return jsonify({{"erro":True,"message":"OOPS!系統出了錯誤"}}),500

if __name__ == "__main__":
	app.debug = True
	app.run(host="0.0.0.0",port=3000)

