import { Navbar } from "@/components/shared/layout/navbar/Navbar";

interface FullLayoutProps {
  children: React.ReactNode;
}

export const FullLayout = ({ children }: FullLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-elevation-fill-default-1">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};
