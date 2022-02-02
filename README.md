# TinaDAO NFT

## Node Version

It is recommended to use Node version 16

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# Then edit ~/.bashrc as the command prompt suggests
nvm install 16
nvm use 16
node --version
```

## Install Dependencies

```shell
npm i
```

## Arweave Setup

```shell
npm install -g arkb
# Save wallet and setup a passphrase
arkb wallet-save <path_to_arweave_key.json>
# Deploy files to Arweave
arkb deploy <path_to_file>
```

## IPFS Setup

```shell
brew install ipfs
ipfs init
npx hardhat run scripts/ipfsUploadUnrevealed.js
```

## Running the Project (Rinkeby testnet)

1. Install dependencies via `yarn`.
2. Update the contract metadata file `contract-meta.json` and upload it to IPFS using `arkb deploy contract-meta.json`. After getting the Arweave link, update the data in `contractURI()` in the smart contract `TinaDAO.sol`.
3. Create a `.env` file under the root project folder from `.env.example` like the following:

```bash
KOVAN_RPC_URL='https://kovan.infura.io/v3/project_id'
ROPSTEN_RPC_URL='https://ropsten.infura.io/v3/project_id'
RINKEBY_RPC_URL='https://rinkeby.infura.io/v3/project_id'
POLYGON_RPC_URL='https://polygon-mainnet.infura.io/v3/project_id'
MNEMONIC='yo'
ETHERSCAN_API='yo'
POLYGONSCAN_API=''
ARG_NAME='TinaDAO'
ARG_SYMBOL='TINA'
```

4. Create a file named `.env` from `.env.example` under `/frontend` with the following content:

```bash
SKIP_PREFLIGHT_CHECK=true
REACT_APP_CHAIN_ID=4
REACT_APP_AR_KEY={your_AR_key}
```

1. Deploy contract with `npx hardhat run scripts/deploy.js --network rinkeby`
1. Wait one minute until the contract has been included on Etherscan and verify contract with `npx hardhat run scripts/verify.js --network rinkeby`
1. Change minter address in `scripts/whitelist.js` and whitelist minter with `npx hardhat run scripts/whitelist.js --network rinkeby`

1. Run frontend with `cd frontend && yarn && yarn start`
1. Switch to Rinkeby testnet on MetaMask
1. Start using the app
1. After fixing the website, push to Github to deploy it on Netlify. Remember to set the environment variable in Netlify as in `frontend/.env`. The current website is at https://wonderful-visvesvaraya-ab4cca.netlify.app/.

### Generate Coverage Report

1. Run test to ensure everything works as expected via `npx hardhat test`.
2. Run the following command and open`coverage/index.html` in your browser.

```shell
npm run coverage
```

## Project Structure

- `contracts/`: Smart contract files. The main contract is `TinaDAO.sol`.
- `test/`: All contract testing files. Developers can reference this to know to interact with the contracts with JavaScript. The main testing file is `TinaDAO.test.js`.

## Smart Contract Inheritance

![in](./images/inheritance.png)

## Test Coverage

![cov](./images/coverage.png)
