"use client";

import { useSearchParams } from "next/navigation";

export default function CreatePost() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  return <div>카테고리: {category}</div>;
}
