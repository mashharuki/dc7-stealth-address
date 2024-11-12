/**
 * Represents the basic structure of an account within the application.
 * Each account contains essential information such as its address, nonce, ephemeral public key, and an optional nickname.
 */
export type AccountBaseType = {
  /**
   * The stealth address associated with the account.
   * @example '0xabc123...'
   */
  address: `0x${string}`;

  /**
   * A unique nonce used to create the stealthAddress.
   * @example '0x1a2b3c...'
   */
  nonce: `0x${string}`;

  /**
   * The ephemeral public key connected to the stealth address generation
   * @example '0xdef456...'
   */
  ephemeralPublicKey: `0x${string}`;

  /**
   * An optional nickname for the account.
   * @example 'My Savings Account'
   */
  nickname?: string;
};

/**
 * Contains the meta stealth keys required for generating and managing stealth addresses.
 * These keys include both spending and viewing keys in their public and private forms.
 */
export type MetaStealthKey = {
  spendingPublicKey: `0x${string}`;
  spendingPrivateKey: `0x${string}`;
  viewingPublicKey: `0x${string}`;
  viewingPrivateKey: `0x${string}`;
};
