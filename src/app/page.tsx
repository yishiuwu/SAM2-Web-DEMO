import ImageUpload from "@/components/ImageUpload";
import PromptPlaceholder from "@/components/PromptPlaceholder";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      
      <ImageUpload />
      
    </main>
  );
}
