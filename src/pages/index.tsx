import  Head from '../../node_modules/next/head';
import { SubscribeButton } from '../components/SubscribeButton/index';
import styles from './home.module.scss';
import { GetStaticProps } from 'next';
import { stripe } from '../services/stripe';

//3 formas de popular um página
// cliente-side - outros casos - não preciso de indexação
// server-side -indexção também - quando precisamos de dados dinâmicos em tempo real da sessão do usuário
// Avaliar bem se realmente tal conteudo é necessário carregar por server side, pois enquanto
//ele não terminar, não carrega a página toda. Se não for necessário, talvez seja interessante
//usar cliente-side
// static site generation - compartilhar a mesma infomração para todas as pessoas que estão acessando o site

interface HomeProps
{
  product: {
    priceId: string;
    amount: number;
  }
}


export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
          <title>
              Home | Ig.News
          </title> 
      </Head>
     <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>
          👏 Hey, Welcome
          </span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br/>
            <span>for {product.amount} month</span>
          </p>
        </section>
        <img src="/images/avatar.svg" alt="Girl coding"/>
        <SubscribeButton priceId={product.priceId}/>
     </main>
    </>
  )
}

/* Esta função tem que ter esse nome
  ela só funciona em páginas. Caso queira usar em componentes
  tem que repassar da pág para o componente o que deixa tudo
  2 seg mais lento.
  Tem que ser como const para poder usar essa tipificação.
*/
export const getStaticProps: GetStaticProps = async () =>
{
  const price = await stripe.prices.retrieve('price_1LDRYIL9x1Fzu3UXyFOLXuIB');

  const product = 
  {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style:'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  }

  return {
    props: {
      product,
    },
    //vc informa quanto tempo a página vai ficar sem ser revalidada (reconstruída)
    revalidate: 60 * 60 * 24, //24 horas
  }
}
