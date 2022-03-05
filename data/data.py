import json
import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="test1234",
  database="website"
)
mycursor = mydb.cursor()

with open(r"data\taipei-attractions.json",mode="r",encoding="utf-8") as file:
    data=json.load(file) 
    # print(data)
coreData=data["result"]["results"]
length=len(coreData)
print(length)
# for attraction in coreData:
#     x=attraction
#     info=x["info"]
#     stitle=x["stitle"]
#     xpostDate=x["xpostDate"]
#     longitude=x["longitude"]
#     REF_WP=x["REF_WP"]
#     avBegin=x["avBegin"]
#     langinfo=x["langinfo"]
#     MRT=x["MRT"]
#     SERIAL_NO=x["SERIAL_NO"]
#     RowNumber=x["RowNumber"]
#     CAT1=x["CAT1"]
#     CAT2=x["CAT2"]
#     MEMO_TIME=x["MEMO_TIME"]
#     POI=x["POI"]
#     file=x["file"]
#     images=file.split("https")
#     del images[0]
#     imgLength=len(images)
#     index=0
#     while index<imgLength:
#       images[index]="https"+images[index]
#       index+=1	
#       images=images
#     finalFile=[]
#     for url in images:
#       if "jpg" in url or "png" in url: 
#         finalFile.append(url)
#     images=",".join(finalFile)
#     # print(images)  
#     file=images
#     idpt=x["idpt"]
#     latitude=x["latitude"]
#     xbody=x["xbody"]
#     _id=x["_id"]
#     avEnd=x["avEnd"]
#     address=x["address"]
#     sql="INSERT INTO attractions (info,stitle,xpostDate,longitude,REF_WP,avBegin,langinfo,MRT,SERIAL_NO,RowNumber,CAT1,CAT2,MEMO_TIME,POI,file,idpt,latitude,xbody,_id,avEnd,address) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
#     val=(info,stitle,xpostDate,longitude,REF_WP,avBegin,langinfo,MRT,SERIAL_NO,RowNumber,CAT1,CAT2,MEMO_TIME,POI,file,idpt,latitude,xbody,_id,avEnd,address)
#     mycursor.execute(sql,val)
#     mydb.commit()

