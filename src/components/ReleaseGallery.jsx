import { useEffect, useState } from 'react'

import supabase from '../lib/supabase'

function ReleaseGallery({ conehead }) {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let componentIsActive = true

    const loadPlacements = async () => {
      setLoading(true)
      setLoadError('')

      const { data, error } = await supabase
        .from('placements')
        .select(
          'id, image_path, location, caption, released_at'
        )
        .eq('conehead_number', conehead.number)
        .order('released_at', { ascending: false })

      if (!componentIsActive) {
        return
      }

      if (error) {
        setLoadError(
          'The release archive could not be loaded.'
        )
        setLoading(false)
        return
      }

      const placementsWithUrls = data.map((placement) => {
        const { data: publicPhoto } = supabase.storage
          .from('placements')
          .getPublicUrl(placement.image_path)

        return {
          ...placement,
          photoUrl: publicPhoto.publicUrl,
        }
      })

      setPlacements(placementsWithUrls)
      setLoading(false)
    }

    loadPlacements()

    return () => {
      componentIsActive = false
    }
  }, [conehead.number])

  if (loading) {
    return (
      <section className="release-gallery">
        <h2>Released into the Wild</h2>
        <p>Checking the release archive...</p>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="release-gallery">
        <h2>Released into the Wild</h2>
        <p>{loadError}</p>
      </section>
    )
  }

  if (placements.length === 0) {
    return (
      <section className="release-gallery">
        <h2>Released into the Wild</h2>
        <p>
          This Conehead has not yet been released into the wild.
        </p>
      </section>
    )
  }

  return (
    <section className="release-gallery">
      <h2>Released into the Wild</h2>

      {placements.map((placement) => (
        <article
          className="release-entry"
          key={placement.id}
        >
          <img
            src={placement.photoUrl}
            alt={`${conehead.name} at ${placement.location}`}
          />

          <h3>{placement.location}</h3>

          {placement.caption && (
            <p>{placement.caption}</p>
          )}

          <p className="release-date">
            Released{' '}
            {new Date(
              placement.released_at
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

export default ReleaseGallery