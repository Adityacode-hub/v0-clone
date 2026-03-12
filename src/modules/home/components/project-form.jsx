"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import TextareaAutosize from "react-textarea-autosize"
import { ArrowUpIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { onInvoke } from "../actions"

import { Button } from "@/components/ui/button"

const formSchema = z.object({
  content: z
    .string()
    .min(1, "Project description is required")
    .max(1000, "Description is too long"),
})

const PROJECT_TEMPLATES = [
  {
    emoji: "🎬",
    title: "Build a Netflix clone",
    prompt:
      "Build a Netflix-style homepage with a hero banner, movie section with responsive cards, and a modal for viewing details.",
  },
  {
    emoji: "📊",
    title: "Build an admin dashboard",
    prompt:
      "Create a modern admin dashboard with charts and analytics widgets.",
  },
  {
    emoji: "📋",
    title: "Build a Kanban board",
    prompt:
      "Create a drag and drop kanban board similar to Trello.",
  },
  {
    emoji: "📁",
    title: "Build a file manager",
    prompt:
      "Create a file manager UI with folder navigation.",
  },
  {
    emoji: "📺",
    title: "Build a YouTube clone",
    prompt:
      "Create a YouTube homepage with video cards and sidebar.",
  },
  {
    emoji: "🛍",
    title: "Build a store page",
    prompt:
      "Create an ecommerce landing page with product cards.",
  },
  {
    emoji: "🏡",
    title: "Build an Airbnb clone",
    prompt:
      "Create a booking UI similar to Airbnb.",
  },
  {
    emoji: "🎵",
    title: "Build a Spotify clone",
    prompt:
      "Create a Spotify style music dashboard with playlists.",
  },
]

const ProjectForm = () => {

  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  })

  const handleTemplate = (prompt) => {
    form.setValue("content", prompt)
  }
    const onInvokeAi = async () => {
    try {
      const res = await onInvoke()
      console.log(res)
      toast.success("Done")
    } catch (error) {
      console.log(error)
      toast.error("Invoke failed")
    }
  }

  const onSubmit = async (values) => {
    try {

      setLoading(true)

      console.log(values)

      toast.success("Prompt submitted 🚀")

    } catch (error) {

      toast.error("Something went wrong")

    } finally {

      setLoading(false)

    }
   
  }

  return (
    <div className="space-y-8">

      {/* Templates */}
      <Button onClick={onInvokeAi}>
        Invoke AI Agent
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        {PROJECT_TEMPLATES.map((template, index) => (

          <button
            key={index}
            type="button"
            onClick={() => handleTemplate(template.prompt)}
            className="p-4 border rounded-xl bg-background hover:bg-muted transition text-left"
          >

            <div className="text-2xl">{template.emoji}</div>

            <div className="font-medium mt-2">
              {template.title}
            </div>

          </button>

        ))}

      </div>

      {/* Prompt Input */}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border rounded-xl p-4 flex items-center gap-2"
      >

        <TextareaAutosize
          {...form.register("content")}
          placeholder="Describe what you want to create..."
          className="flex-1 resize-none bg-transparent outline-none"
        />

        <Button type="submit" disabled={loading}>

          {loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <ArrowUpIcon className="w-4 h-4" />
          )}

        </Button>

      </form>

    </div>
  )
}

export default ProjectForm