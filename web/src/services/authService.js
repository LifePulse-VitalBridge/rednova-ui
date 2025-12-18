import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: { 'Content-Type': 'application/json' }
});

export const syncUserToBackend = async (firebaseUser) => {
  try {
    // Try to get a name. If email login, default to "User".
    const userName = firebaseUser.displayName || "User";

    const response = await api.post('/auth/sync', {
      uid: firebaseUser.uid,
      name: userName,
      email: firebaseUser.email
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Backend Sync Failed";
  }
};

export const updateUserPhone = async (uid, phone) => {
  try {
    const response = await api.post('/auth/update-phone', 
      {
        userId: uid,
        phone: phone
      });
      return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Phone Update Failed";
  }
}

export const fetchUserProfile = async (email) => {
  try {
    const response = await api.get(`/auth/${email}`);
    return response.data;
  } catch (error) {
    console.error("Fetch User Profile Failed:", error);
    throw error.response?.data?.message || "Fetch User Profile Failed";
  }
};

export const saveUserProfile = async (userData) => {
  try {
    const response = await api.put('/auth/update', userData);
    return response.data;
  } catch (error) {
    console.error("Save User Profile Failed:", error);
    throw error.response?.data?.message || "Failed to Save User Profile";
  }
};

export const uploadUserAvatar = async (file, email) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('email', email);

    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Let axios set the correct headers for multipart
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload User Avatar Failed:", error);
    throw error.response?.data?.message || "Failed to Upload User Avatar";
  }
}