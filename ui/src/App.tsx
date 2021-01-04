import React, {ChangeEvent, useCallback} from "react";
import logo from "./logo.svg";
import "./App.css";
import Amplify from "aws-amplify";
import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";
import {listRecipes, uploadImage} from "./utils/api";

Amplify.configure({
  Auth: {
    region: process.env.REACT_APP_AWS_DEFAULT_REGION,
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
    mandatorySignIn: true
  }
});

function App() {
  listRecipes().then(console.log);

  const onFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      await uploadImage(file);
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <input type="file" accept="image/*" capture="camera" onChange={onFileChange}/>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
