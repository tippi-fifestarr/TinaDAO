import React, { useState } from "react";

const UploadAndDisplayImage = ({
  uploadToArweave,
  updateState,
}: {
  uploadToArweave: (arg0: any, arg1: string) => Promise<string>;
  updateState: (arTxIds: string[]) => void;
}) => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  return (
    <div>
      <h4>Upload Image</h4>
      {selectedImage &&
        selectedImage.map((img: any) => (
          <div key={img.name}>
            <img alt="not fount" width={"250px"} src={URL.createObjectURL(img)} />
          </div>
        ))}
      <br />
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          // const formData = new FormData(event.target as HTMLFormElement);

          const meta_txids: string[] = [];
          if (selectedImage.length > 0) {
            Promise.all(
              selectedImage.map((img: any) => {
                return new Promise((resolve, reject) => {
                  let reader = new FileReader();
                  reader.onload = async function () {
                    let arrayBuffer = reader.result;
                    const img_txid = await uploadToArweave(arrayBuffer, "image/jpg");
                    const meta_txid = await uploadToArweave(
                      JSON.stringify({
                        description:
                          "Functional NFT brings a new definition to NFT. Use functional NFT to sell on BGB website, you can define your NFT as anything. Whether you want to buy or sell artwork NFT, sell infrequently used antique furniture, or provide tutoring services ranging from 1 to 2 hours, you can achieve it through BGB functional NFT.\n (※ Some physical goods and services may only be restricted to Taiwan).\nWebsite: https://bgbbctec.com",
                        external_url: "https://bgbbctec.com/",
                        image: `https://arweave.net/${img_txid!}`,
                        name: "BGB functional NFT",
                      }),
                      "application/json"
                    );
                    // console.log(arrayBuffer);
                    meta_txids.push(meta_txid);
                    resolve(true);
                  };
                  reader.readAsArrayBuffer(img);
                });
              })
            ).then(() => {
              // console.log(meta_txids);
              updateState(meta_txids);
              setSelectedImage([]);
            });
          }
        }}
      >
        <div className="form-group">
          <input
            className="form-control"
            type="file"
            name="myImage"
            multiple
            required
            onChange={(event) => {
              setSelectedImage(Array.from(event.target.files!));
            }}
          />
        </div>
        <br />
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Upload" />
        </div>
      </form>
    </div>
  );
};

export default UploadAndDisplayImage;
