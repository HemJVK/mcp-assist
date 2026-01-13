from pydantic import BaseModel
from typing import Optional
import hashlib
import json
import hmac

# AP2: Agent Payment Protocol (Commerce)

class Mandate(BaseModel):
    task_id: str
    budget_limit: float
    currency: str = "USD"
    signature: str

class Wallet:
    def __init__(self, private_key: str):
        self.private_key = private_key # In reality, use cryptography keys
        self.balance = 1000.0

    def sign_mandate(self, task_id: str, budget: float) -> Mandate:
        payload = f"{task_id}:{budget}"
        signature = hmac.new(
            self.private_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        return Mandate(
            task_id=task_id,
            budget_limit=budget,
            signature=signature
        )

    def verify_mandate(self, mandate: Mandate) -> bool:
        payload = f"{mandate.task_id}:{mandate.budget_limit}"
        expected_signature = hmac.new(
            self.private_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature, mandate.signature)

    def process_payment(self, amount: float, mandate: Mandate) -> bool:
        if not self.verify_mandate(mandate):
            print("Payment failed: Invalid mandate signature.")
            return False

        if amount > mandate.budget_limit:
            print("Payment failed: Amount exceeds mandate budget.")
            return False

        if self.balance < amount:
            print("Payment failed: Insufficient wallet funds.")
            return False

        self.balance -= amount
        print(f"Payment processed: {amount}. Remaining balance: {self.balance}")
        return True
