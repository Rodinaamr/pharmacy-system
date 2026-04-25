import sqlite3

db_path = r'c:\Users\roday\OneDrive\Desktop\pharmacy system\GreenPharmacy\backend\GreenPharmacy.Api\pharmacy.db'

suppliers = [
    ('S001', 'hikma', 'Ahmed Khalil', '+20 2 1234 5678', 'orders@hikma.com', 'Cairo, Egypt', 4.8, 0),
    ('S002', 'eva pharma', 'Sara Mostafa', '+20 2 9876 5432', 'supply@evapharma.com', 'Giza, Egypt', 4.5, 0)
]

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

for s in suppliers:
    cursor.execute("""
        INSERT OR REPLACE INTO Suppliers (Id, Name, ContactPerson, Phone, Email, Address, Rating, ActiveOrders)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, s)

conn.commit()
conn.close()
print("Suppliers imported successfully!")
