from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Hobby
from schemas import HobbyCreate, HobbyResponse


# ============================================================
# HOBBY ROUTER
# ============================================================

router = APIRouter(
    prefix="/hobbies",
    tags=["Hobbies"],
)


# ============================================================
# ADD HOBBY
# ============================================================

@router.post(
    "/",
    response_model=HobbyResponse,
)
def add_hobby(
    hobby_data: HobbyCreate,
    db: Session = Depends(get_db),
):
    # Check that the hobby name isn't empty
    if not hobby_data.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Hobby name cannot be empty.",
        )

    # Create new hobby
    new_hobby = Hobby(
        user_id=hobby_data.user_id,
        name=hobby_data.name.strip(),
    )

    # Save to database
    db.add(new_hobby)
    db.commit()
    db.refresh(new_hobby)

    return new_hobby


# ============================================================
# GET USER HOBBIES
# ============================================================

@router.get(
    "/user/{user_id}",
    response_model=list[HobbyResponse],
)
def get_user_hobbies(
    user_id: str,
    db: Session = Depends(get_db),
):
    hobbies = (
        db.query(Hobby)
        .filter(Hobby.user_id == user_id)
        .order_by(Hobby.created_at.desc())
        .all()
    )

    return hobbies


# ============================================================
# DELETE HOBBY
# ============================================================

@router.delete("/{hobby_id}")
def delete_hobby(
    hobby_id: int,
    db: Session = Depends(get_db),
):
    hobby = (
        db.query(Hobby)
        .filter(Hobby.id == hobby_id)
        .first()
    )

    if not hobby:
        raise HTTPException(
            status_code=404,
            detail="Hobby not found.",
        )

    db.delete(hobby)
    db.commit()

    return {
        "message": "Hobby deleted successfully.",
        "hobby_id": hobby_id,
    }