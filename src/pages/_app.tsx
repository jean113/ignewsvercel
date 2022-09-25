import  { Header }  from '../components/Header';
import '../styles/global.scss';
import { AppProps } from 'next/app';
import { SessionProvider as NextAuthProvider } from 'next-auth/react';

function MyApp({ Component, pageProps }: AppProps) {
  return( 
    <NextAuthProvider session={pageProps.session} refetchInterval={5 * 60}>
      <Header/>
      <Component {...pageProps}/>
    </NextAuthProvider>
  );
}

export default MyApp;
