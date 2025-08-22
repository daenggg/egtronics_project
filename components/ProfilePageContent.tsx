"use client";

import { CategoryFilter } from "./category-filter";
import HomePageClient from "../components/HomePageClient"; // 또는 components 폴더로 옮겼다면 그 경로

export default function ProfilePageContent() {
  return (
    <>
      <CategoryFilter />
      <HomePageClient />
    </>
  );
}