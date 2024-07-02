"use client";

import React, { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";

const LoginWithPasskey = () => {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState<string>("");

  const loginWithPasskey = async () => {
    try {
      const loginOptionsResponse = await fetch("/api/passkeys/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "loginOptions", userId }),
      });

      if (!loginOptionsResponse.ok) {
        setMessage("Failed to get passkey credentials. Please sign up first.");
        return;
      }

      const loginOptions = await loginOptionsResponse.json();

      let credential;
      try {
        credential = await startAuthentication(loginOptions);
      } catch (error: any) {
        setMessage(error.message);
        return;
      }

      const verificationResponse = await fetch("/api/passkeys/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verifyCredential",
          userId,
          credential,
        }),
      });

      const verificationResult = await verificationResponse.json();

      if (verificationResult && verificationResult.success) {
        setMessage("Login successful!");
      } else {
        setMessage("Login failed: " + verificationResult.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Login failed with an error.");
    }
  };

  return (
    <div className="flex items-center justify-center mt-16">
      <div className="flex flex-col bg-base-100 p-10 text-center items-center rounded-3xl w-3/4 sm:w-1/2">
        <div className="flex flex-col sm:flex-row items-center">
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="User ID"
            className="border-2 border-gray-300 rounded-md p-2 m-2 w-40"
          />
          <button onClick={loginWithPasskey} className="btn btn-primary m-4">
            Login with Passkey
          </button>
          <a href="/register">Signup</a>
        </div>
        <div className="m-4">{message}</div>
      </div>
    </div>
  );
};

export default LoginWithPasskey;
