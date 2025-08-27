import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
  _id: "",
  userId: "",
  createdAt: "",
  updatedAt: "",
};

const addressSlice = createSlice({
  name: "address",
  initialState, // ✅ fixed spelling
  reducers: {
    setAddress: (state, action) => {
    return {  ...action.payload };
    },
  },
});

export const { setAddress } = addressSlice.actions;
export default addressSlice.reducer;
