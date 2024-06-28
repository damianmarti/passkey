import { NextResponse } from "next/server";
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import scaffoldConfig from "~~/scaffold.config";
import { deleteChallenge, getChallenge, getCredential, saveChallenge } from "~~/utils/passkeys/utils";

const rpID = scaffoldConfig.websiteDomain;
/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
const origin = `https://${rpID}`;

export const POST = async (req: Request) => {
  const { action, userId, credential } = (await req.json()) as {
    action: string;
    userId: string;
    credential?: any;
  };

  // console.log(`New call to /login. Action: ${action}`);

  if (action === "loginOptions") {
    const expectedCredential = getCredential(userId);

    if (!expectedCredential) {
      return NextResponse.json({ error: "No credential found" }, { status: 400 });
    }

    const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
      rpID,
      // Require users to use a previously-registered authenticator
      allowCredentials: [
        {
          id: expectedCredential.id,
          transports: expectedCredential.transports,
        },
      ],
    });

    saveChallenge(userId, options);

    return NextResponse.json(options, { status: 200 });
  } else if (action === "verifyCredential") {
    try {
      const currentOptions = getChallenge(userId);
      const passkey = getCredential(userId);

      if (!passkey) {
        throw new Error(`Could not find passkey for user ${userId}`);
      }

      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: passkey.id,
          credentialPublicKey: passkey.publicKey,
          counter: passkey.counter,
          transports: passkey.transports,
        },
      });

      const { verified } = verification;

      if (!verified) {
        throw new Error("Assertion not verified");
      }

      // Remove the used challenge to prevent replay attacks
      deleteChallenge(userId);

      return NextResponse.json({ success: true, message: "Login successful" }, { status: 200 });
    } catch (error) {
      console.log(error);

      return NextResponse.json({ success: false, message: (error as Error).message }, { status: 401 });
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
};
