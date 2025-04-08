import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil | Synapsy",
  description: "Gerencie seu perfil e preferências no Synapsy",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 