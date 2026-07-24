import varlexawordmark from '../assets/VarlexaAI.png'

function Brandwordmarkk({ className = '', alt = 'VARLEXA AI' }) {
  const classNames = ['brand-wordmark', className].filter(Boolean).join(' ')

  return <img className={classNames} src={varlexawordmark} alt={alt} />
}

export default Brandwordmarkk
