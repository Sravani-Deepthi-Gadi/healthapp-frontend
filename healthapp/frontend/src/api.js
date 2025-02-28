import axios from "axios";

// Replace with your actual Render backend URL
const API_BASE_URL = "https://flask-s8i3.onrender.com";

export const registerUser = async (userData) => {
    return await axios.post(`${API_BASE_URL}/user`, userData);
};

export const fetchUsers = async () => {
    return await axios.get(`${API_BASE_URL}/users`);
};
