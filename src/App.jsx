// useState allows the website to remember:
// 1. which Conehead the visitor has selected;
// 2. what the visitor has entered into the search box.
import { useState } from 'react'

// Import the complete Conehead population.
// Each character’s information lives in its own file.
import coneheads from './data/coneheads'

// Import the live release and sighting components.
import ReleaseGallery from './components/ReleaseGallery'
import ReleasePage from './components/ReleasePage'
import SightingsGallery from './components/SightingsGallery'
import FinderSubmission from './components/FinderSubmission'

// Import the website styling.
import './App.css'

function App() {
  // null means that the visitor is viewing the main gallery.
  // Clicking a Conehead replaces null with that character’s data.
  const [selectedConehead, setSelectedConehead] = useState(null)

  // Store the current contents of the search box.
  const [searchTerm, setSearchTerm] = useState('')

  // The private release page uses a hash address so it works
  // reliably on Vercel without requiring a separate route.
  const isReleasePage =
    window.location.hash === '#release'

  if (isReleasePage) {
    return <ReleasePage />
  }

  // Remove spaces from the beginning and end of the search.
  // Convert the search to lowercase so capitalisation does not matter.
  const normalizedSearch = searchTerm.trim().toLowerCase()

  // A search is active when the visitor has entered something
  // other than empty spaces.
  const isSearching = normalizedSearch !== ''

  // Create a list containing only the Coneheads whose name
  // or number matches the current search.
  const filteredConeheads = coneheads.filter((conehead) => {
    const name = String(conehead.name).toLowerCase()
    const number = String(conehead.number)

    return (
      name.includes(normalizedSearch) ||
      number.includes(normalizedSearch)
    )
  })

  // Select one Conehead at random and open their individual page.
  const visitRandomConehead = () => {
    if (coneheads.length === 0) {
      return
    }

    const randomIndex =
      Math.floor(Math.random() * coneheads.length)

    const randomConehead = coneheads[randomIndex]

    setSearchTerm('')
    setSelectedConehead(randomConehead)
  }

  // If a Conehead has been selected, show their individual page.
  if (selectedConehead) {
    return (
      <main>
        <button
          className="back-button"
          type="button"
          onClick={() => setSelectedConehead(null)}
        >
          Back to All Coneheads
        </button>

        <article>
          <h1>
            Conehead No. {selectedConehead.number}{' '}
            {selectedConehead.name}
          </h1>

          <img
            src={selectedConehead.originalPhoto}
            alt={`Conehead No. ${selectedConehead.number}: ${selectedConehead.name}`}
          />

          <section className="backstory">
            <h2>About {selectedConehead.name}</h2>

            {selectedConehead.backstory.map(
              (paragraph, index) => (
                <p key={index}>{paragraph}</p>
              )
            )}
          </section>

          {/*
            Official placement records created by the artist.
          */}
          <ReleaseGallery conehead={selectedConehead} />

          {/*
            Approved finder photographs submitted by members
            of the public.
          */}
          <SightingsGallery conehead={selectedConehead} />

          {/*
            Public form for submitting a new finder sighting.
          */}
          <FinderSubmission conehead={selectedConehead} />
        </article>
      </main>
    )
  }

  // If no Conehead has been selected, show the landing page.
  return (
    <main>
      <header>
        <input
          type="search"
          placeholder="Search by name or number"
          aria-label="Search Coneheads"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />

        <button
          type="button"
          onClick={visitRandomConehead}
        >
          Visit a Random Conehead
        </button>
      </header>

      {!isSearching && (
        <>
          <section className="landing-introduction">
            <h1>Coneheads</h1>

            <p>
              Coneheads began with traffic cones on statues.
            </p>

            <p>
              For years, placing a traffic cone on the Duke
              of Wellington statue was understood as a
              particularly Glaswegian tradition. Then cones
              began appearing on statues elsewhere, where
              their arrival was not always welcomed. I became
              interested in what happened when this familiar
              piece of street furniture moved beyond its
              supposedly proper place.
            </p>

            <p>
              I started putting miniature traffic cones on
              small found figures. As I made more of them and
              wrote their stories, they became a population:
              builders, puppies, aliens, mermaids, dinosaurs,
              office workers and several creatures that resist
              sensible classification. What began with a
              misplaced object gradually developed into a
              small world in which nobody quite fits, and
              nobody has to fit.
            </p>

            <p>
              The Coneheads are now being placed in public
              locations for other people to find.
            </p>

            <p>
              If you find one, you can keep it. You can also
              place it somewhere new for somebody else to
              discover. If you photograph your Conehead, you
              can submit the image directly from that
              character&apos;s page. You can add a location,
              a short note, or your name if you want to, but
              none of these are required. Approved
              photographs may become part of the
              character&apos;s continuing story on this
              website. You can also place your Conehead
              somewhere with the QR code for someone else to
              find.
            </p>

            <p>
              What happens to the Coneheads after they leave
              me is part of the work.
            </p>
          </section>

          <section className="artist-introduction">
            <h2>About the Artist</h2>

            <p>
              Kris Cirkuit is a multidisciplinary artist based
              in Edinburgh. Their practice combines creative
              coding, sound, projection mapping and physical
              making. Moving between digital and physical
              forms, their work creates alternative worlds,
              systems and ways of seeing. They are interested
              in how reality is defined and organised, and how
              lived experience shapes what we understand to be
              real.
            </p>

            <a href="mailto:kriscirkuit@icloud.com">
              Contact
            </a>
          </section>
        </>
      )}

      <section>
        <h2 className="gallery-heading">
          {isSearching
            ? 'Search Results'
            : 'Meet the Coneheads'}
        </h2>

        {filteredConeheads.length === 0 ? (
          <p>No Coneheads match that search.</p>
        ) : (
          filteredConeheads.map((conehead) => (
            <article key={conehead.number}>
              <h3>
                Conehead No. {conehead.number}{' '}
                {conehead.name}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setSelectedConehead(conehead)
                }
                aria-label={`Visit ${conehead.name}'s page`}
              >
                <img
                  src={conehead.originalPhoto}
                  alt={`Conehead No. ${conehead.number}: ${conehead.name}`}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedConehead(conehead)
                }
              >
                Meet {conehead.name}
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  )
}

export default App