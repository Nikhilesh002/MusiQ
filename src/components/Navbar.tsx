'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X, Music } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const { setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const session=useSession();

  return (
    <nav className="bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-5 h-16">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <Music className="h-8 w-8 text-purple-600 dark:text-purple-400 inline-block pb-1" />
                <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Musiq</span>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Discover</Link>
                  <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Library</Link>
                  <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">For Creators</Link>
                </div>
              </div>
            </div>
            <div className="">
              {
                (session && session.status==="authenticated") ?
                <Button onClick={()=>signOut()}>SignOut</Button> :
                <Button onClick={()=>signIn()}>SignIn</Button>
              }
            </div>
          </div>

          <div className="hidden md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Discover</Link>
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Library</Link>
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">For Creators</Link>
          </div>
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </nav>
  )
}