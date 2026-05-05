export interface MasterySkill {
  skillKey: string
  skillLabel: string
  pKnown: number
  attemptsCount: number
}

export interface ChildProgressView {
  studentId: string
  studentName: string
  skills: MasterySkill[]
}
