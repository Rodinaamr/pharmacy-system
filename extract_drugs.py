import json
import random

input_file = r"C:\Users\roday\OneDrive\Desktop\Dermatology_clinic\node_modules\.cache\gh-pages\https!github.com!Rodinaamr!Project_clinic.git\app\data\medications_New_prices_up_to_03-08-2024.json"

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

drugs = data.get('drugs', [])
selected_drugs = drugs # Get all drugs

medications = []
colors = ['#E8F5E9', '#FFF8E1', '#FFEBEE', '#E3F2FD', '#F3E5F5', '#EFEBE9']

for i, drug in enumerate(selected_drugs):
    qty = random.randint(0, 100)
    min_level = 20
    status = 'available'
    if qty == 0:
        status = 'out_of_stock'
    elif qty < min_level:
        status = 'low_stock'
        
    med = {
        "id": f"M{i+1:03d}",
        "name": drug.get('tradename', 'Unknown').strip(),
        "category": drug.get('group', 'General').title() if drug.get('group') else "General",
        "description": drug.get('pharmacology', '').strip()[:200] + ("..." if len(drug.get('pharmacology', '')) > 200 else ""),
        "stockQuantity": qty,
        "minStockLevel": min_level,
        "unit": drug.get('form', 'Units').title(),
        "expiryDate": f"{random.randint(1, 12)}/{2025 + random.randint(0, 3)}",
        "batchNumber": f"BTH-{random.randint(1000, 9999)}",
        "price": float(drug.get('new_price', 0)) if drug.get('new_price') else 0.0,
        "supplier": drug.get('company', 'Local Pharma').strip(),
        "status": status,
        "imageColor": random.choice(colors)
    }
    medications.append(med)

print(json.dumps(medications, indent=2))
