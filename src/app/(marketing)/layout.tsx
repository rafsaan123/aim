import { Hind_Siliguri } from "next/font/google";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";

const hindSiliguri = Hind_Siliguri({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-bengali",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${hindSiliguri.variable} min-h-screen font-[family-name:var(--font-bengali)]`}
      lang="bn"
    >
      <PublicNav />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
