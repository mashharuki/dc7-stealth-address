DC7 Stealth Address Generator
=============================

![DevCon 7 Logo](public/imgs/dc7SeaLogo_scaled.png)

Overview
--------

The **DC7 Stealth Address Generator** is a demo project developed for the **DevCon 7 Workshop**: *Better privacy 
defaults for your users with stealth addresses*. This project demonstrates how to leverage stealth addresses to 
provide users with improved privacy in Web3 applications. Stealth addresses enhance privacy in blockchain 
transactions by allowing more private interactions, helping users maintain control over their personal information.

In this workshop, participants will implement stealth addresses to create private Safe signers and use them to 
control Safe transactions.

Workshop Description
--------------------

During this workshop, we'll cover:

-   Practical use cases of stealth addresses for privacy.
-   Implementation of stealth addresses to generate private Safe signers from scratch.
-   Understanding the interplay between stealth addresses and different product types.

Getting Started
---------------

### Prerequisites

-   [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed.
-   Familiarity with TypeScript and React is beneficial but not required.

### Installation

1.  Clone this repository:
    ```bash
    git clone fluidkeyy/dc7-stealth-address
    ```

2.  Navigate to the project directory and install dependencies:
    ```bash
    cd dc7-stealth-address
    yarn install
    ```

3.  Start the development server:
    ```bash
    yarn start
    ```

### Project Structure

This project is organized as follows, with all source code located in the `/src` directory:

-   **`context/MainContext.tsx`**: Provides global state management for accounts and WalletKit integration.
-   **`helper/stealthAddress.ts`**: Helper functions to generate stealth addresses.
-   **`provider/WalletKitProvider.tsx`**: Manages WalletConnect sessions and integrates WalletKit for session handling.
-   **UI Components**:
    -   **`ui/pages/Dashboard.tsx`**: The main interface for managing stealth accounts.
    -   **`ui/organisms/AccountList/AccountList.tsx`**: Displays a list of stealth accounts.

### Commands

-   `yarn start` - Start the development server.
-   `yarn build` - Build the app for production.

### Additional Resources

-   [Stealth Account Kit Repository](https://github.com/fluidkey/fluidkey-stealth-account-kit) - Kit with core function to generate and manage Stealth Addresses.

License
-------

This project is for demonstration and educational purposes and is not intended for production use.
