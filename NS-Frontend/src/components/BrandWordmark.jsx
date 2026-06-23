import varlexaWordmark from '../assets/verlexaai-transparent.png'

function BrandWordmark({ className = '', alt = 'VARLEXA AI' }) {
  const classNames = ['brand-wordmark', className].filter(Boolean).join(' ')

  return <img className={classNames} src={varlexaWordmark} alt={alt} />
}

export default BrandWordmark
