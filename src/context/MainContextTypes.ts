export type AccountBaseType = {
  address: `0x${string}`,
  nonce: `0x${string}`,
  ephemeralPublicKey: `0x${string}`,
  nickname?: string,
}

export type MetaStealthKey = {
  spendingPublicKey: `0x${string}`;
  spendingPrivateKey: `0x${string}`;
  viewingPublicKey: `0x${string}`;
  viewingPrivateKey: `0x${string}`;
}
