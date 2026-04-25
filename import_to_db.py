import json
import sqlite3
import os

# Paths
json_path = r'c:\Users\roday\OneDrive\Desktop\pharmacy system\meds_output_fixed.json'
db_path = r'c:\Users\roday\OneDrive\Desktop\pharmacy system\GreenPharmacy\backend\GreenPharmacy.Api\pharmacy.db'

print(f"Loading medications from {json_path}...")
with open(json_path, 'r', encoding='utf-8') as f:
    medications = json.load(f)

print(f"Found {len(medications)} medications. Connecting to database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Clear existing medications (except seed data if desired, but here we want the full list)
cursor.execute("DELETE FROM Medications")

print("Importing medications...")
for med in medications:
    cursor.execute("""
        INSERT INTO Medications (Id, Name, Category, Description, StockQuantity, MinStockLevel, Unit, ExpiryDate, BatchNumber, Price, Supplier, Status, ImageColor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        med.get('id'),
        med.get('name'),
        med.get('category', ''),
        med.get('description', ''),
        med.get('stockQuantity', 0),
        med.get('minStockLevel', 20),
        med.get('unit', 'Units'),
        med.get('expiryDate', ''),
        med.get('batchNumber', ''),
        med.get('price', 0.0),
        med.get('supplier', ''),
        med.get('status', 'available'),
        med.get('imageColor', '#E8F5E9')
    ))

conn.commit()
conn.close()
print("Successfully imported all medications into the backend database!")
