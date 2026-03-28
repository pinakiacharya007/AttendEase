import {NextAuthOptions} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import {prisma} from './prisma'
export const authOptions:NextAuthOptions={
  session:{strategy:'jwt',maxAge:8*60*60},
  pages:{signIn:'/login',error:'/login'},
  providers:[CredentialsProvider({name:'credentials',credentials:{username:{label:'Username',type:'text'},password:{label:'Password',type:'password'}},
    async authorize(credentials){
      if(!credentials?.username||!credentials?.password)return null
      const user=await prisma.user.findUnique({where:{username:credentials.username.trim().toLowerCase()},include:{department:{select:{id:true,name:true,code:true}}}})
      if(!user||!user.isActive)return null
      if(!await bcrypt.compare(credentials.password,user.passwordHash))return null
      await prisma.user.update({where:{id:user.id},data:{lastLoginAt:new Date()}})
      return {id:String(user.id),name:user.name,email:user.email??'',username:user.username,role:user.role,deptId:user.deptId?String(user.deptId):null,deptName:user.department?.name??null,deptCode:user.department?.code??null}
    }})],
  callbacks:{
    async jwt({token,user}){if(user){const u=user as any;token.id=u.id;token.username=u.username;token.role=u.role;token.deptId=u.deptId;token.deptName=u.deptName;token.deptCode=u.deptCode}return token},
    async session({session,token}){session.user.id=token.id;session.user.username=token.username;session.user.role=token.role;session.user.deptId=token.deptId;session.user.deptName=token.deptName;session.user.deptCode=token.deptCode;return session},
  },
}
