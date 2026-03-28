import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE'

type AttendanceRecord = { status: AttendanceStatus }

type StudentAttendanceRow = {
  id: number
  name: string
  rollNo: string
  examRoll: string | null
  guardianPhone?: string | null
  attendance: AttendanceRecord[]
}

type SubjectAttendanceRow = {
  id: number
  name: string
  code: string
  attendance: AttendanceRecord[]
}

type DepartmentAttendanceRow = {
  id: number
  name: string
  code: string
  hodId: number | null
  hod?: { name: string; username: string } | null
  students: { attendance: AttendanceRecord[] }[]
  users: { id: number }[]
}

export async function GET(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const {searchParams} = new URL(req.url)
  const type = searchParams.get('type') || 'summary'
  const semId = searchParams.get('semId')
  const deptId = s.user.role === 'SUPER_ADMIN'
    ? searchParams.get('deptId') ? Number(searchParams.get('deptId')) : undefined
    : Number(s.user.deptId)

  const threshold = Number((await prisma.setting.findFirst({where: {key: 'shortage_threshold', scope: 'GLOBAL'}}))?.value ?? 75)

  if (type === 'summary') {
    const students = await prisma.student.findMany({
      where: {deptId, isActive: true, semId: semId ? Number(semId) : undefined},
      select: {id: true, name: true, rollNo: true, examRoll: true, attendance: {select: {status: true}}}
    })
    const data = students.map((st: StudentAttendanceRow) => {
      const total = st.attendance.length
      const present = st.attendance.filter((a: AttendanceRecord) => a.status === 'PRESENT').length
      const pct = total === 0 ? null : Math.round((present / total) * 100)
      return {id: st.id, name: st.name, rollNo: st.rollNo, examRoll: st.examRoll, total, present, absent: st.attendance.filter((a: AttendanceRecord) => a.status === 'ABSENT').length, leave: st.attendance.filter((a: AttendanceRecord) => a.status === 'LEAVE').length, pct, shortage: pct !== null && pct < threshold}
    })
    return NextResponse.json(data)
  }

  if (type === 'subject') {
    const subjects = await prisma.subject.findMany({
      where: {deptId, isActive: true, semId: semId ? Number(semId) : undefined},
      include: {attendance: {select: {status: true}}}
    })
    const data = subjects.map((sub: SubjectAttendanceRow) => {
      const total = sub.attendance.length
      const present = sub.attendance.filter((a: AttendanceRecord) => a.status === 'PRESENT').length
      return {id: sub.id, name: sub.name, code: sub.code, total, present, pct: total === 0 ? null : Math.round((present / total) * 100)}
    })
    return NextResponse.json(data)
  }

  if (type === 'defaulters') {
    const students = await prisma.student.findMany({
      where: {deptId, isActive: true, semId: semId ? Number(semId) : undefined},
      select: {id: true, name: true, rollNo: true, examRoll: true, guardianPhone: true, attendance: {select: {status: true}}}
    })
    const data = students.map((st: StudentAttendanceRow) => {
      const total = st.attendance.length
      const present = st.attendance.filter((a: AttendanceRecord) => a.status === 'PRESENT').length
      const pct = total === 0 ? null : Math.round((present / total) * 100)
      return {...st, total, present, pct, shortage: pct !== null && pct < threshold}
    }).filter((d: { shortage: boolean }) => d.shortage)
    return NextResponse.json(data)
  }

  if (type === 'dept') {
    const depts = await prisma.department.findMany({
      include: {
        students: {select: {attendance: {select: {status: true}}}},
        hod: {select: {name: true, username: true}},
        users: {where: {role: 'TEACHER', isActive: true}, select: {id: true}}
      }
    })
    const data = depts.map((d: DepartmentAttendanceRow) => {
      const allAtt = d.students.flatMap((s: { attendance: AttendanceRecord[] }) => s.attendance)
      const total = allAtt.length
      const present = allAtt.filter((a: AttendanceRecord) => a.status === 'PRESENT').length
      return {
        id: d.id,
        name: d.name,
        code: d.code,
        hodId: d.hodId,
        hodName: d.hod?.name || null,
        hodUsername: d.hod?.username || null,
        studentCount: d.students.length,
        teacherCount: d.users.length,
        total,
        present,
        pct: total === 0 ? null : Math.round((present / total) * 100)
      }
    })
    return NextResponse.json(data)
  }

  return NextResponse.json([])
}