import Navbar from "@/components/Navbar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col min-h-screen py-2">
      <header>
        <Navbar />
      </header>

      <div className="px-2 md:px-4 my-4">
        <div>{children}</div>
      </div>
    </main>
  );
}
