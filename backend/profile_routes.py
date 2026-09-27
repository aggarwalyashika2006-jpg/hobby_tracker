from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Profile
from schemas import (
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)


# ============================================================
# PROFILE ROUTER
# ============================================================

router = APIRouter(
    prefix="/profiles",
    tags=["Profiles"],
)


# ============================================================
# CREATE / SAVE PROFILE
# ============================================================

@router.post(
    "/",
    response_model=ProfileResponse,
)
def create_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check whether profile already exists
    # --------------------------------------------------------

    existing_profile = (
        db.query(Profile)
        .filter(Profile.user_id == profile_data.user_id)
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists for this user.",
        )

    # --------------------------------------------------------
    # Create profile
    # --------------------------------------------------------

    new_profile = Profile(
        user_id=profile_data.user_id,
        email=profile_data.email,
        name=profile_data.name,
        bio=profile_data.bio,
        avatar=profile_data.avatar,
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


# ============================================================
# GET PROFILE
# ============================================================

@router.get(
    "/user/{user_id}",
    response_model=ProfileResponse,
)
def get_profile(
    user_id: str,
    db: Session = Depends(get_db),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found.",
        )

    return profile


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put(
    "/user/{user_id}",
    response_model=ProfileResponse,
)
def update_profile(
    user_id: str,
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found.",
        )

    # --------------------------------------------------------
    # Update only the fields that were provided
    # --------------------------------------------------------

    if profile_data.email is not None:
        profile.email = profile_data.email

    if profile_data.name is not None:
        profile.name = profile_data.name

    if profile_data.bio is not None:
        profile.bio = profile_data.bio

    if profile_data.avatar is not None:
        profile.avatar = profile_data.avatar

    db.commit()
    db.refresh(profile)

    return profile


# ============================================================
# DELETE PROFILE
# ============================================================

@router.delete(
    "/user/{user_id}"
)
def delete_profile(
    user_id: str,
    db: Session = Depends(get_db),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found.",
        )

    db.delete(profile)
    db.commit()

    return {
        "message": "Profile deleted successfully.",
        "user_id": user_id,
    }
