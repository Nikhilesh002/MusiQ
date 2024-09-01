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
    async signIn(params:any) {
      console.log(params)
      if(!params || !params.user || !params.user.email){
        return false;
      }
      try {
        const isExistingUser=await prismaClient.user.findFirst({
          where:{
            email:params.user.email
          }
        });
        if(!isExistingUser){
          await prismaClient.user.create({
            data:{
              email:params.user.email,
              provider:"Google"
            }
          })
        }
        return true
      } catch (error) {
        console.error(error);
        return false
      }
    }
  },
  // pages:{
  //   signIn:'/signin'
  // }
}