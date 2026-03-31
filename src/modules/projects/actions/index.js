"use server";

import { inngest } from "../../../inngest/client";
import db from "@/lib/db";
import { MessageRole, MessageType } from "@prisma/client";
import { generateSlug } from "random-word-slugs";
import { getCurrentUser } from "@/modules/auth/actions";
import { consumeCredits } from "@/lib/usage";

export const getProjects = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const projects = await db.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
};

export const createProject = async (value) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // ✅ Fixed: Error() mein string pass karo, object nahi
  try {
    await consumeCredits();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Something went wrong");
    } else {
      throw new Error("Too many requests");
    }
  }

  const newProject = await db.project.create({
    data: {
      name: generateSlug(2, { format: "kebab" }),
      userId: user.id,
      messages: {
        create: {
          content: value,
          role: MessageRole.USER,
          type: MessageType.RESULT,
        },
      },
    },
  });

  // ✅ Fixed: inngest.send() ko try-catch mein wrap kiya
  try {
    await inngest.send({
      name: "code-agent/run",
      data: {
        value: value,
        projectId: newProject.id,
      },
    });
  } catch (error) {
    console.error("Inngest send failed:", error);
    // Project ban gaya hai, sirf background job fail hua
    // Aap chahein toh yahan project delete bhi kar sakte ho
  }

  return newProject;
};

export const getProjectById = async (projectId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const project = await db.project.findUnique({
    where: {
      id: Number(projectId),
      userId: user.id,
    },
  });

  if (!project) throw new Error("Project not found");

  return project;
};