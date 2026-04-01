"use server";

import { MessageRole, MessageType } from "@prisma/client";
import db from "../../../lib/db";
import { inngest } from "../../../inngest/client";
import { getCurrentUser } from "@/modules/auth/actions";
import { consumeCredits } from "@/lib/usage";

export const createMessages = async (value, projectId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (!projectId) throw new Error("Project ID is required");

  // Verify project ownership
  const project = await db.project.findFirst({
    where: {
      id: projectId,        // ✅ String UUID - no Number()
      userId: user.id,
    },
  });

  if (!project) throw new Error("Project not found or unauthorized");

  try {
    await consumeCredits();
  } catch (error) {
    throw new Error("Insufficient credits or request limit reached.");
  }

  const newMessage = await db.message.create({
    data: {
      projectId: projectId,  // ✅ String UUID - no Number()
      content: value,
      role: MessageRole.USER,
      type: MessageType.RESULT,
    },
  });

  await inngest.send({
    name: "code-agent/run",
    data: {
      value: value,
      projectId: projectId,  // ✅ String UUID - no Number()
    },
  });

  return newMessage;
};

export const getMessages = async (projectId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (!projectId) throw new Error("Project ID is required");

  // Verify project ownership
  const project = await db.project.findFirst({  // ✅ findFirst instead of findUnique
    where: {
      id: projectId,         // ✅ String UUID - no Number()
      userId: user.id,
    },
  });

  if (!project) throw new Error("Project not found or unauthorized");

  const messages = await db.message.findMany({
    where: {
      projectId: projectId,  // ✅ String UUID - no Number()
    },
    orderBy: {
      updatedAt: "asc",
    },
    include: {
      fragments: true,
    },
  });

  return messages;
};