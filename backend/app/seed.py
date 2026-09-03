from app.database import SessionLocal, engine
from app import models, auth

def seed_db():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    author_email = "author@example.com"
    if not db.query(models.User).filter(models.User.email == author_email).first():
        author = models.User(
            email=author_email,
            hashed_password=auth.get_password_hash("author123"),
            role="author"
        )
        db.add(author)
        
    reviewer_email = "reviewer@example.com"
    if not db.query(models.User).filter(models.User.email == reviewer_email).first():
        reviewer = models.User(
            email=reviewer_email,
            hashed_password=auth.get_password_hash("reviewer123"),
            role="reviewer"
        )
        db.add(reviewer)
        
    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
