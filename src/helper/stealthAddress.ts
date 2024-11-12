import {
  extractViewingPrivateKeyNode,
  generateEphemeralPrivateKey,
  generateStealthAddresses,
  generateStealthPrivateKey
} from '@fluidkey/stealth-account-kit';

export const generateStealthAddress = (params: {
  viewingPrivateKey: `0x${string}`;
  spendingPublicKey: `0x${string}`;
  nonce: bigint;
}): {
  stealthAddress: `0x${string}`;
  ephemeralPrivateKey: `0x${string}`;
} => {

  // Extract the node required to generate the pseudo-random input for stealth address generation
  const viewingPrivateKeyNodeNumber = 0;
  const privateViewingKeyNode = extractViewingPrivateKeyNode(params.viewingPrivateKey, viewingPrivateKeyNodeNumber);

  const { ephemeralPrivateKey } = generateEphemeralPrivateKey({
    viewingPrivateKeyNode: privateViewingKeyNode,
    nonce: params.nonce,
    chainId: 0,
  });

  const { stealthAddresses } = generateStealthAddresses({
    spendingPublicKeys: [params.spendingPublicKey],
    ephemeralPrivateKey,
  });

  return {
    stealthAddress: stealthAddresses[0],
    ephemeralPrivateKey,
  };
}

export const evalStealthAddressPrivateKey = (params: {
  spendingPrivateKey: `0x${string}`;
  ephemeralPublicKey: `0x${string}`;
}): `0x${string}` => {

  // Generate the stealth private spending key controlling the stealth Safe
  const { stealthPrivateKey } = generateStealthPrivateKey({
    spendingPrivateKey: params.spendingPrivateKey,
    ephemeralPublicKey: params.ephemeralPublicKey,
  });

  return stealthPrivateKey;
}
