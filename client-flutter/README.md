# Flutter student client

Flutter 3.35+ / Dart 3 project for the student side of the NHOMXX part-time jobs platform.

```text
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

`API_BASE_URL` is the backend base URL without a trailing slash. Use your computer's LAN IP for a physical device and the deployed HTTPS URL for release builds. The Android manifest requests internet and location access for API calls and check-in/check-out.
