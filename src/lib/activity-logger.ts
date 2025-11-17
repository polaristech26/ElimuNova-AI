import { prisma } from '@/lib/prisma'

export interface ActivityData {
  schoolId: string
  userId?: string
  type: 'TEACHER_ENROLLED' | 'STUDENT_ENROLLED' | 'CLASS_CREATED' | 'PAYMENT_RECEIVED' | 'MEETING_SCHEDULED' | 'USER_LOGIN' | 'USER_LOGOUT' | 'SETTINGS_UPDATED' | 'REPORT_GENERATED' | 'PACKAGE_UPDATED' | 'OTHER'
  action: string
  description: string
  metadata?: any
}

export async function logActivity(data: ActivityData) {
  try {
    await prisma.activity.create({
      data: {
        schoolId: data.schoolId,
        userId: data.userId,
        type: data.type,
        action: data.action,
        description: data.description,
        metadata: data.metadata || null
      }
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw error to avoid breaking the main operation
  }
}

// Helper functions for common activities
export async function logTeacherEnrolled(schoolId: string, userId: string, teacherName: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'TEACHER_ENROLLED',
    action: 'Teacher Enrolled',
    description: `New teacher ${teacherName} has been enrolled`,
    metadata: { teacherName }
  })
}

export async function logStudentEnrolled(schoolId: string, userId: string, studentName: string, className?: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'STUDENT_ENROLLED',
    action: 'Student Enrolled',
    description: `New student ${studentName} has been enrolled${className ? ` in class ${className}` : ''}`,
    metadata: { studentName, className }
  })
}

export async function logClassCreated(schoolId: string, userId: string, className: string, subject: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'CLASS_CREATED',
    action: 'Class Created',
    description: `New class ${className} for ${subject} has been created`,
    metadata: { className, subject }
  })
}

export async function logPaymentReceived(schoolId: string, userId: string, amount: number, description: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'PAYMENT_RECEIVED',
    action: 'Payment Received',
    description: `Payment of ${amount} received: ${description}`,
    metadata: { amount, description }
  })
}

export async function logMeetingScheduled(schoolId: string, userId: string, meetingTitle: string, date: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'MEETING_SCHEDULED',
    action: 'Meeting Scheduled',
    description: `Meeting "${meetingTitle}" scheduled for ${date}`,
    metadata: { meetingTitle, date }
  })
}

export async function logUserLogin(schoolId: string, userId: string, userName: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'USER_LOGIN',
    action: 'User Login',
    description: `${userName} logged in`,
    metadata: { userName }
  })
}

export async function logUserLogout(schoolId: string, userId: string, userName: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'USER_LOGOUT',
    action: 'User Logout',
    description: `${userName} logged out`,
    metadata: { userName }
  })
}

export async function logSettingsUpdated(schoolId: string, userId: string, settingName: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'SETTINGS_UPDATED',
    action: 'Settings Updated',
    description: `Setting ${settingName} has been updated`,
    metadata: { settingName }
  })
}

export async function logReportGenerated(schoolId: string, userId: string, reportType: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'REPORT_GENERATED',
    action: 'Report Generated',
    description: `${reportType} report has been generated`,
    metadata: { reportType }
  })
}

// Lesson Plan Activities
export async function logLessonPlanCreated(schoolId: string, userId: string, lessonPlanTitle: string, subject: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'OTHER',
    action: 'Lesson Plan Created',
    description: `Created lesson plan "${lessonPlanTitle}" for ${subject}`,
    metadata: { lessonPlanTitle, subject, activityType: 'lesson_plan' }
  })
}

export async function logLessonPlanUpdated(schoolId: string, userId: string, lessonPlanTitle: string, subject: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'OTHER',
    action: 'Lesson Plan Updated',
    description: `Updated lesson plan "${lessonPlanTitle}" for ${subject}`,
    metadata: { lessonPlanTitle, subject, activityType: 'lesson_plan' }
  })
}

export async function logLessonPlanDeleted(schoolId: string, userId: string, lessonPlanTitle: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'OTHER',
    action: 'Lesson Plan Deleted',
    description: `Deleted lesson plan "${lessonPlanTitle}"`,
    metadata: { lessonPlanTitle, activityType: 'lesson_plan' }
  })
}

// Scheme of Work Activities
export async function logSchemeOfWorkCreated(schoolId: string, userId: string, schemeTitle: string, subject: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'OTHER',
    action: 'Scheme of Work Created',
    description: `Created scheme of work "${schemeTitle}" for ${subject}`,
    metadata: { schemeTitle, subject, activityType: 'scheme_of_work' }
  })
}

export async function logSchemeOfWorkUpdated(schoolId: string, userId: string, schemeTitle: string, subject: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'OTHER',
    action: 'Scheme of Work Updated',
    description: `Updated scheme of work "${schemeTitle}" for ${subject}`,
    metadata: { schemeTitle, subject, activityType: 'scheme_of_work' }
  })
}

export async function logSchemeOfWorkDeleted(schoolId: string, userId: string, schemeTitle: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'OTHER',
    action: 'Scheme of Work Deleted',
    description: `Deleted scheme of work "${schemeTitle}"`,
    metadata: { schemeTitle, activityType: 'scheme_of_work' }
  })
}

// Assignment Activities
export async function logAssignmentCreated(schoolId: string, userId: string, assignmentTitle: string, subject: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'OTHER',
    action: 'Assignment Created',
    description: `Created assignment "${assignmentTitle}" for ${subject}`,
    metadata: { assignmentTitle, subject, activityType: 'assignment' }
  })
}

export async function logAssignmentGraded(schoolId: string, userId: string, assignmentTitle: string, studentName: string) {
  await logActivity({
    schoolId,
    userId,
    type: 'OTHER',
    action: 'Assignment Graded',
    description: `Graded assignment "${assignmentTitle}" for ${studentName}`,
    metadata: { assignmentTitle, studentName, activityType: 'assignment' }
  })
}