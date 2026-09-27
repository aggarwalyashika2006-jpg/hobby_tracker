from pydantic import BaseModel
from typing import Optional
from datetime import date


# ============================================================
# HOBBY SCHEMAS
# ============================================================

class HobbyCreate(BaseModel):
    user_id: str
    name: str


class HobbyResponse(BaseModel):
    id: int
    user_id: str
    name: str

    class Config:
        from_attributes = True


# ============================================================
# PRACTICE LOG SCHEMAS
# ============================================================

class PracticeLogCreate(BaseModel):
    user_id: str
    hobby: str
    minutes: int
    notes: Optional[str] = None
    practice_date: date


class PracticeLogResponse(BaseModel):
    id: int
    user_id: str
    hobby: str
    minutes: int
    notes: Optional[str]
    practice_date: date

    class Config:
        from_attributes = True


# ============================================================
# PROFILE SCHEMAS
# ============================================================

class ProfileCreate(BaseModel):
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: str
    email: Optional[str]
    name: Optional[str]
    bio: Optional[str]
    avatar: Optional[str]

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None


# ============================================================
# POST SCHEMAS
# ============================================================

class PostCreate(BaseModel):
    user_id: str
    email: Optional[str] = None
    text: str
    image_url: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    user_id: str
    email: Optional[str]
    text: str
    image_url: Optional[str]
    likes: int

    class Config:
        from_attributes = True


# ============================================================
# COMMENT SCHEMAS
# ============================================================

class CommentCreate(BaseModel):
    user_id: str
    email: Optional[str] = None
    post_id: int
    text: str


class CommentResponse(BaseModel):
    id: int
    user_id: str
    email: Optional[str]
    post_id: int
    text: str

    class Config:
        from_attributes = True


# ============================================================
# LIKE SCHEMAS
# ============================================================

class LikeCreate(BaseModel):
    user_id: str
    post_id: int


class LikeResponse(BaseModel):
    id: int
    user_id: str
    post_id: int

    class Config:
        from_attributes = True