import React from "react";
import { NetworkErrorMessage } from "./NetworkErrorMessage";

export function ConnectWallet({
  connectWallet,
  networkError,
  dismiss,
}: {
  connectWallet: () => Promise<void>;
  networkError?: string;
  dismiss: () => void;
}) {
  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="text-center">
          {/* Metamask network should be set to Localhost:8545. */}
          {networkError && (
            <NetworkErrorMessage message={networkError} dismiss={dismiss} />
          )}
        </div>
        <div className="text-center btn btn-primary-alta btn-small">
          <button
            className="btn btn-warning"
            type="button"
            style={{ whiteSpace: "nowrap" }}
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
