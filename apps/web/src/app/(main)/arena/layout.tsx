import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edebi Arena - Canlı Hikaye Düelloları",
  description: "Zihninizin sınırlarını zorlamaya hazır mısınız? Kelimelerin savaştığı, sadece en güçlü kalemlerin ayakta kaldığı edebi tiyatroya adım atın. Arkadaşlarınıza meydan okuyun, canlı hikaye düelloları yapın ve oylamaya katılın.",
  keywords: ["hikaye düellosu", "edebiyat yarışması", "kelime savaşı", "yaratıcı yazarlık", "canlı hikaye yazma", "readixon arena"],
  openGraph: {
    title: "Edebi Arena - Canlı Hikaye Düelloları | Readixon",
    description: "Kelimelerin savaştığı edebi tiyatroya adım atın. Arkadaşlarınıza meydan okuyun ve hikayenizi canlı olarak yazın.",
    url: "https://readixon.com/arena",
  },
  twitter: {
    title: "Edebi Arena - Canlı Hikaye Düelloları | Readixon",
    description: "Kelimelerin savaştığı edebi tiyatroya adım atın. Arkadaşlarınıza meydan okuyun ve hikayenizi canlı olarak yazın.",
  }
};

export default function ArenaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
