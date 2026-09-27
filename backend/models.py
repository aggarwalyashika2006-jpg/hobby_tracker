from sqlalchemy import (
    Column,
    BigInteger,
    Text,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


# ============================================================
# PROFILE MODEL
# ============================================================

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id = Column(
        Text,
        unique=True,
        nullable=False,
        index=True,
    )

    email = Column(Text)

    name = Column(Text)

    bio = Column(Text)

    avatar = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


# ============================================================
# HOBBY MODEL
# ============================================================

class Hobby(Base):
    __tablename__ = "hobbies"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id = Column(
        Text,
        nullable=False,
        index=True,
    )

    name = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


# ============================================================
# PRACTICE LOG MODEL
# ============================================================

class PracticeLog(Base):
    __tablename__ = "practice_logs"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id = Column(
        Text,
        nullable=False,
        index=True,
    )

    hobby = Column(
        Text,
        nullable=False,
    )

    minutes = Column(
        Integer,
        nullable=False,
    )

    notes = Column(Text)

    practice_date = Column(
        Date,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


# ============================================================
# POST MODEL
# ============================================================

class Post(Base):
    __tablename__ = "posts"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id = Column(
        Text,
        nullable=False,
        index=True,
    )

    email = Column(Text)

    text = Column(
        Text,
        nullable=False,
    )

    image_url = Column(Text)

    likes = Column(
        Integer,
        default=0,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


# ============================================================
# LIKE MODEL
# ============================================================

class Like(Base):
    __tablename__ = "likes"

    id = Column(BigInteger, primary_key=True, index=True)

    post_id = Column(
        BigInteger,
        ForeignKey(
            "posts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    __table_args__ = (
        UniqueConstraint(
            "post_id",
            "user_id",
            name="unique_post_user_like",
        ),
    )


# ============================================================
# COMMENT MODEL
# ============================================================

class Comment(Base):
    __tablename__ = "comments"

    id = Column(BigInteger, primary_key=True, index=True)

    post_id = Column(
        BigInteger,
        ForeignKey(
            "posts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Text,
        nullable=False,
    )

    email = Column(Text)

    text = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )