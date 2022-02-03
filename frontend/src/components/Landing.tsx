import React from "react";
import { Mint } from "./Mint";

export function Landing({
  mintTokens,
}: {
  mintTokens: (arg0: string) => Promise<void>;
}) {
  return (
    <div className="slider-one rn-section-gapTop">
      <div className="container">
        <div className="row row-reverce-sm align-items-center">
          <div className="col-lg-5 col-md-6 col-sm-12 mt_sm--50">
            <h2
              className="title"
              data-sal-delay={200}
              data-sal="slide-up"
              data-sal-duration={800}
            >
              The TinaDAO NFT Project
            </h2>
            <p
              className="slide-disc"
              data-sal-delay={300}
              data-sal="slide-up"
              data-sal-duration={800}
            >
              The First NFT Project Which the Model is the Dev&nbsp;Behind.
            </p>
            <Mint mintTokens={mintTokens} />
            {/* <div className="button-group">
              <a
                className="btn btn-large btn-primary"
                href="#"
                data-sal-delay={400}
                data-sal="slide-up"
                data-sal-duration={800}
              ></a>
              <a
                className="btn btn-large btn-primary-alta"
                href="create.html"
                data-sal-delay={500}
                data-sal="slide-up"
                data-sal-duration={800}
              >
                Create
              </a>
            </div> */}
          </div>
          <div className="col-lg-5 col-md-6 col-sm-12 offset-lg-1">
            <div className="slider-thumbnail">
              <img
                src="assets/images/slider/slider-1.png"
                alt="Slider Images"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
