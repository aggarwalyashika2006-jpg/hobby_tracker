import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Load variables from the .env file
load_dotenv()


# PostgreSQL connection URL
DATABASE_URL = os.getenv("DATABASE_URL")


# Make sure DATABASE_URL exists
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL is missing. "
        "Please create a .env file and add your Supabase database URL."
    )


# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Base class for our database models
Base = declarative_base()


# Database dependency for FastAPI
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()