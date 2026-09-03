import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "@/components/home/Hero";
import { MainHomeContent } from "@/components/home/MainHomeContent";
import { Footer } from "@/components/shared/layout/Footer";
import { FullLayout } from "@/components/shared/layout/FullLayout";

const HomePage = () => {
  return (
    <FullLayout>
      <Hero />
      <MainHomeContent />
      <Footer />
    </FullLayout>
  );
};

export const Route = createFileRoute("/")({
  component: HomePage,
});
