import NextAuth from 'next-auth';
import GitHubProvider from "next-auth/providers/github";
import {fauna} from '../../../services/fauna';
import { query as q } from 'faunadb';
import { match } from 'assert';

export default NextAuth({

    providers:[
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                params: {
                  scope: 'read:user',
                },
            },
        }),
    ],
    //subscription_by_user_ref
    //callbacks: funções excutadas pelo NextAuth automaticamente assim que acontece alguma ação
    callbacks: {

        async session({session})
        {
           try
           {
                const userActiveSubscription = await fauna.query(
                    q.Get(
                        q.Intersection([
                            q.Match(
                                q.Index('subscription_by_user_ref'),
                                q.Select(
                                    "ref",
                                    q.Get(
                                        q.Match(
                                            q.Index('user_by_email'),
                                            q.Casefold(session.user.email)
                                        )
                                    )
                                )
                            ),
                            q.Match(
                                q.Index('subscription_by_status'),
                                "active"
                            )
                        ])
                    )
                )

                return {
                    ...session,
                    activeSubscription: userActiveSubscription
                }
           }
           catch
           {
                return {
                    ...session,
                    activeSubscription: null,
                }
           }
        },


        async signIn({ user, account, profile, credentials }) {
            const {email} = user;
            
            try
            {
                await fauna.query(
                    //Para mais comandos olhar FQL cheat sheet no site do faunadb
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(//equivale ao where do sql
                                    q.Index('user_by_email'),
                                    q.Casefold(email) // coloca tudo em lowercase
                                ) 
                            )
                        ),
                        q.Create(
                            q.Collection('users'),
                            { data: { email } }
                        ),
                        q.Get( //equivale ao select do sql
                                q.Match(//equivale ao where do sql
                                q.Index('user_by_email'),
                                q.Casefold(email) // coloca tudo em lowercase
                            )       
                        )
                    ),
                )
                return true;
            }
            catch
            {
                return false;
            }
          },
    }
});