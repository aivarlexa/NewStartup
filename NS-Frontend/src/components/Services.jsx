import { useEffect, useRef } from 'react'
import { capabilities, capabilityVisuals } from '../data/siteData'
import ServiceCard from './ServiceCard'
import ServiceVisualPanel from './ServiceVisualPanel'

function Services() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const capabilitiesSection = sectionRef.current

    if (!capabilitiesSection) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        entry.target.classList.toggle('visible', entry.isIntersecting)
      },
      {
        rootMargin: '0px 0px -20% 0px',
        threshold: 0,
      },
    )

    observer.observe(capabilitiesSection)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const serviceRows = Array.from(sectionRef.current?.querySelectorAll('.capability-row') || [])

    if (!serviceRows.length) {
      return undefined
    }

    const revealQueue = []
    const timeouts = new Set()
    let isAnimating = false

    function removeFromQueue(row) {
      const queuedIndex = revealQueue.indexOf(row)

      if (queuedIndex >= 0) {
        revealQueue.splice(queuedIndex, 1)
      }

      row.dataset.queued = 'false'
    }

    function resetRow(row) {
      const serviceCard = row.querySelector('.service-card, .capability-card')

      serviceCard?.classList.remove('visible')
      row.classList.remove('is-visible', 'visible', 'revealed')
      row.dataset.queued = 'false'
      row.dataset.inView = 'false'
      removeFromQueue(row)
    }

    function revealNextRow() {
      if (isAnimating || revealQueue.length === 0) {
        return
      }

      isAnimating = true
      const row = revealQueue.shift()
      row.dataset.queued = 'false'

      const revealTimeoutId = window.setTimeout(() => {
        timeouts.delete(revealTimeoutId)

        if (row.dataset.inView === 'true') {
          const serviceCard = row.querySelector('.service-card, .capability-card')

          serviceCard?.classList.add('visible')
          row.classList.remove('is-visible')
          void row.offsetWidth
          row.classList.add('is-visible', 'visible', 'revealed')
        }

        const queueTimeoutId = window.setTimeout(() => {
          timeouts.delete(queueTimeoutId)
          isAnimating = false
          revealNextRow()
        }, 360)

        timeouts.add(queueTimeoutId)
      }, 70)

      timeouts.add(revealTimeoutId)
    }

    function queueRow(row) {
      if (row.dataset.queued === 'true') {
        return
      }

      row.dataset.queued = 'true'
      revealQueue.push(row)
      revealQueue.sort((firstRow, secondRow) => {
        const firstTop = firstRow.getBoundingClientRect().top
        const secondTop = secondRow.getBoundingClientRect().top

        return firstTop - secondTop
      })
      revealNextRow()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => !entry.isIntersecting)
          .forEach((entry) => {
            resetRow(entry.target)
          })

        entries
          .filter((entry) => entry.isIntersecting)
          .sort((firstEntry, secondEntry) => firstEntry.boundingClientRect.top - secondEntry.boundingClientRect.top)
          .forEach((entry) => {
            const row = entry.target

            row.dataset.inView = 'true'
            queueRow(row)
          })

        revealNextRow()
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.35,
      },
    )

    serviceRows.forEach((row) => {
      row.dataset.queued = 'false'
      row.dataset.inView = 'false'
      observer.observe(row)
    })

    return () => {
      observer.disconnect()
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [])

  return (
    <section className="section-block platform-block capabilities-section" id="platform" ref={sectionRef}>
      <div className="section-heading">
        <p className="eyebrow">Capabilities</p>
        <h2 className="capabilities-heading">
          <span className="line"><span>From intelligent</span></span>
          <span className="line"><span>systems to scalable</span></span>
          <span className="line"><span>digital operations.</span></span>
        </h2>
        <p>
          Varlexa helps businesses design, build, secure, automate, and scale digital products
          with practical AI, software engineering, cloud infrastructure, and data intelligence.
        </p>
      </div>

      <div className="capability-grid">
        {capabilities.map((capability, index) => {
          const visual = capabilityVisuals[index % capabilityVisuals.length]
          const isCardLeft = index % 2 === 0

          return (
            <div
              className={`capability-row ${isCardLeft ? 'card-left' : 'card-right'}`}
              data-accent={capability.accent}
              key={capability.title}
            >
              {isCardLeft && <ServiceCard capability={capability} index={index} />}
              <ServiceVisualPanel visual={visual} />
              {!isCardLeft && <ServiceCard capability={capability} index={index} />}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Services