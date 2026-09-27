from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine

from hobby_routes import router as hobby_router
from log_routes import router as log_router
from profile_routes import router as profile_router
from community_routes import router as community_router
from dashboard_routes import router as dashboard_router


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Hobby Tracker API",
    description="Backend API for the Hobby Tracker application",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INCLUDE HOBBY ROUTES
# ============================================================

app.include_router(hobby_router)


# ============================================================
# INCLUDE PRACTICE LOG ROUTES
# ============================================================

app.include_router(log_router)


# ============================================================
# INCLUDE PROFILE ROUTES
# ============================================================

app.include_router(profile_router)


# ============================================================
# INCLUDE COMMUNITY ROUTES
# ============================================================

app.include_router(community_router)


# ============================================================
# INCLUDE DASHBOARD ROUTES
# ============================================================

app.include_router(dashboard_router)


# ============================================================
# HOME / HEALTH CHECK
# ============================================================

@app.get("/")
def home():
    return {
        "message": "Hobby Tracker API is running!",
        "status": "success",
    }


# ============================================================
# DATABASE CONNECTION TEST
# ============================================================

@app.get("/database-test")
def database_test():
    try:
        with engine.connect():
            return {
                "message": "Database connection successful!",
                "database": "Supabase PostgreSQL",
                "status": "success",
            }

    except Exception as error:
        return {
            "message": "Database connection failed.",
            "error": str(error),
            "status": "error",
        }