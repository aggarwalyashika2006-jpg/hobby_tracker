import { useState, useEffect } from "react";
import { suggestHobby } from "./ai";

import {
  auth,
} from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";


// ============================================================
// FASTAPI BACKEND
// ============================================================

const API_BASE_URL = "https://hobby-tracker-d8ol.onrender.com";


// ============================================================
// APP
// ============================================================

function App() {
  const [user, setUser] = useState(null);


  // ============================================================
  // AUTH STATE
  // ============================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);


  // ============================================================
  // LOAD USER DATA
  // ============================================================

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHobbies();
      fetchLogs();
      fetchPosts();
      fetchAllComments();
    }
  }, [user]);


  // ============================================================
  // AUTH
  // ============================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account created successfully!");
    } catch (error) {
      alert(error.message);
    }
  };


  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error) {
      alert(error.message);
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error.message);
    }
  };


  // ============================================================
  // PROFILE
  // ============================================================

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profile, setProfile] = useState(null);


  // ------------------------------------------------------------
  // FETCH PROFILE
  // ------------------------------------------------------------

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/profiles/user/${user.uid}`
      );

      if (response.ok) {
        const data = await response.json();

        setProfile(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setAvatar(data.avatar || "");
      }
    } catch (error) {
      console.log("Profile error:", error);
    }
  };


  // ------------------------------------------------------------
  // SAVE PROFILE
  // ------------------------------------------------------------

  const saveProfile = async () => {
    if (!user) return;

    try {
      const profileData = {
        user_id: user.uid,
        email: user.email,
        name: name,
        bio: bio,
        avatar: avatar,
      };


      // First check whether profile already exists
      const checkResponse = await fetch(
        `${API_BASE_URL}/profiles/user/${user.uid}`
      );


      // --------------------------------------------------------
      // UPDATE EXISTING PROFILE
      // --------------------------------------------------------

      if (checkResponse.ok) {
        const response = await fetch(
          `${API_BASE_URL}/profiles/user/${user.uid}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              email: user.email,
              name: name,
              bio: bio,
              avatar: avatar,
            }),
          }
        );


        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        }


        const data = await response.json();

        setProfile(data);

        alert("Profile updated successfully!");

        return;
      }


      // --------------------------------------------------------
      // CREATE NEW PROFILE
      // --------------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/profiles/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(profileData),
        }
      );


      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }


      const data = await response.json();

      setProfile(data);

      alert("Profile saved successfully!");

    } catch (error) {
      alert(
        "Profile error: " +
        error.message
      );
    }
  };


  // ============================================================
  // AI SUGGESTIONS
  // ============================================================

  const [text, setText] = useState("");
  const [suggestion, setSuggestion] = useState("");


  const handleAI = () => {
    if (!text.trim()) {
      setSuggestion(
        "Please enter something first."
      );

      return;
    }


    setSuggestion(
      suggestHobby(text)
    );
  };


  // ============================================================
  // HOBBIES
  // ============================================================

  const [hobby, setHobby] = useState("");
  const [hobbies, setHobbies] = useState([]);


  // ------------------------------------------------------------
  // ADD HOBBY
  // ------------------------------------------------------------

  const addHobby = async () => {
    if (!hobby.trim()) {
      alert("Please enter a hobby.");
      return;
    }


    try {
      const response = await fetch(
        `${API_BASE_URL}/hobbies/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: user.uid,
            name: hobby,
          }),
        }
      );


      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }


      setHobby("");

      await fetchHobbies();

      alert("Hobby added successfully!");

    } catch (error) {
      alert(
        "Hobby error: " +
        error.message
      );
    }
  };


  // ------------------------------------------------------------
  // FETCH HOBBIES
  // ------------------------------------------------------------

  const fetchHobbies = async () => {
    if (!user) return;


    try {
      const response = await fetch(
        `${API_BASE_URL}/hobbies/user/${user.uid}`
      );


      if (!response.ok) {
        throw new Error(
          "Could not load hobbies."
        );
      }


      const data = await response.json();

      setHobbies(data);

    } catch (error) {
      console.log(
        "Hobbies error:",
        error
      );
    }
  };


  // ============================================================
  // PRACTICE LOGS
  // ============================================================

  const [selectedHobby, setSelectedHobby] =
    useState("");

  const [minutes, setMinutes] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [logs, setLogs] =
    useState([]);

  const [streak, setStreak] =
    useState(0);

  const [totalMinutes, setTotalMinutes] =
    useState(0);

  const [weeklyMinutes, setWeeklyMinutes] =
    useState(0);


  // ------------------------------------------------------------
  // ADD PRACTICE LOG
  // ------------------------------------------------------------

  const addLog = async () => {

    if (
      !selectedHobby ||
      selectedHobby === "Select Hobby"
    ) {
      alert("Please select a hobby.");
      return;
    }


    if (
      !minutes ||
      Number(minutes) <= 0
    ) {
      alert(
        "Please enter practice minutes."
      );

      return;
    }


    try {

      const response = await fetch(
        `${API_BASE_URL}/logs/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: user.uid,
            hobby: selectedHobby,
            minutes: Number(minutes),
            notes: notes,
            practice_date:
              new Date()
                .toISOString()
                .split("T")[0],
          }),
        }
      );


      if (!response.ok) {
        const errorData =
          await response.text();

        throw new Error(errorData);
      }


      setMinutes("");
      setNotes("");
      setSelectedHobby("");


      await fetchLogs();


      alert(
        "Practice log added successfully!"
      );

    } catch (error) {

      alert(
        "Practice log error: " +
        error.message
      );
    }
  };


  // ------------------------------------------------------------
  // FETCH LOGS
  // ------------------------------------------------------------

  const fetchLogs = async () => {

    if (!user) return;


    try {

      const response = await fetch(
        `${API_BASE_URL}/logs/user/${user.uid}`
      );


      if (!response.ok) {
        throw new Error(
          "Could not load logs."
        );
      }


      const data =
        await response.json();


      const list = data.map(
        (log) => ({
          id: log.id,
          hobby: log.hobby,
          minutes: Number(
            log.minutes || 0
          ),
          notes: log.notes,
          date:
            log.practice_date,
        })
      );


      setLogs(list);


      // --------------------------------------------------------
      // TOTAL MINUTES
      // --------------------------------------------------------

      const total =
        list.reduce(
          (sum, log) =>
            sum +
            Number(
              log.minutes || 0
            ),
          0
        );


      setTotalMinutes(total);


      // --------------------------------------------------------
      // WEEKLY MINUTES
      // --------------------------------------------------------

      const today =
        new Date();

      const day =
        today.getDay();


      const weekStart =
        new Date(today);


      weekStart.setDate(
        today.getDate() - day
      );


      weekStart.setHours(
        0,
        0,
        0,
        0
      );


      const weeklyLogs =
        list.filter((log) => {

          const logDate =
            new Date(log.date);

          return (
            logDate >=
            weekStart
          );
        });


      const weeklyTotal =
        weeklyLogs.reduce(
          (sum, log) =>
            sum +
            Number(
              log.minutes || 0
            ),
          0
        );


      setWeeklyMinutes(
        weeklyTotal
      );


      // --------------------------------------------------------
      // STREAK
      // --------------------------------------------------------

      const uniqueDates = [
        ...new Set(
          list.map(
            (log) => log.date
          )
        ),
      ].sort(
        (a, b) =>
          new Date(b) -
          new Date(a)
      );


      let count = 0;


      const currentDate =
        new Date();


      currentDate.setHours(
        0,
        0,
        0,
        0
      );


      for (
        let i = 0;
        i < uniqueDates.length;
        i++
      ) {

        const logDate =
          new Date(
            uniqueDates[i]
          );


        logDate.setHours(
          0,
          0,
          0,
          0
        );


        const difference =
          (
            currentDate -
            logDate
          ) /
          (
            1000 *
            60 *
            60 *
            24
          );


        if (
          difference === count
        ) {
          count++;
        } else {
          break;
        }
      }


      setStreak(count);


      // --------------------------------------------------------
      // BADGES
      // --------------------------------------------------------

      const newBadges = [];


      if (count >= 7) {
        newBadges.push(
          "🔥 7 Day Streak"
        );
      }


      if (total >= 100) {
        newBadges.push(
          "💯 100 Minutes"
        );
      }


      if (total >= 500) {
        newBadges.push(
          "🏆 500 Minutes"
        );
      }


      if (total >= 1000) {
        newBadges.push(
          "🌟 1000 Minutes"
        );
      }


      if (list.length >= 10) {
        newBadges.push(
          "📚 10 Practice Sessions"
        );
      }


      setBadges(
        newBadges
      );

    } catch (error) {

      console.log(
        "Logs error:",
        error
      );
    }
  };


  // ============================================================
  // BADGES
  // ============================================================

  const [badges, setBadges] =
    useState([]);


  // ============================================================
  // COMMUNITY POSTS
  // ============================================================

  const [postText, setPostText] =
    useState("");

  const [imageURL, setImageURL] =
    useState("");

  const [posts, setPosts] =
    useState([]);


  // ============================================================
  // COMMENTS
  // ============================================================

  const [comments, setComments] =
    useState({});


  // ============================================================
  // LIKES
  // ============================================================

  const [likedPosts, setLikedPosts] =
    useState({});


  // ============================================================
  // CREATE POST
  // ============================================================

  const addPost = async () => {

    if (!postText.trim()) {
      alert(
        "Please write something before posting."
      );

      return;
    }


    try {

      const response =
        await fetch(
          `${API_BASE_URL}/community/posts`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              user_id:
                user.uid,

              email:
                user.email,

              text:
                postText,

              image_url:
                imageURL,
            }),
          }
        );


      if (!response.ok) {

        const errorData =
          await response.text();

        throw new Error(
          errorData
        );
      }


      setPostText("");
      setImageURL("");


      await fetchPosts();


      alert(
        "Post created successfully!"
      );

    } catch (error) {

      alert(
        "Post error: " +
        error.message
      );
    }
  };


  // ============================================================
  // FETCH POSTS
  // ============================================================

  const fetchPosts = async () => {

    try {

      const response =
        await fetch(
          `${API_BASE_URL}/community/posts`
        );


      if (!response.ok) {
        throw new Error(
          "Could not load posts."
        );
      }


      const data =
        await response.json();


      setPosts(data);


      // --------------------------------------------------------
      // CHECK LIKES FOR CURRENT USER
      // --------------------------------------------------------

      if (user) {

        const likeStatus = {};


        for (const post of data) {

          try {

            const likeResponse =
              await fetch(
                `${API_BASE_URL}/community/likes/check/${post.id}/${user.uid}`
              );


            if (
              likeResponse.ok
            ) {

              const likeData =
                await likeResponse.json();


              likeStatus[post.id] =
                Boolean(
                  likeData
                );
            }

          } catch (error) {

            console.log(
              "Like check error:",
              error
            );
          }
        }


        setLikedPosts(
          likeStatus
        );
      }


      // --------------------------------------------------------
      // FETCH COMMENTS
      // --------------------------------------------------------

      for (const post of data) {

        await fetchComments(
          post.id
        );
      }

    } catch (error) {

      console.log(
        "Posts error:",
        error
      );
    }
  };


  // ============================================================
  // LIKE POST
  // ============================================================

  const likePost = async (post) => {

    try {

      // --------------------------------------------------------
      // ALREADY LIKED
      // --------------------------------------------------------

      if (
        likedPosts[post.id]
      ) {

        // Unlike
        const response =
          await fetch(
            `${API_BASE_URL}/community/likes/${post.id}`,
            {
              method: "DELETE",
            }
          );


        if (!response.ok) {

          const errorData =
            await response.text();

          throw new Error(
            errorData
          );
        }


        setLikedPosts(
          (previous) => ({
            ...previous,
            [post.id]:
              false,
          })
        );


        await fetchPosts();

        return;
      }


      // --------------------------------------------------------
      // LIKE
      // --------------------------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/community/likes`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              user_id:
                user.uid,

              post_id:
                post.id,
            }),
          }
        );


      if (!response.ok) {

        const errorData =
          await response.text();

        throw new Error(
          errorData
        );
      }


      setLikedPosts(
        (previous) => ({
          ...previous,
          [post.id]:
            true,
        })
      );


      await fetchPosts();

    } catch (error) {

      alert(
        "Like error: " +
        error.message
      );
    }
  };


  // ============================================================
  // ADD COMMENT
  // ============================================================

  const [commentInputs, setCommentInputs] =
    useState({});


  const addComment = async (
    postId
  ) => {

    const text =
      commentInputs[postId] ||
      "";


    if (!text.trim()) {

      alert(
        "Please write a comment."
      );

      return;
    }


    try {

      const response =
        await fetch(
          `${API_BASE_URL}/community/comments`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              user_id:
                user.uid,

              email:
                user.email,

              post_id:
                postId,

              text:
                text,
            }),
          }
        );


      if (!response.ok) {

        const errorData =
          await response.text();

        throw new Error(
          errorData
        );
      }


      setCommentInputs(
        (previous) => ({
          ...previous,
          [postId]:
            "",
        })
      );


      await fetchComments(
        postId
      );


      alert(
        "Comment added!"
      );

    } catch (error) {

      alert(
        "Comment error: " +
        error.message
      );
    }
  };


  // ============================================================
  // FETCH COMMENTS FOR ONE POST
  // ============================================================

  const fetchComments = async (
    postId
  ) => {

    try {

      const response =
        await fetch(
          `${API_BASE_URL}/community/comments/${postId}`
        );


      if (!response.ok) {
        return;
      }


      const data =
        await response.json();


      setComments(
        (previous) => ({
          ...previous,
          [postId]:
            data,
        })
      );

    } catch (error) {

      console.log(
        "Comments error:",
        error
      );
    }
  };


  // ============================================================
  // FETCH ALL COMMENTS
  // ============================================================

  const fetchAllComments =
    async () => {

      if (!user) return;


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/community/posts`
          );


        if (!response.ok) {
          return;
        }


        const data =
          await response.json();


        for (
          const post of data
        ) {

          await fetchComments(
            post.id
          );
        }

      } catch (error) {

        console.log(
          "All comments error:",
          error
        );
      }
    };


  // ============================================================
  // LEADERBOARD
  // ============================================================

  const [leaderboard, setLeaderboard] =
    useState([]);


  const generateLeaderboard =
    async () => {

      try {

        const response =
          await fetch(
            `${API_BASE_URL}/logs/user/${user.uid}`
          );


        if (!response.ok) {

          throw new Error(
            "Could not load leaderboard data."
          );
        }


        const data =
          await response.json();


        const total =
          data.reduce(
            (sum, log) =>
              sum +
              Number(
                log.minutes || 0
              ),
            0
          );


        setLeaderboard([
          {
            uid:
              user.uid,

            minutes:
              total,
          },
        ]);

      } catch (error) {

        alert(
          "Leaderboard error: " +
          error.message
        );
      }
    };


  // ============================================================
  // LOGIN PAGE
  // ============================================================

  if (!user) {

    return (
      <div
        style={{
          maxWidth:
            "500px",

          margin:
            "60px auto",

          padding:
            "30px",

          textAlign:
            "center",

          fontFamily:
            "Arial",
        }}
      >

        <h1>
          🎯 Hobby Tracker
        </h1>


        <h2>
          Login
        </h2>


        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            display:
              "block",

            width:
              "100%",

            padding:
              "10px",

            marginBottom:
              "10px",

            boxSizing:
              "border-box",
          }}
        />


        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            display:
              "block",

            width:
              "100%",

            padding:
              "10px",

            marginBottom:
              "15px",

            boxSizing:
              "border-box",
          }}
        />


        <button
          onClick={handleLogin}
          style={{
            padding:
              "10px 20px",

            marginRight:
              "10px",

            cursor:
              "pointer",
          }}
        >
          Login
        </button>


        <button
          onClick={handleSignup}
          style={{
            padding:
              "10px 20px",

            cursor:
              "pointer",
          }}
        >
          Sign Up
        </button>

      </div>
    );
  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (

    <div
      style={{
        maxWidth:
          "1000px",

        margin:
          "0 auto",

        padding:
          "30px",

        fontFamily:
          "Arial",
      }}
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",
        }}
      >

        <h1>
          🎯 Hobby Tracker Dashboard
        </h1>


        <button
          onClick={handleLogout}
          style={{
            padding:
              "10px 15px",

            cursor:
              "pointer",
          }}
        >
          Logout 🚪
        </button>

      </div>


      <hr />


      {/* ======================================================
          PROFILE
      ====================================================== */}

      <section>

        <h2>
          👤 My Profile
        </h2>


        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          style={{
            display:
              "block",

            width:
              "100%",

            padding:
              "10px",

            marginBottom:
              "10px",

            boxSizing:
              "border-box",
          }}
        />


        <input
          type="text"
          placeholder="Bio"
          value={bio}
          onChange={(e) =>
            setBio(
              e.target.value
            )
          }
          style={{
            display:
              "block",

            width:
              "100%",

            padding:
              "10px",

            marginBottom:
              "10px",

            boxSizing:
              "border-box",
          }}
        />


        <input
          type="text"
          placeholder="Avatar Image URL"
          value={avatar}
          onChange={(e) =>
            setAvatar(
              e.target.value
            )
          }
          style={{
            display:
              "block",

            width:
              "100%",

            padding:
              "10px",

            marginBottom:
              "10px",

            boxSizing:
              "border-box",
          }}
        />


        <button
          onClick={saveProfile}
          style={{
            padding:
              "10px 15px",

            cursor:
              "pointer",
          }}
        >
          Save Profile
        </button>


        {profile && (

          <div
            style={{
              marginTop:
                "20px",

              padding:
                "15px",

              border:
                "1px solid #ccc",

              borderRadius:
                "10px",
            }}
          >

            {profile.avatar && (

              <img
                src={
                  profile.avatar
                }
                alt="Profile"
                width="100"
                height="100"
                style={{
                  objectFit:
                    "cover",

                  borderRadius:
                    "50%",
                }}
              />

            )}


            <h3>
              {profile.name}
            </h3>


            <p>
              {profile.bio}
            </p>


            <p>
              <b>
                Email:
              </b>{" "}
              {user.email}
            </p>

          </div>

        )}

      </section>


      <hr />


      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <section>

        <h2>
          📊 My Progress
        </h2>


        <h3>
          ⏱️ Total Minutes:
          {" "}
          {totalMinutes}
        </h3>


        <h3>
          📅 Weekly Minutes:
          {" "}
          {weeklyMinutes}
        </h3>


        <h3>
          🔥 Streak:
          {" "}
          {streak}
          {" "}
          days
        </h3>


        <h3>
          🏆 Badges
        </h3>


        {badges.length === 0 ? (

          <p>
            Keep practicing to
            unlock your first badge!
          </p>

        ) : (

          badges.map(
            (badge, index) => (

              <p key={index}>
                {badge}
              </p>

            )
          )

        )}

      </section>


      <hr />


      {/* ======================================================
          HOBBIES
      ====================================================== */}

      <section>

        <h2>
          🎨 My Hobbies
        </h2>


        <input
          type="text"
          placeholder="Enter a hobby"
          value={hobby}
          onChange={(e) =>
            setHobby(
              e.target.value
            )
          }
          style={{
            padding:
              "10px",

            marginRight:
              "10px",
          }}
        />


        <button
          onClick={addHobby}
          style={{
            padding:
              "10px 15px",

            cursor:
              "pointer",
          }}
        >
          Add Hobby
        </button>


        <ul>

          {hobbies.map(
            (h) => (

              <li key={h.id}>
                {h.name}
              </li>

            )
          )}

        </ul>

      </section>


      <hr />


      {/* ======================================================
          PRACTICE LOG
      ====================================================== */}

      <section>

        <h2>
          📝 Log Practice
        </h2>


        <select
          value={
            selectedHobby
          }
          onChange={(e) =>
            setSelectedHobby(
              e.target.value
            )
          }
          style={{
            padding:
              "10px",

            marginRight:
              "10px",
          }}
        >

          <option value="">
            Select Hobby
          </option>


          {hobbies.map(
            (h) => (

              <option
                key={h.id}
                value={h.name}
              >
                {h.name}
              </option>

            )
          )}

        </select>


        <input
          type="number"
          placeholder="Minutes"
          value={minutes}
          onChange={(e) =>
            setMinutes(
              e.target.value
            )
          }
          style={{
            padding:
              "10px",

            marginRight:
              "10px",
          }}
        />


        <input
          type="text"
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
          style={{
            padding:
              "10px",

            marginRight:
              "10px",
          }}
        />


        <button
          onClick={addLog}
          style={{
            padding:
              "10px 15px",

            cursor:
              "pointer",
          }}
        >
          Add Log
        </button>


        <h3>
          📚 My Practice History
        </h3>


        {logs.length === 0 ? (

          <p>
            No practice logs yet.
          </p>

        ) : (

          logs
            .slice()
            .reverse()
            .map(
              (log) => (

                <div
                  key={log.id}
                  style={{
                    border:
                      "1px solid #ccc",

                    padding:
                      "12px",

                    marginBottom:
                      "10px",

                    borderRadius:
                      "8px",
                  }}
                >

                  <b>
                    {log.hobby}
                  </b>


                  <p>
                    ⏱️{" "}
                    {log.minutes}
                    {" "}
                    minutes
                  </p>


                  <p>
                    📅{" "}
                    {log.date}
                  </p>


                  {log.notes && (

                    <p>
                      📝{" "}
                      {log.notes}
                    </p>

                  )}

                </div>

              )
            )

        )}

      </section>


      <hr />


      {/* ======================================================
          COMMUNITY
      ====================================================== */}

      <section>

        <h2>
          🌎 Community Feed
        </h2>


        {/* ----------------------------------------------------
            CREATE POST
        ---------------------------------------------------- */}

        <input
          type="text"
          placeholder="Write something..."
          value={postText}
          onChange={(e) =>
            setPostText(
              e.target.value
            )
          }
          style={{
            display:
              "block",

            width:
              "100%",

            padding:
              "10px",

            marginBottom:
              "10px",

            boxSizing:
              "border-box",
          }}
        />


        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageURL}
          onChange={(e) =>
            setImageURL(
              e.target.value
            )
          }
          style={{
            display:
              "block",

            width:
              "100%",

            padding:
              "10px",

            marginBottom:
              "10px",

            boxSizing:
              "border-box",
          }}
        />


        <button
          onClick={addPost}
          style={{
            padding:
              "10px 20px",

            cursor:
              "pointer",
          }}
        >
          Post
        </button>


        {/* ----------------------------------------------------
            POSTS
        ---------------------------------------------------- */}

        <div
          style={{
            marginTop:
              "20px",
          }}
        >

          {posts.length === 0 ? (

            <p>
              No posts yet.
              Be the first to share!
            </p>

          ) : (

            posts.map(
              (post) => (

                <div
                  key={post.id}
                  style={{
                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "10px",

                    padding:
                      "15px",

                    marginBottom:
                      "20px",
                  }}
                >

                  {/* POST USER */}

                  <p>
                    <b>
                      👤{" "}
                      {post.email}
                    </b>
                  </p>


                  {/* POST TEXT */}

                  <p>
                    {post.text}
                  </p>


                  {/* POST IMAGE */}

                  {post.image_url && (

                    <img
                      src={
                        post.image_url
                      }
                      alt="Post"
                      style={{
                        maxWidth:
                          "100%",

                        width:
                          "300px",

                        display:
                          "block",

                        marginBottom:
                          "10px",
                      }}
                    />

                  )}


                  {/* LIKE COUNT */}

                  <p>
                    ❤️{" "}
                    {post.likes || 0}
                    {" "}
                    Likes
                  </p>


                  {/* LIKE BUTTON */}

                  <button
                    onClick={() =>
                      likePost(
                        post
                      )
                    }
                    style={{
                      padding:
                        "8px 15px",

                      marginRight:
                        "10px",

                      cursor:
                        "pointer",
                    }}
                  >

                    {likedPosts[
                      post.id
                    ]
                      ? "💔 Unlike"
                      : "❤️ Like"}

                  </button>


                  {/* ------------------------------------------------
                      COMMENT INPUT
                  ------------------------------------------------ */}

                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >

                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={
                        commentInputs[
                          post.id
                        ] || ""
                      }
                      onChange={(e) =>
                        setCommentInputs(
                          (
                            previous
                          ) => ({
                            ...previous,

                            [post.id]:
                              e.target
                                .value,
                          })
                        )
                      }
                      style={{
                        padding:
                          "8px",

                        marginRight:
                          "10px",

                        width:
                          "60%",
                      }}
                    />


                    <button
                      onClick={() =>
                        addComment(
                          post.id
                        )
                      }
                      style={{
                        padding:
                          "8px 15px",

                        cursor:
                          "pointer",
                      }}
                    >
                      Comment
                    </button>

                  </div>


                  {/* ------------------------------------------------
                      COMMENTS
                  ------------------------------------------------ */}

                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >

                    <h4>
                      💬 Comments
                    </h4>


                    {!comments[
                      post.id
                    ] ||
                    comments[
                      post.id
                    ].length === 0 ? (

                      <p>
                        No comments yet.
                      </p>

                    ) : (

                      comments[
                        post.id
                      ].map(
                        (comment) => (

                          <p
                            key={
                              comment.id
                            }
                          >

                            <b>
                              {
                                comment.email
                              }
                              :
                            </b>{" "}

                            {
                              comment.text
                            }

                          </p>

                        )
                      )

                    )}

                  </div>

                </div>

              )
            )

          )}

        </div>

      </section>


      <hr />


      {/* ======================================================
          LEADERBOARD
      ====================================================== */}

      <section>

        <h2>
          🏆 Practice Leaderboard
        </h2>


        <button
          onClick={
            generateLeaderboard
          }
          style={{
            padding:
              "10px 15px",

            cursor:
              "pointer",
          }}
        >
          Generate Leaderboard
        </button>


        {leaderboard.length === 0 ? (

          <p>
            Click the button to
            calculate the leaderboard.
          </p>

        ) : (

          <ol>

            {leaderboard.map(
              (
                entry,
                index
              ) => (

                <li
                  key={
                    entry.uid
                  }
                >

                  <b>

                    {index === 0
                      ? "🥇 "
                      : index === 1
                      ? "🥈 "
                      : index === 2
                      ? "🥉 "
                      : ""}

                    User

                  </b>

                  {" — "}

                  {
                    entry.minutes
                  }

                  {" "}
                  minutes

                </li>

              )
            )}

          </ol>

        )}

      </section>


      <hr />


      {/* ======================================================
          AI SUGGESTION
      ====================================================== */}

      <section>

        <h2>
          🤖 AI Hobby Suggestion
        </h2>


        <input
          type="text"
          placeholder="Tell AI about your interests..."
          value={text}
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
          style={{
            width:
              "100%",

            padding:
              "10px",

            marginBottom:
              "10px",

            boxSizing:
              "border-box",
          }}
        />


        <button
          onClick={
            handleAI
          }
          style={{
            padding:
              "10px 15px",

            cursor:
              "pointer",
          }}
        >
          Get AI Suggestion
        </button>


        {suggestion && (

          <p
            style={{
              marginTop:
                "15px",

              fontWeight:
                "bold",
            }}
          >

            💡{" "}
            {suggestion}

          </p>

        )}

      </section>

    </div>
  );
}


export default App;
