from models import (
    Profile,
    Hobby,
    PracticeLog,
    Post,
    Like,
    Comment,
)


print("Testing SQLAlchemy models...")

print("Profile table:", Profile.__tablename__)
print("Hobby table:", Hobby.__tablename__)
print("Practice log table:", PracticeLog.__tablename__)
print("Post table:", Post.__tablename__)
print("Like table:", Like.__tablename__)
print("Comment table:", Comment.__tablename__)

print("All models loaded successfully!")