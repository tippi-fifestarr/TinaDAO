// We'll use ethers to interact with the Ethereum network and our contract
import { BigNumber, ethers } from "ethers";
import React from "react";
import "web3modal"; // needed to get window.ethereum
import contractAddress from "../contracts/contract-address.json";
import TinaDAOArtifact from "../contracts/TinaDAO.json";
import WHITELIST from "../whitelist.json";
// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import { Loading } from "./Loading";
import { Landing } from "./Landing";
import { Mint } from "./Mint";
import { Navbar } from "./Navbar";
// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

// ignore the window.ethereum type check, reference:https://ethereum.stackexchange.com/questions/94439/trying-to-use-window-ethereum-request-in-typescript-errors-out-with-property-re
declare let window: any;

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const ACCEPT_NETWORK_ID = process.env.REACT_APP_CHAIN_ID; // 31337 for hardhat local and 42 for kovan

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

type MainProps = {
  // none yet
};

type MainState = {
  // We store multiple things in Dapp's state.
  tokenUris: Array<string>;
  whitelistData: any;
  uploadedTxId: Array<string>;
  tinaDAOData?: {
    name: string;
    symbol: string;
    stageInfo: StageInfo;
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
  tinaDAO?: ethers.Contract;
  pollDataInterval?: NodeJS.Timeout;
};

const initialState: MainState = {
  tokenUris: [],
  uploadedTxId: [],
  tokenIds: [],
  tinaDAOData: undefined,
  selectedAddress: undefined,
  balance: undefined,
  whitelistData: undefined,
  txBeingSent: undefined,
  transactionError: undefined,
  networkError: undefined,
  provider: undefined,
  token: undefined,
  tinaDAO: undefined,
  pollDataInterval: undefined,
};

type StageInfo = {
  stageId: number;
  maxSupply: number;
  startTime: number;
  endTime: number;
  mintPrice: BigNumber;
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

    // If everything is loaded, we render the application.
    return (
      <>
        <Navbar
          selectedAddress={this.state.selectedAddress}
          networkError={this.state.networkError}
          _dismissNetworkError={this._dismissNetworkError}
          _connectWallet={() => this._connectWallet()}
          balance={this.state.balance ? this.state.balance.toString() : "-"}
          symbol={this.state.tinaDAOData ? this.state.tinaDAOData.symbol : ""}
          tokenIds={JSON.stringify(this.state.tokenIds, null, "")}
        />
        <Landing />
        <div className="container p-4">
          {this.state.selectedAddress && (
            <>
              {!(this.state.tinaDAOData && this.state.balance) ? (
                <Loading />
              ) : (
                <>
                  <div className="row">
                    <div className="col-12">
                      <h1>
                        {this.state.tinaDAOData.name} (
                        {this.state.tinaDAOData.symbol})
                      </h1>
                      <Mint
                        mintTokens={(receiver) => this._mintToken(receiver)}
                      />
                      <br />
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
                      {this.state.txBeingSent && (
                        <WaitingForTransactionMessage
                          txHash={this.state.txBeingSent}
                        />
                      )}

                      {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
                      {this.state.transactionError && (
                        <TransactionErrorMessage
                          message={this._getRpcErrorMessage(
                            this.state.transactionError
                          )}
                          dismiss={() => this._dismissTransactionError()}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </>
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
      whitelistData: new Map(Object.entries(WHITELIST)),
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this._getContractData();
    this._startPollingData();
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
      tinaDAO: new ethers.Contract(
        contractAddress.TinaDAO,
        TinaDAOArtifact.abi,
        _provider.getSigner(0)
      ),
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
    const name = await this.state.tinaDAO!.name();
    const symbol = await this.state.tinaDAO!.symbol();
    const stageInfo = await this.state.tinaDAO!.stageInfo();

    this.setState({ tinaDAOData: { name, symbol, stageInfo } });
  }

  async _updateBalance() {
    const balance = await this.state.tinaDAO!.balanceOf(
      this.state.selectedAddress
    );

    this.setState({ balance });

    const tokenIds: Array<number> = [];
    const tokenUris: Array<string> = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await this.state.tinaDAO!.tokenOfOwnerByIndex(
        this.state.selectedAddress,
        i
      );
      const tokenUri = await this._showTokenUriFromTokenId(tokenId);

      tokenIds.push(tokenId.toNumber());
      tokenUris.push(tokenUri!);
    }
    this.setState({ tokenIds, tokenUris });
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(
    to: string,
    tokenId: BigNumber,
    tokenIds: BigNumber[] = []
  ) {
    try {
      this._dismissTransactionError();

      let tx: any = {};
      if (tokenIds.length === 0) {
        tx = await this.state.tinaDAO!.transferFrom(
          this.state.selectedAddress,
          to,
          tokenId,
          {
            gasLimit: 1000000,
          }
        );
      } else {
        tx = await this.state.tinaDAO!.batchTransferFrom(
          this.state.selectedAddress,
          to,
          tokenIds,
          {
            gasLimit: 1000000,
          }
        );
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

  async _showTokenUriFromTokenId(tokenId: number) {
    try {
      this._dismissTransactionError();
      const tokenURI = await this.state.tinaDAO!.tokenURI(tokenId);
      const imgUri = await this._tokenUriToImg(tokenURI);
      return imgUri;
    } catch (error: any) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    }
  }

  ipfsToUrl(url: string): string {
    if (!url || !url.includes("ipfs://")) return url;
    return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
  }
  async _tokenUriToImg(url: string) {
    url = this.ipfsToUrl(url);
    const rawJson = await (await fetch(url)).text();
    const metaJSON = JSON.parse(rawJson);
    return this.ipfsToUrl(metaJSON.image);
  }

  async _mintToken(amount: string) {
    try {
      this._dismissTransactionError();

      if (
        !this.state.selectedAddress ||
        !this.state.whitelistData ||
        !this.state.tinaDAOData
      )
        return;

      const data = this.state.whitelistData.get(this.state.selectedAddress);
      if (!data) {
        alert("Not in whitelist");
        return;
      }
      if (this.state.tinaDAOData.stageInfo.startTime * 1000 > Date.now()) {
        alert("Sales hasn't started yet");
        return;
      }
      const voucher = data.voucher;
      const signature = data.signature;

      let tx = await this.state.tinaDAO!.whitelistMint(
        voucher,
        signature,
        amount,
        {
          value: this.state.tinaDAOData.stageInfo.mintPrice?.mul(amount),
        }
      );

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
