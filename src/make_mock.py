import json
import random
import sys
from pathlib import Path

DEFAULT_COUNT = 200

random.seed(42)

# Use the number from the command line if given, else use 200
count = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_COUNT

customers = []
for i in range(1, count + 1):
    loyalty = round(random.uniform(0, 1), 2)
    # Lower loyalty gives a higher ITE, plus some random noise
    ite = 20 * (1 - loyalty) - 4 + random.gauss(0, 2)
    customers.append({
        "customer_id": f"C-{i:04d}",
        "ite": round(ite, 2),
        "age": random.randint(18, 70),
        "loyalty_score": loyalty,
        "avg_order_value": round(random.uniform(20, 100), 2),
    })

# The repo root is one folder above src
repo_root = Path(__file__).resolve().parent.parent
out_dir = repo_root / "frontend" / "public"
out_dir.mkdir(parents=True, exist_ok=True)

file_name = "mock_ite.json" if count == DEFAULT_COUNT else "mock_ite_big.json"
out_path = out_dir / file_name

with open(out_path, "w") as f:
    json.dump(customers, f, indent=2)

print(f"Saved {count} customers to {out_path}")
