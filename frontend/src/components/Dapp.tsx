// We'll use ethers to interact with the Ethereum network and our contract
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { BigNumber, ethers } from "ethers";
import React from "react";
import "web3modal"; // needed to get window.ethereum
import contractAddress from "../contracts/contract-address.json";
import TinaDAOArtifact from "../contracts/TinaDAO.json";
// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Mint } from "./Mint";
// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { Transfer } from "./Transfer";
import UploadAndDisplayImage from "./UploadAndDisplayImage";
import { ViewAllNFT } from "./ViewAllNFT";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

// ignore the window.ethereum type check, reference:https://ethereum.stackexchange.com/questions/94439/trying-to-use-window-ethereum-request-in-typescript-errors-out-with-property-re
declare let window: any;

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const ACCEPT_NETWORK_ID = process.env.REACT_APP_CHAIN_ID; // 31337 for hardhat local and 42 for kovan

const AR_KEY_RAW = JSON.parse(process.env.REACT_APP_AR_KEY!);
const AR_KEY: JWKInterface = {
  kty: AR_KEY_RAW.kty!,
  e: AR_KEY_RAW.e!,
  n: AR_KEY_RAW.n!,
  d: AR_KEY_RAW.d,
  p: AR_KEY_RAW.p,
  q: AR_KEY_RAW.q,
  dp: AR_KEY_RAW.dp,
  dq: AR_KEY_RAW.dq,
  qi: AR_KEY_RAW.qi,
};
// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

const arweave: Arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  logging: false,
});

type MainProps = {
  // none yet
};

type MainState = {
  // We store multiple things in Dapp's state.
  // You don't need to follow this pattern, but it's an useful example.
  // The info of the token (i.e. It's Name and symbol)
  tokenData?: {
    name: string;
    symbol: string;
  };
  tokenUris: Array<string>;
  uploadedImgId: Array<string>;
  uploadedTxId: Array<string>;
  erc721Data?: {
    name: string;
    symbol: string;
  };
  tokenIds: Array<number>;
  // The user's address and balance
  selectedAddress?: string;
  balance?: BigNumber;
  // The ID about transactions being sent, and any possible error with them
  txBeingSent?: string;
  transactionError?: Error;
  networkError?: string;
  provider?: ethers.providers.Web3Provider;
  token?: ethers.Contract;
  erc721?: ethers.Contract;
  pollDataInterval?: NodeJS.Timeout;
};

