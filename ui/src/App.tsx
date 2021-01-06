import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Amplify from "aws-amplify";
import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";

Amplify.configure({
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_Uf5yzuFsm",
    userPoolWebClientId: "5hifnhh26nphmm5l2ej38b2fit",
    mandatorySignIn: true
  }
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
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
