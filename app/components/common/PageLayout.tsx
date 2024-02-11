export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const layoutClassName =
    'm-auto flex min-h-full flex-col space-y-4 bg-gray-800 p-4 sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-7xl'

  return <section className={layoutClassName}>{children}</section>
}
