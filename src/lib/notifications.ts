import { db } from "@/lib/db";
import { appUrl, ctaButton, emailLayout, escapeHtml, sendEmail } from "@/lib/email";

type StudentRecipient = {
  name: string;
  email: string;
};

async function getEnrolledStudents(courseId: string): Promise<StudentRecipient[]> {
  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    select: {
      user: { select: { name: true, email: true } },
    },
  });

  return enrollments.map((e) => e.user);
}

function notifyMany(
  recipients: StudentRecipient[],
  send: (student: StudentRecipient) => Promise<void>
) {
  void Promise.allSettled(recipients.map((student) => send(student))).then(
    (results) => {
      for (const result of results) {
        if (result.status === "rejected") {
          console.error("[email] notification failed:", result.reason);
        }
      }
    }
  );
}

export function notifyNewMaterial(input: {
  courseId: string;
  courseTitle: string;
  materialTitle: string;
}) {
  void getEnrolledStudents(input.courseId)
    .then((students) => {
      notifyMany(students, async (student) => {
        const link = appUrl("/student/materials");
        const name = escapeHtml(student.name);
        const materialTitle = escapeHtml(input.materialTitle);
        const courseTitle = escapeHtml(input.courseTitle);
        await sendEmail({
          to: student.email,
          subject: `New study material: ${input.materialTitle}`,
          text: `Hi ${student.name},\n\nNew study material "${input.materialTitle}" was added to your course "${input.courseTitle}".\n\nView materials: ${link}\n\n— AIM Coaching`,
          html: emailLayout(
            "New study material",
            `<p style="margin:0 0 12px;color:#334155;line-height:1.5;">Hi ${name},</p>
             <p style="margin:0 0 12px;color:#334155;line-height:1.5;">
               <strong>${materialTitle}</strong> was added to
               <strong>${courseTitle}</strong>.
             </p>
             ${ctaButton("View materials", link)}`
          ),
        });
      });
    })
    .catch((err) => console.error("[email] notifyNewMaterial failed:", err));
}

export function notifyNewTest(input: {
  courseId: string;
  courseTitle: string;
  testTitle: string;
  testFormat: "ONLINE" | "WRITTEN";
  durationMinutes: number | null;
}) {
  void getEnrolledStudents(input.courseId)
    .then((students) => {
      const formatLabel =
        input.testFormat === "WRITTEN" ? "Written test" : "Online test";
      const timerNote =
        input.durationMinutes && input.testFormat === "ONLINE"
          ? ` Time limit: ${input.durationMinutes} minutes.`
          : "";

      notifyMany(students, async (student) => {
        const link = appUrl("/student/tests");
        const name = escapeHtml(student.name);
        const testTitle = escapeHtml(input.testTitle);
        const courseTitle = escapeHtml(input.courseTitle);
        await sendEmail({
          to: student.email,
          subject: `New test available: ${input.testTitle}`,
          text: `Hi ${student.name},\n\nA new ${formatLabel.toLowerCase()} "${input.testTitle}" is available in "${input.courseTitle}".${timerNote}\n\nTake the test: ${link}\n\n— AIM Coaching`,
          html: emailLayout(
            "New test available",
            `<p style="margin:0 0 12px;color:#334155;line-height:1.5;">Hi ${name},</p>
             <p style="margin:0 0 12px;color:#334155;line-height:1.5;">
               A new <strong>${formatLabel.toLowerCase()}</strong>,
               <strong>${testTitle}</strong>, is available in
               <strong>${courseTitle}</strong>.
               ${timerNote ? `<br><span style="color:#64748b;font-size:14px;">${timerNote.trim()}</span>` : ""}
             </p>
             ${ctaButton("View tests", link)}`
          ),
        });
      });
    })
    .catch((err) => console.error("[email] notifyNewTest failed:", err));
}

export function notifyResultPublished(input: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  testTitle: string;
  obtainedMarks: number;
  totalMarks: number;
}) {
  void (async () => {
    const link = appUrl("/student/results");
    const score = `${input.obtainedMarks}/${input.totalMarks}`;
    const name = escapeHtml(input.studentName);
    const testTitle = escapeHtml(input.testTitle);
    const courseTitle = escapeHtml(input.courseTitle);

    await sendEmail({
      to: input.studentEmail,
      subject: `Your result is ready: ${input.testTitle}`,
      text: `Hi ${input.studentName},\n\nYour result for "${input.testTitle}" (${input.courseTitle}) is ready.\n\nScore: ${score}\n\nView results: ${link}\n\n— AIM Coaching`,
      html: emailLayout(
        "Your result is ready",
        `<p style="margin:0 0 12px;color:#334155;line-height:1.5;">Hi ${name},</p>
         <p style="margin:0 0 12px;color:#334155;line-height:1.5;">
           Your result for <strong>${testTitle}</strong>
           in <strong>${courseTitle}</strong> is ready.
         </p>
         <p style="margin:0;padding:12px 16px;background:#eef2ff;border-radius:8px;color:#312e81;font-size:18px;font-weight:700;">
           Score: ${score}
         </p>
         ${ctaButton("View results", link)}`
      ),
    });
  })().catch((err) => console.error("[email] notifyResultPublished failed:", err));
}
