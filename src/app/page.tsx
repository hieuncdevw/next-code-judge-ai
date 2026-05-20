import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Practice Coding",
    description:
      "Solve algorithm problems by difficulty, topic, and learning path.",
  },
  {
    title: "Automatic Judging",
    description:
      "Run and submit code with automated evaluation powered by Judge0.",
  },
  {
    title: "Multi-agent AI Mentor",
    description:
      "Get hints, error analysis, and code review from specialized AI agents.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Next Code Judge AI
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl">
            An online coding practice platform with automatic code judging and
            a multi-agent AI mentor.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/home">Go to Dashboard</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/workspace">Open Workspace</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid w-full gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="space-y-3 p-6 text-left">
                <h2 className="text-xl font-semibold">{feature.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}