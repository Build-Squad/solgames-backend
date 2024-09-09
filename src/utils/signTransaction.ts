import * as solanaWeb3 from '@solana/web3.js';
import bs58 from 'bs58';

export async function signTransaction(
  serializedTransaction: string,
  secretKey: string,
) {
  const secretKeyBytes = bs58.decode(secretKey);

  const keypair = solanaWeb3.Keypair.fromSecretKey(secretKeyBytes);

  const transaction = solanaWeb3.Transaction.from(
    Buffer.from(serializedTransaction, 'base64'),
  );

  transaction.partialSign(keypair);

  const signedTransaction = transaction.serialize().toString('base64');

  return signedTransaction;
}
