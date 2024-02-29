import { Link } from '@remix-run/react'

const HomeRoute = () => {
  return (
    <div className='m-auto flex min-h-full flex-col items-center justify-center gap-y-2 bg-gray-900'>
      <h1 className='px-4 text-center text-4xl font-bold leading-snug text-sky-600'>
        Create New Reports
      </h1>
      <h2 className='px-4 text-center text-3xl font-bold leading-snug text-orange-600'>
        In Only 4 Steps
      </h2>
      <Link
        to='process/start'
        className='mt-8 flex max-w-60 rounded-xl bg-sky-700 px-6 py-8 text-center text-3xl font-semibold uppercase text-orange-300 ring-4 ring-orange-600 hover:bg-sky-800 focus:bg-sky-800 focus-visible:outline-none'
      >
        Start Now
      </Link>
    </div>
  )
}

export default HomeRoute
