from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models import (
    Post,
    Like,
    Comment,
)

from schemas import (
    PostCreate,
    PostResponse,
    LikeCreate,
    LikeResponse,
    CommentCreate,
    CommentResponse,
)


# ============================================================
# COMMUNITY ROUTER
# ============================================================

router = APIRouter(
    prefix="/community",
    tags=["Community"],
)


# ============================================================
# CREATE POST
# ============================================================

@router.post(
    "/posts",
    response_model=PostResponse,
)
def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Validate post text
    # --------------------------------------------------------

    if not post_data.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Post cannot be empty.",
        )

    # --------------------------------------------------------
    # Create post
    # --------------------------------------------------------

    new_post = Post(
        user_id=post_data.user_id,
        email=post_data.email,
        text=post_data.text.strip(),
        image_url=post_data.image_url,
        likes=0,
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post


# ============================================================
# GET ALL POSTS
# ============================================================

@router.get(
    "/posts",
    response_model=list[PostResponse],
)
def get_posts(
    db: Session = Depends(get_db),
):
    posts = (
        db.query(Post)
        .order_by(Post.created_at.desc())
        .all()
    )

    return posts


# ============================================================
# GET USER POSTS
# ============================================================

@router.get(
    "/posts/user/{user_id}",
    response_model=list[PostResponse],
)
def get_user_posts(
    user_id: str,
    db: Session = Depends(get_db),
):
    posts = (
        db.query(Post)
        .filter(Post.user_id == user_id)
        .order_by(Post.created_at.desc())
        .all()
    )

    return posts


# ============================================================
# DELETE POST
# ============================================================

@router.delete(
    "/posts/{post_id}"
)
def delete_post(
    post_id: int,
    user_id: str,
    db: Session = Depends(get_db),
):
    post = (
        db.query(Post)
        .filter(Post.id == post_id)
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found.",
        )

    if post.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own post.",
        )

    db.delete(post)
    db.commit()

    return {
        "message": "Post deleted successfully.",
        "post_id": post_id,
    }


# ============================================================
# LIKE A POST
# ============================================================

@router.post(
    "/likes",
    response_model=LikeResponse,
)
def like_post(
    like_data: LikeCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check whether post exists
    # --------------------------------------------------------

    post = (
        db.query(Post)
        .filter(Post.id == like_data.post_id)
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found.",
        )

    # --------------------------------------------------------
    # Check whether user already liked the post
    # --------------------------------------------------------

    existing_like = (
        db.query(Like)
        .filter(
            Like.post_id == like_data.post_id,
            Like.user_id == like_data.user_id,
        )
        .first()
    )

    if existing_like:
        raise HTTPException(
            status_code=400,
            detail="You already liked this post.",
        )

    # --------------------------------------------------------
    # Create like
    # --------------------------------------------------------

    new_like = Like(
        post_id=like_data.post_id,
        user_id=like_data.user_id,
    )

    db.add(new_like)

    # --------------------------------------------------------
    # Increase like counter
    # --------------------------------------------------------

    post.likes = (post.likes or 0) + 1

    db.commit()
    db.refresh(new_like)

    return new_like


# ============================================================
# UNLIKE A POST
# ============================================================

@router.delete(
    "/likes/{post_id}"
)
def unlike_post(
    post_id: int,
    user_id: str,
    db: Session = Depends(get_db),
):
    like = (
        db.query(Like)
        .filter(
            Like.post_id == post_id,
            Like.user_id == user_id,
        )
        .first()
    )

    if not like:
        raise HTTPException(
            status_code=404,
            detail="Like not found.",
        )

    post = (
        db.query(Post)
        .filter(Post.id == post_id)
        .first()
    )

    if post and post.likes > 0:
        post.likes -= 1

    db.delete(like)
    db.commit()

    return {
        "message": "Post unliked successfully.",
        "post_id": post_id,
    }


# ============================================================
# CHECK WHETHER USER LIKED A POST
# ============================================================

@router.get(
    "/likes/check/{post_id}/{user_id}"
)
def check_like(
    post_id: int,
    user_id: str,
    db: Session = Depends(get_db),
):
    like = (
        db.query(Like)
        .filter(
            Like.post_id == post_id,
            Like.user_id == user_id,
        )
        .first()
    )

    return {
        "post_id": post_id,
        "user_id": user_id,
        "liked": like is not None,
    }


# ============================================================
# ADD COMMENT
# ============================================================

@router.post(
    "/comments",
    response_model=CommentResponse,
)
def add_comment(
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check post
    # --------------------------------------------------------

    post = (
        db.query(Post)
        .filter(Post.id == comment_data.post_id)
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found.",
        )

    # --------------------------------------------------------
    # Validate comment
    # --------------------------------------------------------

    if not comment_data.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Comment cannot be empty.",
        )

    # --------------------------------------------------------
    # Create comment
    # --------------------------------------------------------

    new_comment = Comment(
        post_id=comment_data.post_id,
        user_id=comment_data.user_id,
        email=comment_data.email,
        text=comment_data.text.strip(),
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return new_comment


# ============================================================
# GET COMMENTS FOR A POST
# ============================================================

@router.get(
    "/comments/{post_id}",
    response_model=list[CommentResponse],
)
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
):
    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

    return comments


# ============================================================
# DELETE COMMENT
# ============================================================

@router.delete(
    "/comments/{comment_id}"
)
def delete_comment(
    comment_id: int,
    user_id: str,
    db: Session = Depends(get_db),
):
    comment = (
        db.query(Comment)
        .filter(Comment.id == comment_id)
        .first()
    )

    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found.",
        )

    if comment.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own comment.",
        )

    db.delete(comment)
    db.commit()

    return {
        "message": "Comment deleted successfully.",
        "comment_id": comment_id,
    }