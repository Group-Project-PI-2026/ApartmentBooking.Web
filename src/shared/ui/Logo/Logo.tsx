import logoDark from '@/shared/assets/logo/logo-dark.svg'
import logoMark from '@/shared/assets/logo/logo-mark.svg'
import logo from '@/shared/assets/logo/logo.svg'

const sources = {
  default: { src: logo, width: 158, height: 52 },
  dark: { src: logoDark, width: 158, height: 52 },
  mark: { src: logoMark, width: 48, height: 52 },
}

interface Props {
  variant?: keyof typeof sources
  className?: string
}

export function Logo({ variant = 'default', className }: Props) {
  const { src, width, height } = sources[variant]
  return <img src={src} width={width} height={height} alt="MyRent" className={className} />
}
