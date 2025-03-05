'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/providers/language-provider'

const features = [
  { icon: '/globe.svg', color: 'bg-blue-400' },
  { icon: '/window.svg', color: 'bg-blue-400' },
  { icon: '/file.svg', color: 'bg-blue-400' },
  { icon: '/window.svg', color: 'bg-blue-400' },
  { icon: '/globe.svg', color: 'bg-blue-400' },
  { icon: '/file.svg', color: 'bg-blue-400' }
]

const stats = [
  { value: '100K+', label: 'Keywords Tracked' },
  { value: '50K+', label: 'Backlinks Monitored' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' }
]

const testimonials = [
  {
    text: "This tool has helped us improve our search rankings significantly. The keyword tracking and technical SEO features are invaluable.",
    author: "Sarah Johnson",
    role: "Marketing Director"
  },
  {
    text: "The backlink analysis and monitoring capabilities have transformed how we manage our SEO strategy.",
    author: "Michael Chen",
    role: "SEO Specialist"
  },
  {
    text: "Comprehensive analytics integration and actionable insights make this tool essential for our agency.",
    author: "Emma Davis",
    role: "Agency Owner"
  }
]

const plans = [
  {
    name: 'Starter',
    price: '29',
    features: [
      '1 Project',
      'Basic Technical SEO',
      'Limited Analytics',
      'Email Support'
    ]
  },
  {
    name: 'Professional',
    price: '99',
    features: [
      'Up to 5 Projects',
      'Advanced Technical SEO',
      'Full Analytics Integration',
      'Priority Support'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '299',
    features: [
      'Unlimited Projects',
      'Custom Solutions',
      'API Access',
      'Dedicated Support'
    ]
  }
]

const faqs = [
  {
    question: 'How often are keyword rankings updated?',
    answer: 'Keywords are tracked daily with our automated ranking system, ensuring you always have the most current data.'
  },
  {
    question: 'Can I integrate with Google Analytics and Search Console?',
    answer: 'Yes! We offer seamless integration with both Google Analytics and Search Console to provide comprehensive insights.'
  },
  {
    question: 'Do you support international SEO tracking?',
    answer: 'We support keyword tracking and SEO analysis for all major search engines and countries worldwide.'
  }
]

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
                href="/auth/signin"
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
        <div className="relative overflow-hidden">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
            <div className="mt-5 max-w-xl text-center mx-auto">
              <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl">
                {messages.landing.hero.title}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                  {' '}{messages.landing.hero.subtitle}
                </span>
              </h1>
            </div>

            <div className="mt-5 max-w-3xl text-center mx-auto">
              <p className="text-lg text-gray-600">{messages.landing.hero.description}</p>
            </div>

            <div className="mt-8 grid gap-3 w-full sm:inline-flex sm:justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border border-transparent text-white text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-white py-3 px-6"
              >
                {messages.landing.hero.cta.getStarted}
                <svg className="w-2.5 h-2.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5.27921 2L10.9257 7.64645C11.1209 7.84171 11.1209 8.15829 10.9257 8.35355L5.27921 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Link>
              <Link
                href="#features"
                className="inline-flex justify-center items-center gap-x-3.5 text-sm text-gray-800 hover:text-gray-600 font-medium rounded-full border border-gray-200 hover:border-gray-300 shadow-sm py-3 px-6 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
              >
                {messages.landing.hero.cta.learnMore}
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-10 relative max-w-5xl mx-auto">
              <div className="w-full rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white p-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Keyword Rankings Panel */}
                  <div className="col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Keyword Rankings</h3>
                      <span className="text-sm text-green-600 font-medium">↑ 12% this month</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Average Position', value: '4.2', change: '-0.8' },
                        { label: 'Keywords in Top 10', value: '143', change: '+12' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500">{stat.label}</div>
                          <div className="mt-1 flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                            <span className={`ml-2 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="border-l pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                        Add Keywords
                      </button>
                      <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Check Rankings
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { text: 'New backlink detected from example.com', time: '2h ago' },
                      { text: 'Rankings updated for 234 keywords', time: '4h ago' },
                      { text: 'Technical audit completed', time: '6h ago' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{activity.text}</span>
                        <span className="text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent bottom-[inherit] z-10"></div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-y border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 py-12 text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="mx-auto">
                  <div className="text-3xl font-bold text-indigo-600">{stat.value}</div>
                  <div className="mt-2 text-sm font-medium text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features section */}
        <div id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">{messages.landing.features.title}</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{messages.landing.features.subtitle}</p>
              <p className="mt-6 text-lg leading-8 text-gray-600">{messages.landing.features.description}</p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {messages.landing.features.items.map((feature, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="mb-6">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${features[index].color} text-white`}>
                        <Image
                          src={features[index].icon}
                          alt={feature.title}
                          width={24}
                          height={24}
                          className="transition-transform group-hover:scale-110"
                        />
                      </div>
                    </div>
                    <div className="flex flex-auto flex-col">
                      <h3 className="text-xl font-semibold leading-8 text-gray-900">{feature.title}</h3>
                      <p className="mt-2 flex flex-auto text-base leading-7 text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gradient-to-b from-indigo-50 to-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Testimonials</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Trusted by SEO Professionals</p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="relative rounded-2xl bg-white p-6 shadow-xl shadow-gray-900/10">
                  <figure className="isolate">
                    <blockquote className="text-gray-900">
                      <p>{`"${testimonial.text}"`}</p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <div>
                        <div className="font-semibold">{testimonial.author}</div>
                        <div className="text-gray-600">{testimonial.role}</div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Choose your plan</p>
            </div>
            <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${
                    plan.popular ? 'z-10 scale-105 shadow-xl ring-gray-900/10' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-x-4">
                      <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
                      {plan.popular && (
                        <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                          Most popular
                        </p>
                      )}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      Perfect for {plan.name.toLowerCase()} businesses and teams
                    </p>
                    <p className="mt-6 flex items-baseline gap-x-1">
                      <span className="text-4xl font-bold tracking-tight text-gray-900">${plan.price}</span>
                      <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                    </p>
                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex gap-x-3">
                          <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/auth/signin"
                    className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    Get started today
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
              <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently asked questions</h2>
              <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
                {faqs.map((faq, index) => (
                  <div key={index} className="pt-6">
                    <dt className="text-lg font-semibold leading-7 text-gray-900">{faq.question}</dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-sm leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} {messages.landing.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
