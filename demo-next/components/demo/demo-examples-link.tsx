type DemoExamplesLinkProps = {
  href: string
}

export function DemoExamplesLink({ href }: DemoExamplesLinkProps) {
  return (
    <a
      href={href}
      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:text-[#00a86a]"
      rel="noreferrer"
      target="_blank"
    >
      See API usage and token credits
    </a>
  )
}
