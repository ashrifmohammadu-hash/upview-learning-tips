import re
from typing import Dict, Any

BLOCKED_WORDS = {"spamword1", "spamword2", "buy", "crypto"}

SIMULATE_FAILURE = False

def set_simulate_failure(value: bool):
    global SIMULATE_FAILURE
    SIMULATE_FAILURE = value

def score_tip(text: str) -> Dict[str, Any]:
    global SIMULATE_FAILURE
    if SIMULATE_FAILURE:
        raise RuntimeError("Simulated scoring service failure")

    flags = []
    text_trimmed = text.strip()

    if not text_trimmed:
        flags.append("empty")
        return {"score": 0, "flags": flags}

    if re.search(r'(.)\1{4,}', text_trimmed):
        flags.append("repeated_characters")

    letters = [c for c in text_trimmed if c.isalpha()]
    if letters and len(letters) > 4:
        if sum(1 for c in letters if c.isupper()) / len(letters) > 0.8:
            flags.append("all_caps")

    words = set(re.findall(r'\b\w+\b', text_trimmed.lower()))
    if words.intersection(BLOCKED_WORDS):
        flags.append("blocked_word")

    urls = re.findall(r'https?://[^\s]+|www\.[^\s]+', text_trimmed)
    if len(urls) > 2 or (len(urls) > 0 and len(text_trimmed) < 20):
        flags.append("url_heavy")
    
    base_score = 100
    if flags:
        base_score -= 20 * len(flags)
    
    score = max(0, min(100, base_score - (280 - len(text_trimmed)) // 10))
    if score < 0:
        score = 0
    if len(flags) > 0:
        score = min(score, 50)
        
    return {"score": score, "flags": flags}
