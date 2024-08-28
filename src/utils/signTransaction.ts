import * as solanaWeb3 from '@solana/web3.js';

export function hexToUint8Array(hexString: string) {
  return Uint8Array.from(Buffer.from(hexString, 'hex'));
}

export async function signTransaction(
  serializedTransaction: string,
  secretKey: string,
) {
  const secretKeyBytes = hexToUint8Array(secretKey);

  const keypair = solanaWeb3.Keypair.fromSecretKey(secretKeyBytes);

  const transaction = solanaWeb3.Transaction.from(
    Buffer.from(serializedTransaction, 'base64'),
  );

  transaction.partialSign(keypair);

  const signedTransaction = transaction.serialize().toString('base64');

  return signedTransaction;
}
