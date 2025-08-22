"use client";
import { use } from "react";
import CourseDetailsPage from "@/components/courses/CourseDetailsPage";

interface Params {
  id: string;
}

export default function CoursePage({
  params,
}: Readonly<{ params: Promise<Params> }>) {
  const resolvedParams = use(params);

  return <CourseDetailsPage courseId={resolvedParams.id} />;
}
