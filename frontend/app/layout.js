import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import BackToTop from "@/components/BackToTop"; // <-- Thêm dòng này

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"], display: "swap" });

export const metadata = {
  title: "TickTock",
  description: "E-Commerce with Next.js ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased text-gray-700`} suppressHydrationWarning={true}>
        <Toaster />
        <AppContextProvider>
          {children}
          <BackToTop /> {/* <-- Thêm vào đây */}
        </AppContextProvider>
      </body>
    </html>
  );
}
