import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# DATABASE_URL examples:
# - SQLite (default): sqlite:///./rifa.db
# - PostgreSQL: postgresql+psycopg://user:password@localhost:5432/rifa
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rifa.db")

# SQLite needs check_same_thread=False for multithreaded servers
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



