import api from "@/config/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: "",
  otp: "",
  password: "",
  loading: false,
  error: null,
  successMessage: "",
  otpSent: false,      // Step 1 complete flag
  isOtpVerified: false // Step 2 complete flag
};

// STEP 1: Send OTP
export const sendOtp = createAsyncThunk(
  "forget/sendOtp",
  async (formData, { rejectWithValue }) => {
    if (!formData.email) {
      return rejectWithValue("Email is required");
    }
    try {
      const { data } = await api.post("/api/forget/verify-email", formData);
      return { ...data, email: formData.email };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// STEP 2: Verify OTP
export const verifyOtp = createAsyncThunk(
  "forget/verifyOtp",
  async (formData, { rejectWithValue }) => {
    if (!formData.otp || formData.otp.length !== 5) {
      return rejectWithValue("OTP must be 5 digits");
    }
    try {
      const { data } = await api.post("/api/forget/verify-otp", {
        email: formData.email, // ✅ always send email to backend
        otp: formData.otp
      });

      // ✅ Always carry email forward even if backend doesn't return it
      return {
        ...data,
        email: formData.email
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// STEP 3: Update Password
export const updatePassword = createAsyncThunk(
  "forget/updatePassword",
  async (formData, { rejectWithValue }) => {
    if (!formData.password || formData.password.length < 5) {
      return rejectWithValue("Password must be at least 5 characters");
    }

    try {
      const { data } = await api.post("/api/forget/update-password", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const forgetSlice = createSlice({
  name: "forget",
  initialState,
  reducers: {
    setEmail: (state, action) => { state.email = action.payload; },
    setOtp: (state, action) => { state.otp = action.payload; },
    setPassword: (state, action) => { state.password = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    resetForgetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // SEND OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
        // state.otpSent = true; // Move to Step 2
      })
     .addCase(sendOtp.fulfilled, (state, action) => {

  state.loading = false;
  state.successMessage = action.payload.message;
  state.email = action.payload.email;
  state.otpSent = true; // Move to Step 2
})  
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // VERIFY OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
  state.loading = false;
  state.successMessage = action.payload.message;
  // ✅ Keep the old email if backend doesn't send one
  state.email = action.payload.email || state.email;
  state.isOtpVerified = true; // Move to Step 3
})
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE PASSWORD
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        return initialState; // Reset flow after success
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setEmail, setOtp, setPassword, setError, resetForgetState } = forgetSlice.actions;
export default forgetSlice.reducer;
