import { useEffect, useState } from 'react'

import coneheads from '../data/coneheads'
import supabase from '../lib/supabase'
import PendingSightings from './PendingSightings'

function ReleasePage() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')

  const [coneheadNumber, setConeheadNumber] = useState('')
  const [location, setLocation] = useState('')
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState(null)

  const [publishing, setPublishing] = useState(false)
  const [publishMessage, setPublishMessage] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)

  useEffect(() => {
    const checkCurrentSession = async () => {
      const { data } = await supabase.auth.getSession()

      setSession(data.session)
      setCheckingSession(false)
    }

    checkCurrentSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const logIn = async (event) => {
    event.preventDefault()
    setLoginMessage('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoginMessage(error.message)
      return
    }

    setPassword('')
    setLoginMessage('')
  }

  const logOut = async () => {
    await supabase.auth.signOut()
    setPublishMessage('')
  }

  const publishRelease = async (event) => {
    event.preventDefault()

    if (!coneheadNumber || !photo || !location.trim()) {
      setPublishMessage(
        'Choose a Conehead, photograph and location before publishing.'
      )
      return
    }

    setPublishing(true)
    setPublishMessage('Publishing release...')

    const timestamp = Date.now()

    const safeFileName = photo.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')

    const imagePath =
      `${coneheadNumber}/${timestamp}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('placements')
      .upload(imagePath, photo, {
        cacheControl: '3600',
        contentType: photo.type,
        upsert: false,
      })

    if (uploadError) {
      setPublishMessage(
        `Photograph upload failed: ${uploadError.message}`
      )
      setPublishing(false)
      return
    }

    const { error: databaseError } = await supabase
      .from('placements')
      .insert({
        conehead_number: Number(coneheadNumber),
        image_path: imagePath,
        location: location.trim(),
        caption: caption.trim(),
      })

    if (databaseError) {
      await supabase.storage
        .from('placements')
        .remove([imagePath])

      setPublishMessage(
        `Release record failed: ${databaseError.message}`
      )
      setPublishing(false)
      return
    }

    const releasedConehead = coneheads.find(
      (conehead) =>
        conehead.number === Number(coneheadNumber)
    )

    setPublishMessage(
      `${releasedConehead.name} has been released into the wild.`
    )

    setConeheadNumber('')
    setLocation('')
    setCaption('')
    setPhoto(null)
    setFileInputKey((currentKey) => currentKey + 1)
    setPublishing(false)
  }

  if (checkingSession) {
    return (
      <main className="release-page">
        <p>Checking release access...</p>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="release-page">
        <section className="release-panel">
          <h1>Release a Conehead</h1>

          <p>
            This page is for authorised Conehead deployment personnel.
          </p>

          <form onSubmit={logIn}>
            <label htmlFor="release-email">
              Email
            </label>

            <input
              id="release-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

            <label htmlFor="release-password">
              Password
            </label>

            <input
              id="release-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

            <button type="submit">
              Sign In
            </button>

            {loginMessage && (
              <p className="form-message">
                {loginMessage}
              </p>
            )}
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="release-page">
      <section className="release-panel">
        <h1>Release a Conehead</h1>

        <p>
          Select the number from the card, add the placement
          photograph and publish the release.
        </p>

        <form onSubmit={publishRelease}>
          <label htmlFor="conehead-number">
            Conehead
          </label>

          <select
            id="conehead-number"
            value={coneheadNumber}
            onChange={(event) =>
              setConeheadNumber(event.target.value)
            }
            required
          >
            <option value="">
              Choose a Conehead
            </option>

            {coneheads.map((conehead) => (
              <option
                key={conehead.number}
                value={conehead.number}
              >
                No. {conehead.number}: {conehead.name}
              </option>
            ))}
          </select>

          <label htmlFor="release-photo">
            Placement photograph
          </label>

          <input
            key={fileInputKey}
            id="release-photo"
            type="file"
            accept="image/*"
            onChange={(event) =>
              setPhoto(event.target.files[0] || null)
            }
            required
          />

          <label htmlFor="release-location">
            Location
          </label>

          <input
            id="release-location"
            type="text"
            placeholder="For example: Portobello Beach, Edinburgh"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            required
          />

          <label htmlFor="release-caption">
            Caption or field note
          </label>

          <textarea
            id="release-caption"
            rows="5"
            placeholder="What is happening here?"
            value={caption}
            onChange={(event) =>
              setCaption(event.target.value)
            }
          />

          <button
            type="submit"
            disabled={publishing}
          >
            {publishing
              ? 'Publishing...'
              : 'Publish Release'}
          </button>

          {publishMessage && (
            <p className="form-message">
              {publishMessage}
            </p>
          )}
        </form>

        <button
          className="sign-out-button"
          type="button"
          onClick={logOut}
        >
          Sign Out
        </button>
      </section>

      <PendingSightings />
    </main>
  )
}

export default ReleasePage