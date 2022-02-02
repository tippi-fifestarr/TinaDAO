import React from "react";

export function Mint({
  mintTokens,
}: {
  mintTokens: (arg0: string) => Promise<void>;
}) {
  return (
    <div>
      <h4>Mint</h4>
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
        <div className="form-group">
          <label>Choose how many NFTs to mint:</label>

          <select
            className="form-control"
            id="receiver"
            name="receiver"
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
          </select>
        </div>
        <br />
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Mint" />
        </div>
      </form>
    </div>
  );
}
