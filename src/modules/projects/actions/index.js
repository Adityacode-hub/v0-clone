"use server";

import { inngest } from "../../../inngest/client";
import db from "@/lib/db";
import { MessageRole, MessageType } from "@prisma/client";
import { generateSlug } from "random-word-slugs";
import { getCurrentUser } from "@/modules/auth/actions";
import { consumeCredits } from "@/lib/usage";

/**
 * Fetches all projects belonging to the current authenticated user.
 */
export const getProjects = async () => {
  const user = await getCurrentUser();

  if (!user) {
    console.error("Auth Error: No user record found in the database.");
    throw new Error("Unauthorized");
  }

  return await db.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Creates a new project, handles credit consumption, and triggers an Inngest function.
 */
export const createProject = async (value) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (!value) throw new Error("Project value/prompt is required");

  try {
    await consumeCredits();
  } catch (error) {
    throw new Error("Insufficient credits or request limit reached.");
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

  await inngest.send({
    name: "code-agent/run",
    data: {
      value: value,
      projectId: newProject.id,
    },
  });

  return newProject;
};

/**
 * Fetches a single project by ID, ensuring the current user owns it.
 */
export const getProjectById = async (projectId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (!projectId) throw new Error("Project ID is required");

  const project = await db.project.findFirst({
    where: {
      id: projectId,        // ✅ String UUID - no Number() conversion
      userId: user.id,      // ✅ String UUID
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found or you do not have permission to view it.");
  }

  return project;
};