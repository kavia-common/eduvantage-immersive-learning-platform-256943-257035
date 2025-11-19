# Role metadata pattern for sign-up with Supabase

To associate a user role ("student" or "instructor") in Supabase authentication, include the role in user_metadata at sign-up:

```js
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { role } // 'role' is 'student' or 'instructor'
  }
});
// The role is then available in session.user.user_metadata.role
```

On login, AuthProvider extracts and persists this information as `currentUserRole` in context and localStorage so the rest of the app can access the user's role after authentication.

If the flow is sign-in only, the user must select a role (default Student) which is set in context/localStorage on login for app-wide access.

**Never store secrets in client code.**
