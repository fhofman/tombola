import { siteConfig } from "@/config/site";

export function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 w-full px-20 text-center">
        <h1 className="text-6xl font-bold">{siteConfig.name}</h1>
        <p className="mt-3 text-2xl">{siteConfig.description}</p>
      </main>
    </div>
  );
}
