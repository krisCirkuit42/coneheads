import { useEffect, useState } from 'react'

import coneheads from '../data/coneheads'
import supabase from '../lib/supabase'

function PendingSightings() {
  const [sightings, setSightings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [moderatingId, setModeratingId] = useState(null)
  const [moderationMessage, setModerationMessage] = useState('')

  const loadPendingSightings = async () => {
    setLoading(true)
    setLoadError('')

    const { data, error } = await supabase
      .from('finder_submissions')
      .select(
        `
          id,
          conehead_number,
          image_path,
          location,
          caption,
          finder_name,
          status,
          created_at
        `
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Pending sightings load error:', error)

      setLoadError(
        'Pending sightings could not be loaded.'
      )
      setLoading(false)
      return
    }

    const sightingsWithPhotos = await Promise.all(
      data.map(async (sighting) => {
        const { data: signedPhoto, error: signedUrlError } =
          await supabase.storage
            .from('finder-submissions')
            .createSignedUrl(
              sighting.image_path,
              60 * 60
            )

        if (signedUrlError) {
          console.error(
            'Signed photo URL error:',
            signedUrlError
          )

          return {
            ...sighting,
            photoUrl: '',
          }
        }

        const conehead = coneheads.find(
          (item) =>
            item.number === sighting.conehead_number
        )

        return {
          ...sighting,
          photoUrl: signedPhoto.signedUrl,
          coneheadName:
            conehead?.name || 'Unknown Conehead',
        }
      })
    )

    setSightings(sightingsWithPhotos)
    setLoading(false)
  }

  useEffect(() => {
    loadPendingSightings()
  }, [])

  const approveSighting = async (sighting) => {
    setModeratingId(sighting.id)
    setModerationMessage('')

    const { error: copyError } = await supabase.storage
      .from('finder-submissions')
      .copy(
        sighting.image_path,
        sighting.image_path,
        {
          destinationBucket: 'approved-sightings',
        }
      )

    if (copyError) {
      console.error(
        'Approved sighting photo copy error:',
        copyError
      )

      setModerationMessage(
        'The photograph could not be moved into the approved gallery.'
      )
      setModeratingId(null)
      return
    }

    const { error: databaseError } = await supabase
      .from('finder_submissions')
      .update({
        status: 'approved',
      })
      .eq('id', sighting.id)

    if (databaseError) {
      console.error(
        'Finder approval database error:',
        databaseError
      )

      setModerationMessage(
        'The photograph was copied, but the sighting could not be marked as approved.'
      )
      setModeratingId(null)
      return
    }

    setSightings((currentSightings) =>
      currentSightings.filter(
        (item) => item.id !== sighting.id
      )
    )

    setModerationMessage('Sighting approved.')
    setModeratingId(null)
  }

  const rejectSighting = async (sightingId) => {
    setModeratingId(sightingId)
    setModerationMessage('')

    const { error } = await supabase
      .from('finder_submissions')
      .update({
        status: 'rejected',
      })
      .eq('id', sightingId)

    if (error) {
      console.error(
        'Finder rejection error:',
        error
      )

      setModerationMessage(
        'Could not reject this sighting.'
      )
      setModeratingId(null)
      return
    }

    setSightings((currentSightings) =>
      currentSightings.filter(
        (item) => item.id !== sightingId
      )
    )

    setModerationMessage('Sighting rejected.')
    setModeratingId(null)
  }

  if (loading) {
    return (
      <section className="pending-sightings">
        <h2>Pending Sightings</h2>
        <p>Checking for new Conehead reports...</p>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="pending-sightings">
        <h2>Pending Sightings</h2>
        <p>{loadError}</p>
      </section>
    )
  }

  return (
    <section className="pending-sightings">
      <h2>Pending Sightings</h2>

      {moderationMessage && (
        <p className="form-message">
          {moderationMessage}
        </p>
      )}

      {sightings.length === 0 ? (
        <p>No sightings are waiting for review.</p>
      ) : (
        sightings.map((sighting) => (
          <article
            className="pending-sighting"
            key={sighting.id}
          >
            <h3>
              Conehead No. {sighting.conehead_number}:{' '}
              {sighting.coneheadName}
            </h3>

            {sighting.photoUrl ? (
              <img
                src={sighting.photoUrl}
                alt={`Submitted sighting of ${sighting.coneheadName}`}
              />
            ) : (
              <p>
                Photograph could not be loaded.
              </p>
            )}

            {sighting.location && (
              <p>
                <strong>Location:</strong>{' '}
                {sighting.location}
              </p>
            )}

            {sighting.caption && (
              <p>
                <strong>What happened:</strong>{' '}
                {sighting.caption}
              </p>
            )}

            {sighting.finder_name && (
              <p>
                <strong>Submitted by:</strong>{' '}
                {sighting.finder_name}
              </p>
            )}

            <p className="release-date">
              Submitted{' '}
              {new Date(
                sighting.created_at
              ).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            <div className="moderation-buttons">
              <button
                type="button"
                disabled={moderatingId === sighting.id}
                onClick={() =>
                  approveSighting(sighting)
                }
              >
                {moderatingId === sighting.id
                  ? 'Working...'
                  : 'Approve'}
              </button>

              <button
                type="button"
                disabled={moderatingId === sighting.id}
                onClick={() =>
                  rejectSighting(sighting.id)
                }
              >
                Reject
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  )
}

export default PendingSightings