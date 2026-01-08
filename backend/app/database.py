from sqlmodel import create_engine, Session, SQLModel, text
from typing import Generator
from app.config import settings


# Create SQLModel engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_size=5,  # Number of connections to maintain in the pool
    max_overflow=10,  # Maximum number of connections to create beyond pool_size
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
)


def init_db() -> None:
    """
    Initialize database tables.

    Note: For this authentication system, Better Auth (frontend) creates
    the tables automatically. This function is here for future use when
    we add application-specific tables.
    """
    # SQLModel.metadata.create_all(engine)
    pass


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.

    Yields:
        Session: SQLModel database session

    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            items = db.query(Item).all()
            return items
    """
    with Session(engine) as session:
        yield session


def test_connection() -> bool:
    """
    Test database connection.

    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        with Session(engine) as session:
            # Execute a simple query to test connection
            session.exec(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
