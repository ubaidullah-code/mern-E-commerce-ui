import { configureStore } from "@reduxjs/toolkit";
import addressReducer from "./addressSlice/Address-Slice";
import forgetReducer from "./ForgetSlice/Forget-Slice";

export const store = configureStore({
  reducer: {
    address: addressReducer, // ✅ use key without quotes, and consistent naming
    forget : forgetReducer
  },
});
