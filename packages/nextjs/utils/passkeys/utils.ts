import type { AuthenticatorTransportFuture, Base64URLString, CredentialDeviceType } from "@simplewebauthn/types";

export type Credential = {
  // SQL: Store as `TEXT`. Index this column
  id: Base64URLString;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  //      Caution: Node ORM's may map this to a Buffer on retrieval,
  //      convert to Uint8Array as necessary
  publicKey: Uint8Array;
  // SQL: Foreign Key to an instance of your internal user model
  user: string;
  // SQL: Store as `TEXT`. Index this column. A UNIQUE constraint on
  //      (webAuthnUserID + user) also achieves maximum user privacy
  webAuthnUserID: Base64URLString;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
  // Ex: 'singleDevice' | 'multiDevice'
  deviceType: CredentialDeviceType;
  // SQL: `BOOL` or whatever similar type is supported
  backedUp: boolean;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: ['ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb']
  transports?: AuthenticatorTransportFuture[];
};

// Mock database for demonstration purposes
const db = {
  challenges: new Map<string, string>(),
  credentials: new Map<string, Credential>(),
};

const saveChallenge = (userId: string, challenge: any) => db.challenges.set(userId, challenge);
const getChallenge = (userId: string): any | undefined => db.challenges.get(userId);
const deleteChallenge = (userId: string) => db.challenges.delete(userId);
const saveCredential = (userId: string, credential: Credential) => db.credentials.set(userId, credential);
const getCredential = (userId: string) => db.credentials.get(userId);

export { getChallenge, getCredential, saveChallenge, deleteChallenge, saveCredential };
