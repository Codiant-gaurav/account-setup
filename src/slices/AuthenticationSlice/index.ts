import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface AuthenticationState {
  userData: UserData | undefined;
}

const initialState: AuthenticationState = {
  userData: undefined,
};

export const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
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
