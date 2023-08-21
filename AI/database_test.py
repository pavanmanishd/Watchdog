import cx_Oracle

class DataBase():
    def __init__(self):
        self.username = "aimlb4"
        self.password = "vishalsai"
        self.host = "localhost"
        self.port = "1521"
        self.service_name = "xe"
        try:
            dsn = cx_Oracle.makedsn(self.host, self.port, service_name=self.service_name)
            self.connection = cx_Oracle.connect(self.username, self.password, dsn)
        except:
            print('[ERROR] Database connection failed')
            raise Exception('Database connection failed')
        
    def insert(self, file_name, encounter_details):
        self.cursor = self.connection.cursor()   
        for encounter in encounter_details:
            query = 'insert into encounters values(:name, :confidence, :timestamp, :image)'
            values = {
                "name": encounter,
                "confidence": encounter_details[encounter]["confidence"],
                "timestamp": encounter_details[encounter]["encounter_time"],
                "image": file_name
            }
        # print(values)
        self.cursor.execute(query, values)
        self.connection.commit()
        self.cursor.close()

    def select(self):
        self.cursor = self.connection.cursor()
        query = 'select * from customer'
        self.cursor.execute(query)
        print(self.cursor.fetchall())
        self.cursor.close()

    
db = DataBase()
db.insert('test.jpg', {'vishal': {'confidence': 0.9, 'encounter_time': '2021-05-30 12:00:00'}})
db.select()