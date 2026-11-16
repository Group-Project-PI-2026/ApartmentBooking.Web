interface Props {
  title: string
  screen: string
}

export function PagePlaceholder({ title, screen }: Props) {
  return (
    <section>
      <h1>{title}</h1>
      <p>Figma: {screen}</p>
    </section>
  )
}
