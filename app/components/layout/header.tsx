"use client"

import { Film, List, Home, Toolbox, Eye, Star } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button, Dialog } from "react-aria-components";
import Link from 'next/link'

export default function Header() {

  const SIDEBAR_CONTENT = [
    {
      name: "Home",
      icon: <Home size={15} className="min-w-3 h-auto text-white/70" />,
      link: "/dashboard",
      isExpanded: false,
    },
    {
      name: "Watchlist",
      icon: <Eye size={15} className="min-w-3 h-auto text-white/70" />,
      link: "/watchlist",
      isExpanded: false,
    },
    {
      name: "Ratings",
      icon: <Star size={15} className="min-w-3 h-auto text-white/70" />,
      link: "/ratings",
      isExpanded: false,
    },
    {
      name: "Settings",
      icon: <Toolbox size={15} className="min-w-3 h-auto text-white/70" />,
      link: "/settings",
      isExpanded: true,
    },
  ];
    return (
      <header className="fixed z-50 flex items-center px-5 py-1 justify-between bg-slate-950/55 w-full h-[5%] border-b border-gray-800 backdrop-blur-xl">
        <div className="flex gap-2">
          <Film size={18} className="min-w-3 h-auto" />
          <p className="text-2xl font-semibold">Film.io</p>
        </div>

        <Dialog role="dialog" aria-label="menu">
          <SheetTrigger aria-label="open-menu">
            <Button className="h-full w-fit items-center justify-center block sm:hidden">
              <List size={18} className="min-w-5 cursor-pointer" />
            </Button>
            <SheetContent
              side="top"
              className="border border-white/25 rounded-b-2xl shadow-xl bg-slate-900/55 backdrop-blur-2xl w-full h-fit p-5"
            >
              <p className="mb-5 text-3xl font-semibold">Menu</p>
              {SIDEBAR_CONTENT.map((item) => (
                <div
                  className="my-1 hover:bg-slate-800 py-1 px-5 rounded-lg"
                  key={item.name}
                >
                  <Link
                    className="text-lg font-sans font-extralight flex w-full"
                    href={item.link}
                  >
                    <Button className="flex w-full gap-5 cursor-pointer">
                      {item.icon}
                      <p>{item.name}</p>
                    </Button>
                  </Link>
                </div>
              ))}
            </SheetContent>
          </SheetTrigger>
        </Dialog>
      </header>
    );
}