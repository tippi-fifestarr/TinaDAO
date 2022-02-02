import React from "react";

export function Mint({
  mintTokens,
  uploadedImgTxId,
}: {
  mintTokens: (arg0: string) => Promise<void>;
  uploadedImgTxId: string[];
}) {
  return (
    <div>
      <h4>Mint NFT</h4>
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          const formData = new FormData(event.target as HTMLFormElement);
          const receiver = formData.get("receiver") as string;

          if (receiver) {
            mintTokens(receiver);
          }
        }}
      >
        {uploadedImgTxId ? (
          <div>
            <h5>Uploaded Image</h5>
            {uploadedImgTxId.map((img: string) => (
              <img key={img} src={img} alt="arweave img" width="200" />
            ))}
          </div>
        ) : (
          <p>(upload custom image using the below "Upload Image" tool and it will show up here)</p>
        )}
        <div className="form-group">
          <label>Recipient address</label>
          <input className="form-control" type="text" name="receiver" required />
        </div>
        <br />
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Mint" />
        </div>
      </form>
    </div>
  );
}
