"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/base/footer";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users } from "lucide-react";
import { useUser } from "@stackframe/stack";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const UserSection = () => {
  const user = useUser();
  const isLoggedIn = !!user;

  return isLoggedIn ? (
    <div className="font-medium text-lg flex items-center space-x-2 justify-center">
      <span>Welcome back,</span>
      <span className="font-bold">{user.displayName ?? "Guest"}</span>
    </div>
  ) : (
    <div className="flex space-x-4 justify-center">
      <Button asChild variant="outline" size="lg">
        <Link href="/handler/sign-in">Log In</Link>
      </Button>
      <Button asChild size="lg">
        <Link href="/handler/sign-up">Get Started</Link>
      </Button>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="bg-card p-8 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
  >
    <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  const user = useUser();

  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard/tasks");
    }
  }, [user, router]);

  if (user) {
    return null; // Prevent rendering the landing page while redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-left relative z-10 lg:w-1/2"
              >
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  Study Smarter, Not Harder
                </h1>
                <p className="text-xl mb-8 text-muted-foreground">
                  Boost your productivity and achieve your academic goals with
                  Study Buddy - your all-in-one study management system.
                </p>
                <React.Suspense
                  fallback={
                    <div className="flex items-center space-x-2 justify-center">
                      Loading...
                    </div>
                  }
                >
                  <UserSection />
                </React.Suspense>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:w-1/2"
              >
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Students collaborating"
                  width={800}
                  height={600}
                  className="rounded-xl shadow-2xl"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Empower Your Learning Journey
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover the tools that will revolutionize your study habits and
                boost your academic performance.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={BookOpen}
                title="Smart Task Management"
                description="Prioritize assignments and track your progress with our intuitive task management system."
              />
              <FeatureCard
                icon={Clock}
                title="Intelligent Timetable"
                description="Optimize your study schedule with AI-powered timetable planning and reminders."
              />
              <FeatureCard
                icon={Users}
                title="Seamless Collaboration"
                description="Connect with peers, share resources, and work together on group projects effortlessly."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Study Habits?
              </h2>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Join thousands of students who have already improved their
                academic performance with Study Buddy.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
