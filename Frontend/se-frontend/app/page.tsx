import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Services />
      <Footer />
      <ChatBot />
    </main>
  );
}
