# Authentication using passkeys (WebAuthn)

[WebAuthn](https://w3c.github.io/webauthn/) defines a way to authenticate users using public key-based credentials. It allows servers to integrate with the strong authenticators now built into devices, like Android's Fingerprint Unlock, Windows Hello, or Apple’s Touch ID. Instead of a password, a private-public key pair (known as a credential) is created for a website. The private key is stored securely on the user’s device; a public key and randomly generated credential ID are sent to the server for storage. The server can then use that public key to prove the user’s identity (https://webauthn.guide/).

It was integrated to SE-2 using [SimpleWebAuthn](https://simplewebauthn.dev/)

## Signup

First, the user needs to signup.

The frontend first asks for credential options and then requests the registration. The user approves the sign-up with the same biometric or PIN that the user has to unlock the device. (https://github.com/damianmarti/passkey/blob/main/packages/nextjs/app/register/page.tsx)

The backend sends the credential options, saves the challenge, and then verifies that the challenge was signed by the user. If it's ok, the credentials are saved. The credential does not include the user's private key, only the public key. (https://github.com/damianmarti/passkey/blob/main/packages/nextjs/app/api/passkeys/register/route.ts)

## Login

For the login, the frontend asks for the login options and then starts the authentication, asking the user to use an unlock device option. (https://github.com/damianmarti/passkey/blob/main/packages/nextjs/app/login/page.tsx)

The backend verifies the login using the saved credentials and the credentials sent from the frontend. (https://github.com/damianmarti/passkey/blob/main/packages/nextjs/app/api/passkeys/login/route.ts)

## Configuration

You have to change the ***websiteDomain*** at https://github.com/damianmarti/passkey/blob/main/packages/nextjs/scaffold.config.ts#L40 to match your domain for WebAuthn be able to work.

## Testing website

You can test signing up and logging in at https://passkeys-tan.vercel.app/register

# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`


## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
