import random
import re

def generate_meeting_code() -> str:
    """Generate a realistic 10-digit Zoom meeting code formatted as 'xxx xxxx xxxx'."""
    part1 = f"{random.randint(100, 999)}"
    part2 = f"{random.randint(1000, 9999)}"
    part3 = f"{random.randint(1000, 9999)}"
    return f"{part1} {part2} {part3}"

def normalize_meeting_code(code: str) -> str:
    """Normalize meeting code by stripping spaces, hyphens, and URL prefixes."""
    if not code:
        return ""
    # Strip URL prefixes if full invite URL was pasted
    code = code.split("/")[-1].split("?")[0]
    # Keep only digits and characters
    clean_digits = re.sub(r"[^0-9a-zA-Z]", "", code)
    # If 10 digits, format nicely as 'xxx xxxx xxxx'
    if len(clean_digits) == 10 and clean_digits.isdigit():
        return f"{clean_digits[:3]} {clean_digits[3:7]} {clean_digits[7:]}"
    return code.strip()
