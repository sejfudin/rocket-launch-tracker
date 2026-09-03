interface NonAuthLayoutProps {
  children: React.ReactNode;
}

export const NonAuthLayout = ({ children }: NonAuthLayoutProps) => {
  return (
    <div className="flex h-full min-h-screen justify-end self-stretch bg-elevation-fill-default-2">
      <div className="flex min-h-screen w-1/2 flex-col items-center justify-start bg-elevation-fill-default-1 pt-32">
        {children}
      </div>
    </div>
  );
};
