import { NetworkId } from '@/config';
import '@/styles/globals.css';
import '@near-wallet-selector/modal-ui/styles.css';
import { useInitWallet } from '@/wallets/wallet-selector';
import type { AppProps } from 'next/app';
import { CONTRACT_ADDRESS } from '@/components/utils';

export default function App({ Component, pageProps }: AppProps) {
  useInitWallet({ createAccessKeyFor: CONTRACT_ADDRESS, networkId: NetworkId });

  return <Component {...pageProps} />;
}
