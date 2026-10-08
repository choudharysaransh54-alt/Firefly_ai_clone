"""Reset the database and load the demo data:  python -m app.seed"""
from ..database import Base, SessionLocal, engine
from .seed import seed_if_empty

if __name__ == "__main__":
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_if_empty(db)
    print("Database reset and seeded with demo meetings.")
