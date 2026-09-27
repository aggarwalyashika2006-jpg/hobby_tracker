from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import PracticeLog


# ============================================================
# DASHBOARD ROUTER
# ============================================================

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ============================================================
# GET DASHBOARD STATISTICS
# ============================================================

@router.get("/{user_id}")
def get_dashboard(
    user_id: str,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Get all practice logs belonging to this user
    # --------------------------------------------------------

    logs = (
        db.query(PracticeLog)
        .filter(PracticeLog.user_id == user_id)
        .order_by(
            PracticeLog.practice_date.desc()
        )
        .all()
    )

    # ========================================================
    # TOTAL MINUTES
    # ========================================================

    total_minutes = sum(
        log.minutes
        for log in logs
    )

    # ========================================================
    # WEEKLY MINUTES
    # ========================================================

    today = date.today()

    # Monday is the beginning of the current week
    week_start = (
        today - timedelta(days=today.weekday())
    )

    weekly_minutes = sum(
        log.minutes
        for log in logs
        if week_start <= log.practice_date <= today
    )

    # ========================================================
    # PRACTICE DATES
    # ========================================================

    practice_dates = sorted(
        {
            log.practice_date
            for log in logs
        },
        reverse=True,
    )

    # ========================================================
    # CURRENT STREAK
    # ========================================================

    streak = 0

    if practice_dates:
        # A current streak starts only if the user
        # practiced today.
        if practice_dates[0] == today:

            streak = 1
            current_date = today

            for practice_date in practice_dates[1:]:

                expected_date = (
                    current_date - timedelta(days=1)
                )

                if practice_date == expected_date:
                    streak += 1
                    current_date = practice_date

                else:
                    break

    # ========================================================
    # BADGES
    # ========================================================

    badges = []

    # --------------------------------------------------------
    # First Practice Badge
    # --------------------------------------------------------

    if total_minutes > 0:
        badges.append(
            {
                "name": "First Practice",
                "icon": "🌱",
                "description": "Completed your first practice session.",
            }
        )

    # --------------------------------------------------------
    # 100 Minutes Badge
    # --------------------------------------------------------

    if total_minutes >= 100:
        badges.append(
            {
                "name": "100 Minutes",
                "icon": "💯",
                "description": "Practiced for at least 100 minutes.",
            }
        )

    # --------------------------------------------------------
    # 500 Minutes Badge
    # --------------------------------------------------------

    if total_minutes >= 500:
        badges.append(
            {
                "name": "500 Minutes",
                "icon": "🏅",
                "description": "Practiced for at least 500 minutes.",
            }
        )

    # --------------------------------------------------------
    # 1000 Minutes Badge
    # --------------------------------------------------------

    if total_minutes >= 1000:
        badges.append(
            {
                "name": "1000 Minutes",
                "icon": "🏆",
                "description": "Practiced for at least 1000 minutes.",
            }
        )

    # --------------------------------------------------------
    # 3 Day Streak Badge
    # --------------------------------------------------------

    if streak >= 3:
        badges.append(
            {
                "name": "3 Day Streak",
                "icon": "🔥",
                "description": "Practiced for 3 consecutive days.",
            }
        )

    # --------------------------------------------------------
    # 7 Day Streak Badge
    # --------------------------------------------------------

    if streak >= 7:
        badges.append(
            {
                "name": "7 Day Streak",
                "icon": "🔥",
                "description": "Practiced for 7 consecutive days.",
            }
        )

    # --------------------------------------------------------
    # 30 Day Streak Badge
    # --------------------------------------------------------

    if streak >= 30:
        badges.append(
            {
                "name": "30 Day Streak",
                "icon": "👑",
                "description": "Practiced for 30 consecutive days.",
            }
        )

    # ========================================================
    # RETURN DASHBOARD DATA
    # ========================================================

    return {
        "user_id": user_id,

        "total_minutes": total_minutes,

        "weekly_minutes": weekly_minutes,

        "streak": streak,

        "badges": badges,

        "practice_days": len(practice_dates),
    }