"use client";

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const getErrorMessage = (error: string) => {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration. Please try again later.'
    case 'AccessDenied':
      return 'Access denied. You do not have permission to sign in.'
    case 'Verification':
      return 'The verification link may have expired or already been used.'
    case 'OAuthSignin':
      return 'Error occurred while signing in with Google. Please try again.'
    case 'OAuthCallback':
      return 'Error occurred during Google authentication. Please try again.'
    case 'OAuthAccountNotLinked':
      return 'This email is already associated with a different sign-in method. Please sign in using your original account.'
    case 'Database':
      return 'Database error occurred. Please try again later.'
    case 'Signin':
      return 'Failed to sign in. Please check your credentials and try again.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

// Separate component to handle URL parameters
function ErrorHandler({ onError }: { onError: (message: string) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      onError(getErrorMessage(error))
    }
  }, [searchParams, onError])

  return null
}

export default function AuthError() {
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={null}>
          <ErrorHandler onError={setErrorMessage} />
        </Suspense>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
        </div>

        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Sign In
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}