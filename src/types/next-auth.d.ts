import 'next-auth'
import 'next-auth/jwt'
declare module 'next-auth' {
  interface Session { user: { id:string;name:string;email:string;username:string;role:'SUPER_ADMIN'|'HOD'|'TEACHER';deptId:string|null;deptName:string|null;deptCode:string|null } }
}
declare module 'next-auth/jwt' {
  interface JWT { id:string;username:string;role:'SUPER_ADMIN'|'HOD'|'TEACHER';deptId:string|null;deptName:string|null;deptCode:string|null }
}
