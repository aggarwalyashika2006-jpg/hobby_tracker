from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import PracticeLog
from schemas import PracticeLogCreate, PracticeLogResponse


# ============================================================
# PRACTICE LOG ROUTER
# ============================================================

router = APIRouter(
    prefix="/logs",
    tags=["Practice Logs"],
)


# ============================================================
# ADD PRACTICE LOG
# ============================================================

@router.post(
    "/",
    response_model=PracticeLogResponse,
)
def add_log(
    log_data: PracticeLogCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Validate minutes
    # --------------------------------------------------------

    if log_data.minutes <= 0:
        raise HTTPException(
            status_code=400,
            detail="Practice minutes must be greater than 0.",
        )

    # --------------------------------------------------------
    # Validate hobby name
    # --------------------------------------------------------

    if not log_data.hobby.strip():
        raise HTTPException(
            status_code=400,
            detail="Hobby name cannot be empty.",
        )

    # --------------------------------------------------------
    # Create practice log
    # --------------------------------------------------------

    new_log = PracticeLog(
        user_id=log_data.user_id,
        hobby=log_data.hobby.strip(),
        minutes=log_data.minutes,
        notes=log_data.notes,
        practice_date=log_data.practice_date,
    )

    # --------------------------------------------------------
    # Save to PostgreSQL
    # --------------------------------------------------------

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


# ============================================================
# GET USER PRACTICE LOGS
# ============================================================

@router.get(
    "/user/{user_id}",
    response_model=list[PracticeLogResponse],
)
def get_user_logs(
    user_id: str,
    db: Session = Depends(get_db),
):
    logs = (
        db.query(PracticeLog)
        .filter(PracticeLog.user_id == user_id)
        .order_by(
            PracticeLog.practice_date.desc(),
            PracticeLog.created_at.desc(),
        )
        .all()
    )

    return logs


# ============================================================
# GET TOTAL PRACTICE MINUTES
# ============================================================

@router.get("/user/{user_id}/total-minutes")
def get_total_minutes(
    user_id: str,
    db: Session = Depends(get_db),
):
    logs = (
        db.query(PracticeLog)
        .filter(PracticeLog.user_id == user_id)
        .all()
    )

    total = sum(log.minutes for log in logs)

    return {
        "user_id": user_id,
        "total_minutes": total,
    }


# ============================================================
# GET WEEKLY PRACTICE MINUTES
# ============================================================

@router.get("/user/{user_id}/weekly-minutes")
def get_weekly_minutes(
    user_id: str,
    db: Session = Depends(get_db),
):
    today = date.today()

    # Monday = start of current week
    week_start = today - timedelta(days=today.weekday())

    logs = (
        db.query(PracticeLog)
        .filter(
            PracticeLog.user_id == user_id,
            PracticeLog.practice_date >= week_start,
            PracticeLog.practice_date <= today,
        )
        .all()
    )

    weekly_total = sum(log.minutes for log in logs)

    return {
        "user_id": user_id,
        "week_start": str(week_start),
        "today": str(today),
        "weekly_minutes": weekly_total,
    }


# ============================================================
# CALCULATE PRACTICE STREAK
# ============================================================

@router.get("/user/{user_id}/streak")
def get_streak(
    user_id: str,
    db: Session = Depends(get_db),
):
    logs = (
        db.query(PracticeLog)
        .filter(PracticeLog.user_id == user_id)
        .all()
    )

    # --------------------------------------------------------
    # Get unique practice dates
    # --------------------------------------------------------

    practice_dates = sorted(
        {
            log.practice_date
            for log in logs
        },
        reverse=True,
    )

    if not practice_dates:
        return {
            "user_id": user_id,
            "streak": 0,
        }

    # --------------------------------------------------------
    # A streak must begin today.
    # --------------------------------------------------------

    today = date.today()

    if practice_dates[0] != today:
        return {
            "user_id": user_id,
            "streak": 0,
        }

    # --------------------------------------------------------
    # Count consecutive days
    # --------------------------------------------------------

    streak = 1
    current_date = today

    for practice_date in practice_dates[1:]:
        expected_date = current_date - timedelta(days=1)

        if practice_date == expected_date:
            streak += 1
            current_date = practice_date
        else:
            break

    return {
        "user_id": user_id,
        "streak": streak,
    }


# ============================================================
# DELETE PRACTICE LOG
# ============================================================

@router.delete("/{log_id}")
def delete_log(
    log_id: int,
    db: Session = Depends(get_db),
):
    log = (
        db.query(PracticeLog)
        .filter(PracticeLog.id == log_id)
        .first()
    )

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Practice log not found.",
        )

    db.delete(log)
    db.commit()

    return {
        "message": "Practice log deleted successfully.",
        "log_id": log_id,
    }