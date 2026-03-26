import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "e2b";

export const helloWorld = inngest.createFunction(
  { id: "hello-coder" },
  { event: "agent/hello" },

  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sbx = await Sandbox.create("v0-nextjs-build-new-v2");
      return sbx.sandboxId;
    });

    const helloAgent = createAgent({
      name: "hello-agent",
      description: "A simple agent that says hello",
      system: "You are a helpful assistant. Always greet with enthusiasm",
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const { output } = await helloAgent.run("Say Hello to the user!");

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sbx = await Sandbox.connect(sandboxId);
      const host = sbx.getHost(3000);
      return `http://${host}`;
    });

    return {
      message: output[0].content,
      url: sandboxUrl,
    };
  }
);