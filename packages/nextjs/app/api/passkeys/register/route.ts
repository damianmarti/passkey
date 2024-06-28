import { NextResponse } from "next/server";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import scaffoldConfig from "~~/scaffold.config";
import { deleteChallenge, getChallenge, saveChallenge, saveCredential } from "~~/utils/passkeys/utils";
import type { Credential } from "~~/utils/passkeys/utils";

/**
 * Human-readable title for your website
 */
const rpName = scaffoldConfig.websiteName;
/**
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
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

  // console.log(`New call to /register. Action: ${action}`);

  if (action === "registerOptions") {
    const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: userId,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: "none",
      // See "Guiding use of authenticators via authenticatorSelection" below
      authenticatorSelection: {
        // Defaults
        residentKey: "preferred",
        userVerification: "preferred",
        // Optional
        authenticatorAttachment: "platform",
      },
    });

    saveChallenge(userId, options);

    return NextResponse.json(options, { status: 200 });
  } else if (action === "registerCredential") {
    const currentOptions = getChallenge(userId);

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error: any) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { verified } = verification;

    if (verified) {
      const { registrationInfo } = verification;

      if (!registrationInfo) {
        return NextResponse.json({ error: "No registration info" }, { status: 400 });
      }

      const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = registrationInfo;

      const newPasskey: Credential = {
        user: userId,
        // Created by `generateRegistrationOptions()`
        webAuthnUserID: currentOptions.user.id,
        // A unique identifier for the credential
        id: credentialID,
        // The public key bytes, used for subsequent authentication signature verification
        publicKey: credentialPublicKey,
        // The number of times the authenticator has been used on this site so far
        counter,
        // Whether the passkey is single-device or multi-device
        deviceType: credentialDeviceType,
        // Whether the passkey has been backed up in some way
        backedUp: credentialBackedUp,
        // from the credential response
        transports: credential.response.transports,
      };

      saveCredential(userId, newPasskey);
      deleteChallenge(userId);
    }

    return NextResponse.json({ verified }, { status: 200 });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
};
