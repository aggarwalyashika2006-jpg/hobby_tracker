export function suggestHobby(text) {
  text = text.toLowerCase();

  if (text.includes("music") || text.includes("guitar")) {
    return "Try learning a new song 🎸";
  }

  if (text.includes("coding")) {
    return "Build a small project today 💻";
  }

  if (text.includes("fitness") || text.includes("run")) {
    return "Increase your workout time by 5 mins 🏃";
  }

  return "Keep practicing daily, consistency is key 🔥";
}