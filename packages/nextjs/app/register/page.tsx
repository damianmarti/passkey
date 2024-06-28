"use client";

import React, { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";

const RegisterPasskey = () => {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const registerOptionsResponse = await fetch("/api/passkeys/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "registerOptions", userId }),
      });
      const registerOptions = await registerOptionsResponse.json();
      const credential = await startRegistration(registerOptions);

      const verificationResp = await fetch("/api/passkeys/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "registerCredential",
          userId,
          credential,
        }),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON && verificationJSON.verified) {
        setMessage("Registration successful! You can now login");
      } else {
        setMessage("Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during registration.");
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
          <button onClick={handleRegister} className="btn btn-primary mr-4">
            Register with Passkey
          </button>
          <a href="/login">Login</a>
        </div>
        <div className="m-4">{message}</div>
      </div>
    </div>
  );
};

export default RegisterPasskey;
