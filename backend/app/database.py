from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Aapke exact server name ke saath connection string
# Server: DESKTOP-VEIPHS8\SQLEXPRESS
# Database: GreenChainDB

DATABASE_URL = "mssql+pyodbc://DESKTOP-VEIPHS8\\SQLEXPRESS/GreenChainDB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT DB_NAME() as db_name"))
            row = result.fetchone()
            print(f"✅ Database connected successfully! Connected to: {row[0]}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\n💡 Troubleshooting:")
        print("1. Make sure SQL Server Browser service is running")
        print("2. Check firewall settings")
        return False