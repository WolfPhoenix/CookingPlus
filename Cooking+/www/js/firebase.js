import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";

export class Firebase {
    firebaseConfig;
    app;
  constructor() {
    this.firebaseConfig = {
      apiKey: "AIzaSyCJ_GQNP-s9i-ZOmzO5mJG1BOlT7xj-Jq0",
      authDomain: "cooking-plus.firebaseapp.com",
      projectId: "cooking-plus",
      storageBucket: "cooking-plus.appspot.com",
      messagingSenderId: "530944956393",
      appId: "1:530944956393:web:1c9d4ee25fa5f46baddd78"
    };

    // Initialize Firebase
    this.app = initializeApp(this.firebaseConfig);
  }

  getApp() {
    return this.app;
  }
}