const initialState: MainState = {
  tokenUris: [],
  tokenData: undefined,
  uploadedTxId: [],
  uploadedImgId: [],
  tokenIds: [],
  erc721Data: undefined,
  selectedAddress: undefined,
  balance: undefined,
  txBeingSent: undefined,
  transactionError: undefined,
  networkError: undefined,
  provider: undefined,
  token: undefined,
  erc721: undefined,
  pollDataInterval: undefined,
};

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.state = initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (!this.state.erc721Data || !this.state.balance) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              {this.state.erc721Data.name} ({this.state.erc721Data.symbol})
            </h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>, you have{" "}
              <b>
                {this.state.balance.toString()} {this.state.erc721Data.symbol}
              </b>
              . Token IDs of my NFTs: {JSON.stringify(this.state.tokenIds, null, "")}
            </p>
            <Mint mintTokens={(receiver) => this._mintToken(receiver)} uploadedImgTxId={this.state.uploadedImgId} />
            <br />
            <Transfer
              transferTokens={(to, tokenId) => this._transferTokens(to, tokenId)}
              batchTransferTokens={(to, tokenIds) => this._transferTokens(to, BigNumber.from(0), tokenIds)}
              tokenSymbol={this.state.erc721Data.symbol}
              tokenIds={this.state.tokenIds}
            />
            <br />
            <UploadAndDisplayImage
              uploadToArweave={(contentToUpload, fileType) => this._uploadToArweave(contentToUpload, fileType)}
              updateState={(arTxIds) => this._updateStateFromMeta(arTxIds)}
            />
            <br />
            <ViewAllNFT tokenUris={this.state.tokenUris} tokenIds={this.state.tokenIds} />
          </div>
        </div>
        <hr />

        <div className="row">
          <div className="col-12">
            {/* 
              Sending a transaction isn't an immidiate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {this.state.txBeingSent && <WaitingForTransactionMessage txHash={this.state.txBeingSent} />}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]: [string]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]: [string]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress: string) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this._getContractData();
    this._startPollingData();

    // arweave.wallets.jwkToAddress(AR_KEY).then((address) => {
    //   console.log(address);
    // });
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    let _provider = new ethers.providers.Web3Provider(window.ethereum);
    this.setState({
      provider: _provider,
    });

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this.setState({
      erc721: new ethers.Contract(contractAddress.TinaDAO, TinaDAOArtifact.abi, _provider.getSigner(0)),
    });
  }

  // The next to methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this.setState({
      pollDataInterval: setInterval(() => this._updateBalance(), 1000),
    });

    // We run it once immediately so we don't have to wait for it
    // this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this.state.pollDataInterval!);
    this.setState({
      pollDataInterval: undefined,
    });
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getContractData() {
    const name = await this.state.erc721!.name();
    const symbol = await this.state.erc721!.symbol();

    this.setState({ erc721Data: { name, symbol } });
  }

  async _updateBalance() {
    const balance = await this.state.erc721!.balanceOf(this.state.selectedAddress);
    this.setState({ balance });

    const tokenIds: Array<number> = [];
    const tokenUris: Array<string> = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await this.state.erc721!.tokenOfOwnerByIndex(this.state.selectedAddress, i);
      const tokenUri = await this._showTokenUriFromTokenId(tokenId);

      tokenIds.push(tokenId.toNumber());
      tokenUris.push(tokenUri);
    }
    this.setState({ tokenIds, tokenUris });
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(to: string, tokenId: BigNumber, tokenIds: BigNumber[] = []) {
    try {
      this._dismissTransactionError();

      let tx: any = {};
      if (tokenIds.length === 0) {
        tx = await this.state.erc721!.transferFrom(this.state.selectedAddress, to, tokenId, {
          gasLimit: 1000000,
        });
      } else {
        tx = await this.state.erc721!.batchTransferFrom(this.state.selectedAddress, to, tokenIds, {
          gasLimit: 1000000,
        });
      }

      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await this._updateBalance();
    } catch (error: any) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  async _uploadToArweave(contentToUpload: any, _fileType: string) {
    try {
      this._dismissTransactionError();

      let transaction = await arweave.createTransaction({ data: contentToUpload }, AR_KEY);
      transaction.addTag("Content-Type", _fileType);

      await arweave.transactions.sign(transaction, AR_KEY);

      let uploader = await arweave.transactions.getUploader(transaction);
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        // console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
        // console.log(transaction);
        // arweave.transactions.getStatus(transaction.id).then((res) => {
        //   console.log(res);
        // });

        return transaction.id || "";
      }
      // const response = await arweave.transactions.post(transaction);
      // console.log(response);
    } catch (error: any) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return "";
      }
      console.error(error);
      this.setState({ transactionError: error });
    }
    return "";
  }

  async _showTokenUriFromTokenId(tokenId: number) {
    try {
      this._dismissTransactionError();
      const tokenURI = await this.state.erc721!.tokenURI(tokenId);
      // console.log("tokenURI", tokenURI);
      const imgUri = await this._tokenUriToImg(tokenURI);
      // console.log(imgUri);
      return imgUri;
    } catch (error: any) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    }
  }

  async _tokenUriToImg(arTxId: string) {
    const rawJson = await (await fetch(arTxId)).text();
    const metaJSON = JSON.parse(rawJson);
    return metaJSON.image;
  }

  async _updateStateFromMeta(arTxIds: string[]) {
    try {
      this._dismissTransactionError();

      let imageURLs = [];
      for (let i = 0; i < arTxIds.length; i++) {
        console.log(arTxIds[i]);
        const imageURL = await this._tokenUriToImg(`https://arweave.net/${arTxIds[i]}`);
        imageURLs.push(imageURL);
      }

      // console.log("img", imageURL);

      this.setState({
        uploadedImgId: imageURLs,
        uploadedTxId: arTxIds,
      });
    } catch (error: any) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
    }
  }

  async _mintToken(receiver: string) {
    try {
      this._dismissTransactionError();

      let tx: any;
      if (this.state.uploadedTxId.length > 1) {
        tx = await this.state.erc721!.batchMint(receiver, this.state.uploadedTxId, { gasLimit: 1000000 });
      } else if (this.state.uploadedTxId.length === 1) {
        tx = await this.state.erc721!.mint(receiver, `${this.state.uploadedTxId[0]}`, { gasLimit: 1000000 });
      } else return;

      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await this._updateBalance();
    } catch (error: any) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error: Error) {
    // if (error.data) {
    //   return error.data.message;
    // }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(initialState);
  }

  // This method checks if Metamask selected network is Kovan
  _checkNetwork() {
    if (window.ethereum.networkVersion === ACCEPT_NETWORK_ID) {
      return true;
    }

    let network = "mainnet";
    switch (ACCEPT_NETWORK_ID) {
      case "4":
        network = "Rinkeby";
        break;
      case "3":
        network = "Ropsten";
        break;
      case "1":
        network = "Mainnet";
        break;
      case "31337":
        network = "Hardhat";
        break;
      case "42":
        network = "Kovan";
        break;
      case "137":
        network = "Polygon";
        break;
    }
    this.setState({
      networkError: `Please connect Metamask to the ${network} testnet`,
    });

    return false;
  }
}
