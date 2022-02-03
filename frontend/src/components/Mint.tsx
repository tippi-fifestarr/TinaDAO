import React, { useState } from "react";
import Slider from "react-smooth-range-input";

export function Mint({
  mintTokens,
}: {
  mintTokens: (arg0: string) => Promise<void>;
}) {
  let [mintCount, setMintCount] = useState(1);
  return (
    <div data-sal-delay={400} data-sal="slide-up" data-sal-duration={800}>
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          const formData = new FormData(event.target as HTMLFormElement);
          // const receiver = formData.get("receiver") as string;
          const receiver = mintCount.toString();
          console.log(receiver);

          if (receiver) {
            mintTokens(receiver);
          }
        }}
      >
        <div className="form-group">
          {/* <label>Choose how many NFTs to mint:</label> */}
          <Slider
            value={1}
            onChange={(val) => {
              console.log(val);
              setMintCount(val);
            }}
            min={1}
            max={5}
            barHeight={10}
            hasTickMarks={false}
          />
          {/* <select
            className="form-select"
            id="receiver"
            defaultValue="1"
            required
          >
            <option value="1" key="1">
              1
            </option>
            <option value="2" key="2">
              2
            </option>
            <option value="3" key="3">
              3
            </option>
            <option value="4" key="4">
              4
            </option>
            <option value="5" key="5">
              5
            </option>
          </select> */}
        </div>
        <br />
        <div className="form-group mt-5">
          <input
            className="btn btn-large btn-primary-alta sal-animate"
            type="submit"
            value="Mint"
          />
        </div>
      </form>
    </div>
  );
}
