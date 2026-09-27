import { API_BASE_URL } from "./api";

async function testAPI() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/`
    );

    const data = await response.json();

    console.log(
      "FastAPI connection successful:",
      data
    );

  } catch (error) {
    console.error(
      "FastAPI connection failed:",
      error
    );
  }
}

testAPI();