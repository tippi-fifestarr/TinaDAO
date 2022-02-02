import React from "react";

export function ViewAllNFT({ tokenUris, tokenIds }: { tokenUris: Array<string>; tokenIds: Array<number> }) {
  return (
    <div>
      <h4>View All NFT</h4>
      <p>
        You can also see the NFT on{" "}
        <a href="https://opensea.io/account?tab=created">https://opensea.io/account?tab=created</a>
      </p>
      {[...Array(tokenUris.length)].map((j, i) => (
        <div key={i}>
          <img src={tokenUris[i]} alt="token uri" width="200" key={tokenUris[i]}></img>
          <p>Token ID: {tokenIds[i]}</p>
        </div>
      ))}
    </div>
  );
}
