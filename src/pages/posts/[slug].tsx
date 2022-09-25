// como essa página é dinamica, recebe vários Posts diferentes
// e vai receber parametros o nome desse componente deve estar
// entre colchetes

import {GetServerSideProps} from 'next';
import {getSession} from 'next-auth/react';
import { RichText } from 'prismic-dom';
import Head from '../../../node_modules/next/head';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface PostProps
{
    post: 
    {
        slug:string,
        title:string,
        content:string,
        updatedAt:string
    }
}

export default function Posts({post}:PostProps)
{
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
                        className={styles.postContent}
                        dangerouslySetInnerHTML={{__html:post.content}}
                    />
                </article>
            </main>
        </>
    );
}

// foi escolhido o dinamico porque garanto que vou estar sempre conferindo
// se o usuário fez login e tem assinatura ativa, o que não é possível
// com o static
export const getServerSideProps: GetServerSideProps = async ({req, params}) =>
{
    const session = await getSession({req});

    if(!session?.activeSubscription)
    {
        return {
            redirect:
            {
                destination: '/',
                permanent: false,
            }
        }
    }

    const {slug} = params;

    const prismic = getPrismicClient(req);

    const response = await prismic.getByUID('post', String(slug), {});

    const post ={
        slug,
        title: RichText.asText(response.data.Title),
        content: RichText.asHtml(response.data.Text),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR',
        {
            day:'2-digit',
            month: 'long',
            year:'numeric'
        })
    }

    return {
        props: { post }
    }
}