// Persist chat conversations for logged-in users so they can review
// their history. One `chatSession` doc per (userId, calendar day).
// Each turn appends two entries (user + assistant) to the messages array.

import { sanityWrite } from "@/lib/sanityWrite"
import { vientianeDay } from "@/lib/chat/quota"

function sessionId(userId: string, day: string): string {
  const safe = `${userId}_${day}`.replace(/[^a-zA-Z0-9_-]/g, "-")
  return `chatSession-${safe}`
}

export async function saveChatTurn(args: {
  userId: string
  userEmail: string | null
  userName: string | null
  userMessage: string
  assistantMessage: string
}): Promise<void> {
  const day = vientianeDay()
  const id  = sessionId(args.userId, day)
  const now = new Date().toISOString()

  const turnMessages = [
    { _key: `${now}-u`, role: "user",      content: args.userMessage,      createdAt: now },
    { _key: `${now}-a`, role: "assistant", content: args.assistantMessage, createdAt: now },
  ]

  const exists = await sanityWrite.fetch<boolean>(
    `defined(*[_id == $id][0])`,
    { id },
  ).catch(() => false)

  if (exists) {
    await sanityWrite
      .patch(id)
      .setIfMissing({ messages: [] })
      .append("messages", turnMessages)
      .set({ updatedAt: now })
      .commit()
      .catch(() => null)
  } else {
    await sanityWrite
      .create({
        _id: id,
        _type: "chatSession",
        userId:    args.userId,
        userEmail: args.userEmail ?? undefined,
        userName:  args.userName  ?? undefined,
        startedAt: now,
        updatedAt: now,
        messages:  turnMessages,
      })
      .catch(() => null)
  }
}
