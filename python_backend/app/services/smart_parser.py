import re

def analyze_incoming_email(email_body: str, sender_address: str) -> dict:
    """
    Analyzes an incoming email to check for 'no-reply' senders and suggests alternatives found in the body.
    """
    result = {
        "is_noreply": False,
        "warning": None,
        "alternative_email": None
    }

    if "noreply" in sender_address.lower():
        result["is_noreply"] = True

        # Regex to find email addresses
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        matches = re.findall(email_pattern, email_body)

        # Filter out 'noreply' addresses from matches
        alternatives = [m for m in matches if "noreply" not in m.lower()]

        if alternatives:
            suggested = alternatives[0]  # Pick the first valid email found
            result["alternative_email"] = suggested
            result["warning"] = f"Warning: No-Reply address. Suggested alternative: {suggested}"
        else:
            result["warning"] = "Warning: No-Reply address. No alternative contact found."

    return result
