from app.scoring.service import score_tip

def test_scoring_directly():
    result = score_tip("Normal tip text")
    assert result["score"] <= 100
    assert "flags" in result

def test_all_caps():
    result = score_tip("THIS IS ALL CAPS")
    assert "all_caps" in result["flags"]

def test_repeated_characters():
    result = score_tip("Wow!!!!!")
    assert "repeated_characters" in result["flags"]

def test_blocked_word():
    result = score_tip("Buy this now")
    assert "blocked_word" in result["flags"]

def test_url_heavy():
    result = score_tip("Check https://example.com https://example2.com https://example3.com")
    assert "url_heavy" in result["flags"]
