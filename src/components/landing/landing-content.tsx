'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/providers/language-provider'

const icons = ['/globe.svg', '/window.svg', '/file.svg']

export default function LandingContent() {
  const { messages } = useLanguage()

  return (
    <div className="bg-white">
      <header className="fixed w-full bg-white/80 backdrop-blur z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex w-full items-center justify-between border-b border-gray-200 py-6 lg:border-none">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">{messages.navigation.title}</span>
            </div>
            <div className="ml-10 space-x-4">
              <Link
                href="/auth/signin"
                className="inline-block rounded-md border border-transparent bg-indigo-500 py-2 px-4 text-base font-medium text-white hover:bg-opacity-75"
              >
                {messages.landing.auth.signIn}
              </Link>
              <Link
                href="/auth/register"
                className="inline-block rounded-md border border-transparent bg-white py-2 px-4 text-base font-medium text-indigo-600 hover:bg-indigo-50"
              >
                {messages.landing.auth.register}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="relative px-4 py-32 sm:px-6 sm:py-40 lg:py-56">
              <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-gray-900">{messages.landing.hero.title}</span>
                <span className="block text-indigo-600">{messages.landing.hero.subtitle}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-gray-500">
                {messages.landing.hero.description}
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:px-8"
                  >
                    {messages.landing.hero.cta.getStarted}
                  </Link>
                  <Link
                    href="#features"
                    className="flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-indigo-200 sm:px-8"
                  >
                    {messages.landing.hero.cta.learnMore}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div id="features" className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-lg font-semibold text-indigo-600">{messages.landing.features.title}</h2>
              <p className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                {messages.landing.features.subtitle}
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                {messages.landing.features.description}
              </p>
            </div>

            <div className="mt-20">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
                {messages.landing.features.items.map((feature, index) => (
                  <div key={`feature-${index}-${feature.title}`} className="relative">
                    <div className="space-y-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
                        <Image
                          src={icons[index]}
                          alt={feature.title}
                          width={24}
                          height={24}
                        />
                      </div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} {messages.landing.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}