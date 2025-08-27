import ConviteClient from './ConviteClient'

interface PageProps {
  params: Promise<{
    nomeDoUsuario: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { nomeDoUsuario } = await params
  return <ConviteClient nomeDoUsuario={nomeDoUsuario} />
}
