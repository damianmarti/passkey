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

      const stringToArrayBuffer = (string: string) => {
        const byteArray = new Uint8Array(string.length);
        for (let i = 0; i < string.length; i++) {
          const codePoint = string.codePointAt(i);
          if (codePoint !== undefined) {
            byteArray[i] = codePoint;
          }
        }
        return byteArray;
      };

      const encodedText = stringToArrayBuffer("Private key");
      // console.log("encodedText: ", encodedText);

      loginOptions.extensions = {
        largeBlob: {
          write: encodedText,
        },
      };

      const assertion = await navigator.credentials.get(loginOptions);

      alert(JSON.stringify(assertion));

      // @ts-ignore
      if (assertion && assertion.getClientExtensionResults().largeBlob.written) {
        alert("The large blob was written successfully.");
      } else {
        // The large blob could not be written (e.g. because of a lack of space).
        // The assertion is still valid.
        alert("The large blob could not be written.");
      }

      loginOptions.extensions = {
        largeBlob: {
          read: true,
        },
      };

      const assertionRead = await navigator.credentials.get(loginOptions);
      alert(JSON.stringify(assertionRead));

      // @ts-ignore
      if (assertion && typeof assertion.getClientExtensionResults().largeBlob.read !== "undefined") {
        // Reading a large blob was successful.
        // @ts-ignore
        const blobBits = new Uint8Array(assertion.getClientExtensionResults().largeBlob.read);
        alert("The large blob was read successfully: " + new TextDecoder().decode(blobBits));
      } else {
        // The large blob could not be read (e.g. because the data is corrupted).
        // The assertion is still valid.
        alert("The large blob could not be read.");
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
