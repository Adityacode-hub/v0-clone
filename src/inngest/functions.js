import { inngest } from "./client";
import { gemini, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import { z } from "zod";
import { PROMPT } from "@/prompt";
import { lastAssistantTextMessageContent } from "./utils";

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },

  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sbx = await Sandbox.create("v0-nextjs-build-new-v2");
      return sbx.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: gemini({ model: "gemini-2.0-flash-lite" }), // ✅

      tools: [
        createTool({
          name: "terminal",
          description: "You can use the computer terminal to access anything you want",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await Sandbox.connect(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data) => { buffers.stdout += data; },
                  onStderr: (data) => { buffers.stderr += data; },
                });
                return result.stdout;
              } catch (error) {
                console.log(`command failed:${error}\n stdout:${buffers.stdout}\n stderr:${buffers.stderr}`);
                return `Error: ${error}`;
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "This is used to create or update the files in sandbox",
          parameters: z.object({
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
            })),
          }),
          handler: async ({ files }, { step }, network) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network?.state?.data?.files || {};
                const sandbox = await Sandbox.connect(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
              } catch (error) {
                return "Error: " + error;
              }
            });
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),

        createTool({
          name: "readFile",
          description: "This is used to read the file",
          parameters: z.object({
            path: z.string().describe("the path of the file to read"),
          }),
          handler: async ({ path }, { step }) => {
            const content = await step?.run("readFile", async () => {
              try {
                const sandbox = await Sandbox.connect(sandboxId);
                const content = await sandbox.files.read(path);
                return content;
              } catch (error) {
                return "Error: " + error;
              }
            });
            return content;
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter:10, // ✅ keep low to save quota
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value);

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sbx = await Sandbox.connect(sandboxId);
      const host = sbx.getHost(3000);
      return `http://${host}`;
    });

    return {
      url: sandboxUrl,
      title: "Untitled",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);