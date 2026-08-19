import { useState } from 'react'

import supabase from '../lib/supabase'

function FinderSubmission({ conehead }) {
  const [photo, setPhoto] = useState(null)
  const [location, setLocation] = useState('')
  const [caption, setCaption] = useState('')
  const [finderName, setFinderName] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)

  const submitSighting = async (event) => {
    event.preventDefault()

    if (!photo) {
      setSubmitMessage('Please choose a photograph.')
      return
    }

    setSubmitting(true)
    setSubmitMessage('Submitting sighting...')

    const timestamp = Date.now()

    const safeFileName = photo.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')

    const imagePath =
      `${conehead.number}/${timestamp}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('finder-submissions')
      .upload(imagePath, photo, {
        cacheControl: '3600',
        contentType: photo.type,
        upsert: false,
      })

    if (uploadError) {
      setSubmitMessage(
        `Photograph upload failed: ${uploadError.message}`
      )

      setSubmitting(false)
      return
    }

    const { error: databaseError } = await supabase
      .from('finder_submissions')
      .insert({
        conehead_number: conehead.number,
        image_path: imagePath,
        location: location.trim(),
        caption: caption.trim(),
        finder_name: finderName.trim(),
      })

    if (databaseError) {
      await supabase.storage
        .from('finder-submissions')
        .remove([imagePath])

      setSubmitMessage(
        `Submission failed: ${databaseError.message}`
      )

      setSubmitting(false)
      return
    }

    setPhoto(null)
    setLocation('')
    setCaption('')
    setFinderName('')
    setFileInputKey((currentKey) => currentKey + 1)

    setSubmitMessage(
      `Thank you. ${conehead.name}'s sighting has been submitted for review.`
    )

    setSubmitting(false)
  }

  return (
    <section className="finder-submission">
      <h2>Found this Conehead?</h2>

      <p>
        Add a photograph to {conehead.name}&apos;s continuing story.
        You do not need to provide your email address.
      </p>

      <form onSubmit={submitSighting}>
        <label htmlFor="finder-photo">
          Photograph
        </label>

        <input
          key={fileInputKey}
          id="finder-photo"
          type="file"
          accept="image/*"
          onChange={(event) =>
            setPhoto(event.target.files[0] || null)
          }
          required
        />

        <label htmlFor="finder-location">
          Location (optional)
        </label>

        <input
          id="finder-location"
          type="text"
          placeholder="For example: Leith Walk, Edinburgh"
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
        />

        <label htmlFor="finder-caption">
          What happened? (optional)
        </label>

        <textarea
          id="finder-caption"
          rows="4"
          placeholder="Tell us anything you'd like about the encounter."
          value={caption}
          onChange={(event) =>
            setCaption(event.target.value)
          }
        />

        <label htmlFor="finder-name">
          Your name or nickname (optional)
        </label>

        <input
          id="finder-name"
          type="text"
          placeholder="You can remain anonymous"
          value={finderName}
          onChange={(event) =>
            setFinderName(event.target.value)
          }
        />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Submitting...'
            : 'Submit Sighting'}
        </button>

        {submitMessage && (
          <p className="form-message">
            {submitMessage}
          </p>
        )}
      </form>
    </section>
  )
}

export default FinderSubmission