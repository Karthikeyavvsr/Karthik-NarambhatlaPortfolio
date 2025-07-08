"use client";
import { Home, User, Briefcase } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

export function NavBarWrapper() {
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "About", url: "/about", icon: User },
    { name: "Portfolio", url: "/portfolio", icon: Briefcase },
  ];
  return <NavBar items={navItems} />;
} 