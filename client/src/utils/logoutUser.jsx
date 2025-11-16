import API from "../api/axiosInstance";

export const logoutUser = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    await API.post("/auth/logout", { refreshToken });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    window.location.href = "/login";
  } catch (err) {
    console.log("Logout Error:", err);
    window.location.href = "/login";
  }
};
