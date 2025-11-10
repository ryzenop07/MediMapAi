"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Action = { href: string; label: string; variant?: "default" | "secondary" | "destructive" }
export function RoleCard({
  title,
  description,
  imageSrc,
  actions = [],
}: {
  title: string
  description: string
  imageSrc: string
  actions?: Action[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-pretty">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <img
            src={imageSrc || "/placeholder.svg"}
            alt={`${title} illustration`}
            className="w-24 h-24 rounded-lg object-cover border border-border"
          />
          <div className="ml-auto flex gap-2">
            {actions.map((a) => (
              <Button
                key={a.href + a.label}
                asChild
                variant={a.variant ?? "default"}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href={a.href}>{a.label}</Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
