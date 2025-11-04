import { createSlice } from '@reduxjs/toolkit';

export interface AuthenticationState {
  userData: object | undefined;
}

const initialState: AuthenticationState = {
  userData: undefined,
};

export const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    clearUserData: state => {
      state.userData = undefined;
    },
  },
});

export const { setUserData, clearUserData } = authenticationSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.authentication.value

export default authenticationSlice.reducer;
