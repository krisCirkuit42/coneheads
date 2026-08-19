import { useEffect, useState } from 'react'

import supabase from '../lib/supabase'

function SightingsGallery({ conehead }) {
  const [sightings, setSightings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let componentIsActive = true

    const loadSightings = async () => {
      setLoading(true)
      setLoadError('')

      const { data, error } = await supabase
        .from('finder_submissions')
        .select(
          `
            id,
            image_path,
            location,
            caption,
            finder_name,
            created_at
          `
        )
        .eq('conehead_number', conehead.number)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (!componentIsActive) {
        return
      }

      if (error) {
        console.error(
          'Approved sightings load error:',
          error
        )

        setLoadError(
          'The sightings archive could not be loaded.'
        )
        setLoading(false)
        return
      }

      const sightingsWithUrls = data.map((sighting) => {
        const { data: publicPhoto } = supabase.storage
          .from('approved-sightings')
          .getPublicUrl(sighting.image_path)

        return {
          ...sighting,
          photoUrl: publicPhoto.publicUrl,
        }
      })

      setSightings(sightingsWithUrls)
      setLoading(false)
    }

    loadSightings()

    return () => {
      componentIsActive = false
    }
  }, [conehead.number])

  if (loading) {
    return (
      <section className="sightings-gallery">
        <h2>Conehead Sightings</h2>
        <p>Checking for sightings...</p>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="sightings-gallery">
        <h2>Conehead Sightings</h2>
        <p>{loadError}</p>
      </section>
    )
  }

  if (sightings.length === 0) {
    return null
  }

  return (
    <section className="sightings-gallery">
      <h2>Conehead Sightings</h2>

      {sightings.map((sighting) => (
        <article
          className="sighting-entry"
          key={sighting.id}
        >
          <img
            src={sighting.photoUrl}
            alt={`A sighting of ${conehead.name}`}
          />

          {sighting.location && (
            <h3>{sighting.location}</h3>
          )}

          {sighting.caption && (
            <p>{sighting.caption}</p>
          )}

          {sighting.finder_name && (
            <p>
              <strong>Reported by:</strong>{' '}
              {sighting.finder_name}
            </p>
          )}

          <p className="release-date">
            Sighted{' '}
            {new Date(
              sighting.created_at
            ).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </article>
      ))}
    </section>
  )
}

export default SightingsGallery