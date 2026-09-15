type DocsCodeBlockProps = {
  children: string
}

export function DocsCodeBlock({ children }: DocsCodeBlockProps) {
  return (
    <pre className="m-0 overflow-x-auto rounded-xl border border-cloud/20 bg-cloud-500 p-4 text-[13px] leading-relaxed text-dark">
      <code>{children}</code>
    </pre>
  )
}
