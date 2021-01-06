import React from "react";
import logo from "./logo.svg";
import Amplify from "aws-amplify";
import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";
import styled from "styled-components";

Amplify.configure({
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_Uf5yzuFsm",
    userPoolWebClientId: "5hifnhh26nphmm5l2ej38b2fit",
    mandatorySignIn: true,
  },
});

const AppContainer = styled.div`
  text-align: center;
`;

const AppHeader = styled.header`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const AppLink = styled.a`
  color: #61dafb;
`;

const AppLogo = styled.img`
  height: 40vmin;
  pointer-events: none;
  animation: App-logo-spin infinite 20s linear;
  @keyframes App-logo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

function App() {
  return (
    <AppContainer>
      <AppHeader>
        <AppLogo src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <AppLink href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </AppLink>
      </AppHeader>
      <AmplifySignOut />
    </AppContainer>
  );
}

export default withAuthenticator(App);
