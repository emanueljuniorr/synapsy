"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "Avatar"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-medium text-primary">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-background border border-white/10 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-sm font-medium truncate">{user.displayName}</p>
            <p className="text-xs text-foreground/60 truncate">{user.email}</p>
          </div>
          
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Perfil
          </Link>
          
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Configurações
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/5 transition-colors"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
} 