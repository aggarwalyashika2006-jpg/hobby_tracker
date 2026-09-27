// ============================================================
// HOBBY TRACKER API CONNECTION
// ============================================================
//
// This file contains all communication between our React
// frontend and our FastAPI backend.
//
// FastAPI currently runs locally at:
// http://127.0.0.1:8000
//
// Later, when we deploy FastAPI on Render, we will change
// the API URL to the Render backend URL.
//
// ============================================================


// ============================================================
// BACKEND URL
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================================
// HELPER FUNCTION
// ============================================================
//
// This function sends requests to FastAPI and handles
// errors in one place.
// ============================================================

async function apiRequest(
  endpoint,
  options = {}
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },

        ...options,
      }
    );

    // --------------------------------------------------------
    // Convert response into JSON
    // --------------------------------------------------------

    const data = await response.json();

    // --------------------------------------------------------
    // FastAPI returned an error
    // --------------------------------------------------------

    if (!response.ok) {
      throw new Error(
        data.detail || "Something went wrong."
      );
    }

    return data;

  } catch (error) {

    console.error(
      "API Error:",
      error
    );

    throw error;
  }
}


// ============================================================
// HOBBY APIs
// ============================================================

export async function addHobby(
  userId,
  hobbyName
) {
  return apiRequest(
    "/hobbies/",
    {
      method: "POST",

      body: JSON.stringify({
        user_id: userId,
        name: hobbyName,
      }),
    }
  );
}


export async function getHobbies(
  userId
) {
  return apiRequest(
    `/hobbies/user/${userId}`
  );
}


export async function deleteHobby(
  hobbyId
) {
  return apiRequest(
    `/hobbies/${hobbyId}`,
    {
      method: "DELETE",
    }
  );
}


// ============================================================
// PRACTICE LOG APIs
// ============================================================

export async function addPracticeLog(
  userId,
  hobby,
  minutes,
  notes,
  practiceDate
) {
  return apiRequest(
    "/logs/",
    {
      method: "POST",

      body: JSON.stringify({
        user_id: userId,
        hobby: hobby,
        minutes: Number(minutes),
        notes: notes,
        practice_date: practiceDate,
      }),
    }
  );
}


export async function getPracticeLogs(
  userId
) {
  return apiRequest(
    `/logs/user/${userId}`
  );
}


export async function getTotalMinutes(
  userId
) {
  return apiRequest(
    `/logs/user/${userId}/total-minutes`
  );
}


export async function getWeeklyMinutes(
  userId
) {
  return apiRequest(
    `/logs/user/${userId}/weekly-minutes`
  );
}


export async function getStreak(
  userId
) {
  return apiRequest(
    `/logs/user/${userId}/streak`
  );
}


// ============================================================
// PROFILE APIs
// ============================================================

export async function createProfile(
  profileData
) {
  return apiRequest(
    "/profiles/",
    {
      method: "POST",

      body: JSON.stringify(
        profileData
      ),
    }
  );
}


export async function getProfile(
  userId
) {
  return apiRequest(
    `/profiles/user/${userId}`
  );
}


export async function updateProfile(
  userId,
  profileData
) {
  return apiRequest(
    `/profiles/user/${userId}`,
    {
      method: "PUT",

      body: JSON.stringify(
        profileData
      ),
    }
  );
}


// ============================================================
// COMMUNITY — POSTS
// ============================================================

export async function createPost(
  userId,
  email,
  text,
  imageUrl
) {
  return apiRequest(
    "/community/posts",
    {
      method: "POST",

      body: JSON.stringify({
        user_id: userId,
        email: email,
        text: text,
        image_url: imageUrl || null,
      }),
    }
  );
}


export async function getPosts() {
  return apiRequest(
    "/community/posts"
  );
}


export async function getUserPosts(
  userId
) {
  return apiRequest(
    `/community/posts/user/${userId}`
  );
}


export async function deletePost(
  postId,
  userId
) {
  return apiRequest(
    `/community/posts/${postId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    }
  );
}


// ============================================================
// COMMUNITY — LIKES
// ============================================================

export async function likePost(
  userId,
  postId
) {
  return apiRequest(
    "/community/likes",
    {
      method: "POST",

      body: JSON.stringify({
        user_id: userId,
        post_id: postId,
      }),
    }
  );
}


export async function unlikePost(
  userId,
  postId
) {
  return apiRequest(
    `/community/likes/${postId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    }
  );
}


export async function checkLike(
  userId,
  postId
) {
  return apiRequest(
    `/community/likes/check/${postId}/${userId}`
  );
}


// ============================================================
// COMMUNITY — COMMENTS
// ============================================================

export async function addComment(
  userId,
  email,
  postId,
  text
) {
  return apiRequest(
    "/community/comments",
    {
      method: "POST",

      body: JSON.stringify({
        user_id: userId,
        email: email,
        post_id: postId,
        text: text,
      }),
    }
  );
}


export async function getComments(
  postId
) {
  return apiRequest(
    `/community/comments/${postId}`
  );
}


export async function deleteComment(
  commentId,
  userId
) {
  return apiRequest(
    `/community/comments/${commentId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    }
  );
}


// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboard(
  userId
) {
  return apiRequest(
    `/dashboard/${userId}`
  );
}


// ============================================================
// EXPORT API BASE URL
// ============================================================

export {
  API_BASE_URL
};