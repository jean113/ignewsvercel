// como essa página é dinamica, recebe vários Posts diferentes
// e vai receber parametros o nome desse componente deve estar
// entre colchetes

import {GetStaticProps} from 'next';
import {getSession} from 'next-auth/react';
import { RichText } from 'prismic-dom';
import Head from '../../../../node_modules/next/head';
import Link from '../../../../node_modules/next/link';
import { initScriptLoader } from '../../../../node_modules/next/script';
import { getPrismicClient } from '../../../services/prismic';
import styles from '../post.module.scss';
import { useSession } from 'next-auth/react';
import { useRouter } from '../../../../node_modules/next/router';
import { useEffect } from 'react';

interface PostPreviewProps
{
    post: 
    {
        slug:string,
        title:string,
        content:string,
        updatedAt:string
    }
}

export default function PostsPreview({post}:PostPreviewProps)
{
    const { data: session }  = useSession();
    const router = useRouter();

    useEffect(() =>
    {
        if(session?.activeSubscription)
        {
            router.push(`/posts/${post.slug}`)
        }
    },[session])

    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>

                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>

                    {/* como esta tag formata o texto HMTL, ele pode executar
                    codigos maliciosos, por isso, ter certeza que o backend
                    impede isso - por isso o nome dangerous */}
                    <div 
                        className={`${styles.postContent} ${styles.previewContent}`}
                        dangerouslySetInnerHTML={{__html:post.content}}
                    />

                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href="/">
                            <a href="">Subscribe now 😊</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    );
}

/**
 * 
 * 3 maneiras de gerar uma página estática:
 * Build - gera toda vez que der um build - yarn build - dependendo da qtd de páginas fica lento
 * - Gerada no primeiro acesso da página, nos outros é usado o cache dessa página
 * - metade de um, metade de outro
 * 
 * * esse método só pode ser usado em páginas dinamicas - as que contem colchetes no nome do arquivo
 */

export const getStaticPaths = () =>
{
    return {
        paths: [],
        fallback: 'blocking'
    }
}

// export const getStaticPaths: GetStaticPaths = async () =>
// {
//     return {
//         // aqui vai ser colocado as páginas que serão geradas no primeiro acesso
//         paths: [
//             {params: {slug: 'o slug'}}
//         ],
//         fallback: 'blocking'
//     }
// }

// a página é publica e não precisa verificar todo instante
// se usuário está inscrito, por isso pode ser estatica
export const getStaticProps: GetStaticProps = async ({params}) =>
{
    const {slug} = params;

    const prismic = getPrismicClient();

    const response = await prismic.getByUID('post', String(slug), {});

    const post ={
        slug,
        title: RichText.asText(response.data.Title),
        content: RichText.asHtml(response.data.Text.splice(0,3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR',
        {
            day:'2-digit',
            month: 'long',
            year:'numeric'
        })
    }

    return {
        props: { post, },
        redirect: 60 * 30, //30 minutos
    }
}