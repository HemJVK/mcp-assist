from openai import OpenAI
from app.config import get_settings
from typing import Dict, Any

class LLMService:
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        if self.settings.openai_api_key:
            self.client = OpenAI(api_key=self.settings.openai_api_key)
        else:
            print("Warning: OpenAI API Key not set. LLM features will not work.")

    def generate_draft(self, recipient_name: str, sender_profile: Dict, context_instruction: str) -> str:
        """
        Generates an email draft using OpenAI.
        """
        if not self.client:
            return "[Error: OpenAI API Key missing]"

        prompt = f"""
        Draft a professional email to {recipient_name}.
        Sender: {sender_profile.get('name')} ({sender_profile.get('role')}).
        Context/Instruction: {context_instruction}

        Include a subject line (implicitly) but return only the body text.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful email drafting assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"[Error generating draft: {str(e)}]"

    def refine_draft(self, current_draft: str, instruction: str) -> str:
        """
        Refines an existing draft based on instructions.
        """
        if not self.client:
            return "[Error: OpenAI API Key missing]"

        prompt = f"""
        Refine the following email draft based on this instruction: "{instruction}".

        Current Draft:
        {current_draft}

        Return only the refined email body.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful email editing assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"[Error refining draft: {str(e)}]"
