import { BigNumber } from "ethers";
import React from "react";

export function Transfer({
  transferTokens,
  batchTransferTokens,
  tokenSymbol,
  tokenIds,
}: {
  transferTokens: (arg0: string, arg1: BigNumber) => Promise<void>;
  batchTransferTokens: (arg0: string, arg1: BigNumber[]) => Promise<void>;
  tokenSymbol: string;
  tokenIds: Array<number>;
}) {
  return (
    <div>
      <h4>Transfer NFT</h4>
      <p>(Hold down Ctrl / Command to select multiple options)</p>
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          const formData = new FormData(event.target as HTMLFormElement);
          const to = formData.get("to") as string;
          const tokenIdRaw = formData.getAll("tokenId");

          if (to && tokenIdRaw) {
            if (tokenIdRaw.length === 1) {
              transferTokens(to, BigNumber.from(tokenIdRaw[0]));
            } else {
              batchTransferTokens(to, tokenIdRaw.map(BigNumber.from));
            }
          }
        }}
      >
        <div className="form-group">
          <label>Token ID of {tokenSymbol}</label>
          <select className="form-control" id="tokenId" name="tokenId" multiple required>
            {tokenIds.map((tokenId) => (
              <option value={tokenId} key={tokenId}>
                {tokenId}{" "}
              </option>
            ))}
          </select>
          {/* <input className="form-control" type="number" step="1" name="tokenId" placeholder="1" required /> */}
        </div>
        <div className="form-group">
          <label>Recipient address</label>
          <input className="form-control" type="text" name="to" required />
        </div>
        <br />
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Transfer" />
        </div>
      </form>
    </div>
  );
}
