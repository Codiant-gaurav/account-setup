# Key Development Prompts

This document contains the key prompts and requirements used during the development of this project.

---

## 1. SignUp Screen Form Implementation

In SignUp screen add below TextInput:
1. Email Address
2. Password
3. Confirm Password
4. First Name
5. Last Name
6. Phone Number

Also add one button to submit.

Show Error text below each TextInput fields in red color conditionally. This error text will be handled using formik and disabled submit button until valid using formik.

---

## 2. SplashScreen Implementation

Create a screen names "SplashScreen". Set it as initial route in RootStack file. In Splash screen, Check whether the user is logged in or not using data from Keychain. If not logged in then navigate to Login screen. If Logged in then populate the redux user data and navigate to Home screen.

---

## 3. Data Encryption on SignUp

When storing user data on SignUp encrypt it by using yarn add react-native-crypto-js. Do this before storing using Keychain. On SplashScreen decrypt the data then populate the redux state.

---

## 4. Login Attempt Lockout Feature

On Login screen, after 5 failed login attempts, show error that you have been locked out. Don't store this is keychain. implement this feature using usestate of Login screen.

---

## 5. Credential Storage and Validation

On SignUp Screen, store credentials like email and password in keychain using react-native-crypto-js and make a list of it. Multiple credentials can be store in array or list.

On Login screen when user enter email and password, and after login button press validate it with the credentials we stored in Sign Up, then navigate to Home Screen.

---

## 6. Keyboard Navigation and Auto-focus

On Sign Up screen, when I press keyboard submit button, autofocus on next FormTextinput filed. and on last FormTextInput click function of submit should trigger.

