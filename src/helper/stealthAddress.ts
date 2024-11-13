import {
  extractViewingPrivateKeyNode,
  generateEphemeralPrivateKey, generateKeysFromSignature,
  generateStealthAddresses,
  generateStealthPrivateKey
} from '@fluidkey/stealth-account-kit';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Generates a stealth address and its corresponding ephemeral private key.
 *
 * @param params - The parameters required to generate the stealth address.
 * @param params.viewingPrivateKey - The viewing private key in hex format.
 * @param params.spendingPublicKey - The spending public key in hex format.
 * @param params.nonce - A unique nonce to ensure the uniqueness of the stealth address.
 * @returns An object containing the generated stealth address and ephemeral private key.
 */
export const generateStealthAddress = (params: {
  viewingPrivateKey: `0x${string}`;
  spendingPublicKey: `0x${string}`;
  nonce: bigint;
}): {
  stealthAddress: `0x${string}`;
  ephemeralPrivateKey: `0x${string}`;
} => {

  // Define the node number used for extracting the viewing private key node.
  const viewingPrivateKeyNodeNumber = 0;

  // Extract the specific node from the viewing private key required for generating the ephemeral key.
  const privateViewingKeyNode = extractViewingPrivateKeyNode(params.viewingPrivateKey, viewingPrivateKeyNodeNumber);

  // Generate an ephemeral private key using the extracted viewing key node and the provided nonce.
  const { ephemeralPrivateKey } = generateEphemeralPrivateKey({
    viewingPrivateKeyNode: privateViewingKeyNode,
    nonce: params.nonce,
    chainId: 0,
  });

  // Generate stealth addresses using the spending public key and the generated ephemeral private key.
  const { stealthAddresses } = generateStealthAddresses({
    spendingPublicKeys: [params.spendingPublicKey],
    ephemeralPrivateKey,
  });

  // Return the first stealth address and the corresponding ephemeral private key.
  return {
    stealthAddress: stealthAddresses[0],
    ephemeralPrivateKey,
  };
};

/**
 * Evaluates and generates the stealth private spending key based on the spending private key and ephemeral public key.
 *
 * @param params - The parameters required to evaluate the stealth private key.
 * @param params.spendingPrivateKey - The spending private key in hex format.
 * @param params.ephemeralPublicKey - The ephemeral public key in hex format.
 * @returns The generated stealth private key in hex format.
 */
export const evalStealthAddressPrivateKey = (params: {
  spendingPrivateKey: `0x${string}`;
  ephemeralPublicKey: `0x${string}`;
}): `0x${string}` => {

  // Generate the stealth private spending key using the provided spending private key and ephemeral public key.
  const { stealthPrivateKey } = generateStealthPrivateKey({
    spendingPrivateKey: params.spendingPrivateKey,
    ephemeralPublicKey: params.ephemeralPublicKey,
  });

  return stealthPrivateKey;
};

/**
 * Generates the meta stealth keys based on the provided master private key.
 *
 * @param params - The parameters required to generate the meta stealth keys.
 * @param params.masterPrivateKey - The master private key in hex format.
 * @returns An object containing the generated spending and viewing private keys.
 */
export const generateMetaStealthKeys = async (params: {
  masterPrivateKey: `0x${string}`;
}): Promise<{
  spendingPrivateKey: `0x${string}`;
  viewingPrivateKey: `0x${string}`;
}> => {
  // Generate a signature to derive meta stealth keys
  const message_to_authenticate = 'Hello Devcon 7!!';
  const masterKeyAccount = privateKeyToAccount(params.masterPrivateKey);
  const messageSignature = await masterKeyAccount.signMessage({
    message: message_to_authenticate,
  });

  // Derive stealth keys from the signature
  return generateKeysFromSignature(messageSignature);
}
