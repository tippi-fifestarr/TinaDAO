import React from "react";
import { ConnectWallet } from "./ConnectWallet";

export function Navbar({
  selectedAddress,
  _connectWallet,
  networkError,
  _dismissNetworkError,
  balance,
  symbol,
  tokenIds,
}: {
  _connectWallet: () => Promise<void>;
  _dismissNetworkError: () => void;
  networkError?: string;
  selectedAddress?: string;
  balance?: string;
  symbol?: string;
  tokenIds?: string;
}) {
  return (
    <>
      <header className="rn-header haeder-default black-logo-version header--fixed header--sticky">
        <div className="container">
          <div className="header-inner">
            <div className="header-left">
              <div className="logo-thumbnail logo-custom-css">
                <a className="logo-light" href="index.html">
                  <img src="assets/images/logo/logo-white.png" alt="nft-logo" />
                </a>
                <a className="logo-dark" href="index.html">
                  <img src="assets/images/logo/logo-dark.png" alt="nft-logo" />
                </a>
              </div>
              <div className="mainmenu-wrapper">
                <nav id="sideNav" className="mainmenu-nav d-none d-xl-block">
                  {/* Start Mainmanu Nav */}
                  <ul className="mainmenu">
                    {/* <li className="has-droupdown has-menu-child-item">
                      <a className="its_new" href="index.html">
                        Home
                      </a>
                      <ul className="submenu">
                        <li>
                          <a href="index.html">
                            Home page One <i className="feather-home" />
                          </a>
                        </li>
                        <li>
                          <a href="index-two.html">
                            Home page Two
                            <i className="feather-home" />
                          </a>
                        </li>
                        <li>
                          <a href="index-three.html">
                            Home page Three
                            <i className="feather-home" />
                          </a>
                        </li>
                        <li>
                          <a href="index-four.html">
                            Home page Four
                            <i className="feather-home" />
                          </a>
                        </li>
                        <li>
                          <a href="index-five.html">
                            Home page Five
                            <i className="feather-home" />
                          </a>
                        </li>
                        <li>
                          <a href="index-six.html">
                            Home page Six
                            <i className="feather-home" />
                          </a>
                        </li>
                        <li>
                          <a href="index-seven.html">
                            Home page Seven
                            <i className="feather-home" />
                          </a>
                        </li>
                        <li>
                          <a href="index-eight.html">
                            Home page Eight
                            <i className="feather-home" />
                          </a>
                        </li>
                        <li>
                          <a href="index-nine.html">
                            Home page Nine
                            <i className="feather-home" />
                          </a>
                        </li>
                      </ul>
                    </li> */}
                    <li>
                      <a href="about.html">About</a>
                    </li>
                    <li>
                      <a href="blog.html">Blog</a>
                    </li>
                    <li>
                      <a href="contact.html">Contact</a>
                    </li>
                  </ul>
                  {/* End Mainmanu Nav */}
                </nav>
              </div>
            </div>
            <div className="header-right">
              <div className="setting-option header-btn">
                <div className="icon-box">
                  {/* <a
                  className="btn btn-primary-alta btn-small"
                  href="create.html"
                >
                  Connect Wallet
                </a> */}
                  {!selectedAddress && (
                    <ConnectWallet
                      connectWallet={() => _connectWallet()}
                      networkError={networkError}
                      dismiss={() => _dismissNetworkError()}
                    />
                  )}
                </div>
              </div>
              <div className="setting-option rn-icon-list user-account">
                <div className="icon-box">
                  <a href="author.html">
                    <img
                      src="assets/images/icons/fairy-avatar.png"
                      alt="Images"
                    />
                  </a>
                  <div className="rn-dropdown">
                    <div className="rn-inner-top">
                      <h4 className="title">
                        <a href="product-details.html">
                          Your Address: {selectedAddress}
                        </a>
                      </h4>
                    </div>
                    <div className="rn-product-inner">
                      <ul className="product-list">
                        <li className="single-product-list">
                          <div className="thumbnail">
                            <a href="product-details.html">
                              <img
                                src="assets/images/portfolio/portfolio-07.jpg"
                                alt="Nft Product Images"
                              />
                            </a>
                          </div>
                          <div className="content">
                            <h6 className="title">
                              <a href="product-details.html">Balance</a>
                            </h6>
                            <span className="price">
                              {balance + " " + symbol}
                            </span>
                          </div>
                          <div className="button" />
                        </li>
                        <li className="single-product-list">
                          <div className="thumbnail">
                            <a href="product-details.html">
                              <img
                                src="assets/images/portfolio/portfolio-01.jpg"
                                alt="Nft Product Images"
                              />
                            </a>
                          </div>
                          <div className="content">
                            <h6 className="title">
                              <a href="product-details.html">Token IDs</a>
                            </h6>
                            <span className="price">{tokenIds}</span>
                          </div>
                          <div className="button" />
                        </li>
                      </ul>
                    </div>
                    <div className="add-fund-button mt--20 pb--20">
                      <a className="btn btn-primary-alta w-100" href="#">
                        View my NFTs
                      </a>
                    </div>
                    {/* <ul className="list-inner">
                      <li>
                        <a href="author.html">My Profile</a>
                      </li>
                      <li>
                        <a href="author.html">Edit Profile</a>
                      </li>
                      <li>
                        <a href="connect.html">Manage funds</a>
                      </li> 
                       <li>
                        <a href="login.html">Disconnect</a>
                      </li>
                    </ul> */}
                  </div>
                </div>
              </div>
              {/* <div className="setting-option mobile-menu-bar d-block d-xl-none">
                <div className="hamberger">
                  <button className="hamberger-button">
                    <i className="feather-menu" />
                  </button>
                </div>
              </div> */}
              <div id="my_switcher" className="setting-option my_switcher">
                <ul>
                  <li>
                    <a
                      href="javascript: void(0);"
                      data-theme="light"
                      className="setColor light"
                    >
                      <img
                        src="assets/images/icons/sun-01.svg"
                        alt="Sun images"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript: void(0);"
                      data-theme="dark"
                      className="setColor dark"
                    >
                      <img
                        src="assets/images/icons/vector.svg"
                        alt="Vector Images"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
