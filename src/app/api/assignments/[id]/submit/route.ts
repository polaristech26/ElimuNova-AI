import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OpenRouterAI } from '@/lib/openrouter-ai';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, attachments = [] } = body;

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check if assignment exists and student has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        students: true
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (!assignment.students.some(s => s.id === student.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: params.id,
        studentId: student.id
      }
    });

    if (existingSubmission) {
      return NextResponse.json({ error: 'Assignment already submitted' }, { status: 400 });
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        content,
        attachments,
        assignmentId: params.id,
        studentId: student.id
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        assignment: {
          select: {
            title: true,
            dueDate: true,
            description: true,
            content: true
          }
        }
      }
    });

    // Auto-grade using AI
    let updatedSubmission = submission
    try {
      const grading = await OpenRouterAI.gradeSubmission({
        assignmentTitle: submission.assignment.title,
        assignmentDescription: (submission as any).assignment.description,
        assignmentContent: (submission as any).assignment.content,
        rubric: null,
        studentAnswer: content,
        subject: null,
        gradeLevel: null
      })

      updatedSubmission = await prisma.submission.update({
        where: { id: submission.id },
        data: {
          grade: grading.grade,
          feedback: grading.feedback,
          gradedAt: new Date()
        },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          },
          assignment: { select: { title: true, dueDate: true } }
        }
      })
    } catch (e) {
      console.error('AI grading failed:', e)
    }

    // Format response
    const formattedSubmission = {
      id: updatedSubmission.id,
      content: updatedSubmission.content,
      attachments: updatedSubmission.attachments,
      grade: updatedSubmission.grade,
      feedback: updatedSubmission.feedback,
      submittedAt: updatedSubmission.submittedAt,
      gradedAt: updatedSubmission.gradedAt,
      student: {
        id: updatedSubmission.student.id,
        name: `${updatedSubmission.student.user.firstName} ${updatedSubmission.student.user.lastName}`
      },
      assignment: {
        id: updatedSubmission.assignment.id,
        title: updatedSubmission.assignment.title,
        dueDate: updatedSubmission.assignment.dueDate
      }
    };

    return NextResponse.json({
      submission: formattedSubmission,
      message: 'Assignment submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 });
  }
}
