// useState allows the website to remember:
// 1. which Conehead the visitor has selected;
// 2. what the visitor has entered into the search box.
import { useState } from 'react'

// Import the complete Conehead population.
// Each character’s information lives in its own file.
import coneheads from './data/coneheads'

// Import the website styling.
import './App.css'

function App() {
  // null means that the visitor is viewing the main gallery.
  // Clicking a Conehead replaces null with that character’s data.
  const [selectedConehead, setSelectedConehead] = useState(null)

  // Store the current contents of the search box.
  const [searchTerm, setSearchTerm] = useState('')

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
    // Stop safely if the Conehead list is ever empty.
    if (coneheads.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * coneheads.length)
    const randomConehead = coneheads[randomIndex]

    // Clear any existing search before opening the random character.
    setSearchTerm('')
    setSelectedConehead(randomConehead)
  }

  // If a Conehead has been selected, show their individual page.
  if (selectedConehead) {
    return (
      <main>
        {/* Return to the main Coneheads gallery. */}
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

          {/* Display the Conehead’s original studio photograph. */}
          <img
            src={selectedConehead.originalPhoto}
            alt={`Conehead No. ${selectedConehead.number}: ${selectedConehead.name}`}
          />

          {/* Display each paragraph of the Conehead’s backstory. */}
          <section className="backstory">
            <h2>About {selectedConehead.name}</h2>

            {selectedConehead.backstory.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>

          <section>
            <h2>Released into the Wild</h2>

            {/*
              If a release photograph has been added, display
              the photograph and its accompanying text.

              Otherwise, display the temporary message.
            */}
            {selectedConehead.release.photo ? (
              <>
                <img
                  src={selectedConehead.release.photo}
                  alt={`${selectedConehead.name} at their release location`}
                />

                <p>{selectedConehead.release.text}</p>
              </>
            ) : (
              <p>
                This Conehead has not yet been released into the wild.
              </p>
            )}
          </section>
        </article>
      </main>
    )
  }

  // If no Conehead has been selected, show the landing page.
  return (
    <main>
      <header>
        {/* Search for a Conehead by name or number. */}
        <input
          type="search"
          placeholder="Search by name or number"
          aria-label="Search Coneheads"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        {/* Select and open one Conehead at random. */}
        <button
          type="button"
          onClick={visitRandomConehead}
        >
          Visit a Random Conehead
        </button>
      </header>

      {/*
        Hide the introduction and artist biography while searching.
        This brings the search results directly beneath the controls.
      */}
      {!isSearching && (
        <>
          <section className="landing-introduction">
            <h1>Coneheads</h1>

            <p>Coneheads began with traffic cones on statues.</p>

            <p>
              For years, placing a traffic cone on the Duke of Wellington
              statue was understood as a particularly Glaswegian tradition.
              Then cones began appearing on statues elsewhere, where their
              arrival was not always welcomed. I became interested in what
              happened when this familiar piece of street furniture moved
              beyond its supposedly proper place.
            </p>

            <p>
              I started putting miniature traffic cones on small found
              figures. As I made more of them and wrote their stories, they
              became a population: builders, puppies, aliens, mermaids,
              dinosaurs, office workers and several creatures that resist
              sensible classification. What began with a misplaced object
              gradually developed into a small world in which nobody quite
              fits, and nobody has to fit.
            </p>

            <p>
              The Coneheads are now being placed in public locations for
              other people to find.
            </p>

            <p>
              If you find one, you can keep it. You can also place it
              somewhere new for somebody else to discover. If you photograph
              your Conehead, you can email me the image, its location and
              anything you would like to share about what happened. Your
              photograph may then become part of the character’s continuing
              story on this website.
            </p>

            <p>
              What happens to the Coneheads after they leave me is part of
              the work.
            </p>
          </section>

          <section className="artist-introduction">
            <h2>About the Artist</h2>

            <p>
              Kris Cirkuit is a multidisciplinary artist based in Edinburgh.
              Their practice combines creative coding, sound, projection
              mapping and physical making. Moving between digital and physical
              forms, their work creates alternative worlds, systems and ways
              of seeing. They are interested in how reality is defined and
              organised, and how lived experience shapes what we understand
              to be real.
            </p>

            {/* Open a new email addressed to the artist. */}
            <a href="mailto:kriscirkuit@icloud.com">
              Contact
            </a>
          </section>
        </>
      )}

      {/* Display either the complete gallery or the search results. */}
      <section>
        <h2 className="gallery-heading">
          {isSearching ? 'Search Results' : 'Meet the Coneheads'}
        </h2>

        {/*
          If the search has no matches, display a message.
          Otherwise, create one gallery entry for each matching Conehead.
        */}
        {filteredConeheads.length === 0 ? (
          <p>No Coneheads match that search.</p>
        ) : (
          filteredConeheads.map((conehead) => (
            <article key={conehead.number}>
              <h3>
                Conehead No. {conehead.number} {conehead.name}
              </h3>

              {/*
                The photograph is inside a button, making the whole
                image clickable.
              */}
              <button
                type="button"
                onClick={() => setSelectedConehead(conehead)}
                aria-label={`Visit ${conehead.name}'s page`}
              >
                <img
                  src={conehead.originalPhoto}
                  alt={`Conehead No. ${conehead.number}: ${conehead.name}`}
                />
              </button>

              {/* This provides a labelled route to the same page. */}
              <button
                type="button"
                onClick={() => setSelectedConehead(conehead)}
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

// Make App available to main.jsx,
// which places the website into the browser.
export default App