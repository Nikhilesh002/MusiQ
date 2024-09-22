import { prismaClient } from "@/lib/db";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";


export const authOptions:NextAuthOptions={
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],
  callbacks: {
    async signIn(params:any){
      if(!params || !params.user || !params.user.email){
        return false;
      }
      try {
        const existingUser=await prismaClient.user.findFirst({
          where:{
            email:params.user.email
          }
        });
        if(existingUser){
          params.user.id=existingUser.id
          return true;
        }

        const newUser=await prismaClient.user.create({
          data:{
            email:params.user.email,
            provider:"Google"
          }
        })
        params.user.id=newUser.id
        return true
      } catch (error) {
        console.error(error);
        return false
      }
    },
    async jwt({ token, user }) {
      if(token && user){
        token.userId=user?.id
      }
      return token
    },
    async session({ session, token }) {
      if(token && session){
        session.user.userId=token.userId as string;
      }
      return session
    }
  },
  secret:process.env.NEXTAUTH_SECRET,
  session:{
    strategy:"jwt"
  }
}