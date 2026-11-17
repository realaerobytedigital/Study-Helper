import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'studyhelper-data-v1';

const starterDecks = [
  {
    id: 'bio-1',
    title: 'Biology Basics',
    subject: 'Science',
    cards: [
      { id: 'c1', front: 'What is photosynthesis?', back: 'The process plants use to convert sunlight into energy.' },
      { id: 'c2', front: 'What is the function of the cell membrane?', back: 'It controls what enters and exits the cell.' },
      { id: 'c3', front: 'What do mitochondria do?', back: 'They produce most of the cell’s energy.' }
    ]
  },
  {
    id: 'history-1',
    title: 'World War II',
    subject: 'History',
    cards: [
      { id: 'c4', front: 'When did World War II begin?', back: 'It began in 1939.' },
      { id: 'c5', front: 'What was D-Day?', back: 'The Allied invasion of Normandy on June 6, 1944.' },
      { id: 'c6', front: 'What ended the war in Europe?', back: 'The surrender of Nazi Germany in May 1945.' }
    ]
  }
];

const starterUser = {
  name: 'Alex Student',
  email: 'alex@studyhelper.app'
};

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored).user ?? null;
    } catch {
      return null;
    }
  });

  const [decks, setDecks] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return starterDecks;
    try {
      const parsed = JSON.parse(stored);
      return parsed.decks?.length ? parsed.decks : starterDecks;
    } catch {
      return starterDecks;
    }
  });

  const [activeDeckId, setActiveDeckId] = useState(starterDecks[0].id);
  const [currentView, setCurrentView] = useState('landing');
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [newDeck, setNewDeck] = useState({ title: '', subject: '' });
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [studyDeckId, setStudyDeckId] = useState(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyResults, setStudyResults] = useState({ known: 0, review: 0 });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, decks }));
  }, [user, decks]);

  const activeDeck = useMemo(
    () => decks.find((deck) => deck.id === activeDeckId) ?? decks[0],
    [activeDeckId, decks]
  );

  const studyDeck = useMemo(
    () => decks.find((deck) => deck.id === studyDeckId) ?? null,
    [decks, studyDeckId]
  );

  const currentCard = studyDeck?.cards[studyIndex] ?? null;

  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
  const totalDecks = decks.length;

  const handleSignup = (event) => {
    event.preventDefault();
    const name = signupForm.name.trim();
    const email = signupForm.email.trim();

    if (!name || !email || !signupForm.password.trim()) {
      alert('Please complete your name, email, and password.');
      return;
    }

    const userProfile = { name, email };
    setUser(userProfile);
    setCurrentView('dashboard');
    setSignupForm({ name: '', email: '', password: '' });
  };

  const handleCreateDeck = (event) => {
    event.preventDefault();
    if (!newDeck.title.trim() || !newDeck.subject.trim()) {
      alert('Please enter a deck title and subject.');
      return;
    }

    const deck = {
      id: `${Date.now()}`,
      title: newDeck.title.trim(),
      subject: newDeck.subject.trim(),
      cards: []
    };

    setDecks((prev) => [deck, ...prev]);
    setActiveDeckId(deck.id);
    setNewDeck({ title: '', subject: '' });
  };

  const handleAddCard = (event) => {
    event.preventDefault();
    if (!newCard.front.trim() || !newCard.back.trim()) {
      alert('Please add both the front and back of the flashcard.');
      return;
    }

    const card = {
      id: `${Date.now()}`,
      front: newCard.front.trim(),
      back: newCard.back.trim()
    };

    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === activeDeckId ? { ...deck, cards: [...deck.cards, card] } : deck
      )
    );
    setNewCard({ front: '', back: '' });
  };

  const beginStudy = (deckId = activeDeckId) => {
    setStudyDeckId(deckId);
    setStudyIndex(0);
    setShowAnswer(false);
    setStudyResults({ known: 0, review: 0 });
    setCurrentView('study');
  };

  const markCard = (status) => {
    if (!currentCard) return;

    setStudyResults((prev) => ({
      ...prev,
      [status]: prev[status] + 1
    }));

    const nextIndex = studyIndex + 1;
    const deckCards = studyDeck.cards;

    if (nextIndex >= deckCards.length) {
      setCurrentView('dashboard');
      setStudyDeckId(null);
      setStudyIndex(0);
      setShowAnswer(false);
      setTimeout(() => {
        alert(`Study session complete! You knew ${studyResults[status] + 1} cards and need to review ${status === 'known' ? studyResults.review : studyResults.review + 1}.`);
      }, 0);
      return;
    }

    setStudyIndex(nextIndex);
    setShowAnswer(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentView('landing');
  };

  const renderLanding = () => (
    <div className="landing-page">
      <nav className="topbar">
        <div className="brand">StudyHelper</div>
        <button className="secondary-button" onClick={() => setCurrentView('signin')}>
          Sign In
        </button>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Study smarter</span>
          <h1>Turn your notes into quick, confident review sessions.</h1>
          <p>
            Create decks, study flashcards, and keep your revision simple and stress-free.
          </p>

          <div className="cta-row">
            <button className="primary-button" onClick={() => setCurrentView('signup')}>
              Create account
            </button>
            <button className="ghost-button" onClick={() => beginStudy(activeDeckId)}>
              Try a study deck
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="mini-card">
            <p>Today’s focus</p>
            <strong>{activeDeck?.title ?? 'Biology Basics'}</strong>
            <span>{activeDeck?.cards.length ?? 3} cards</span>
          </div>
          <div className="score-card">
            <span>Study streak</span>
            <strong>7 days</strong>
          </div>
        </div>
      </section>
    </div>
  );

  const renderSignup = () => (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Welcome</span>
          <h2>Create your study account</h2>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <label>
            Name
            <input
              type="text"
              value={signupForm.name}
              onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
              placeholder="Your name"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
              placeholder="Create a password"
            />
          </label>

          <button className="primary-button full-width" type="submit">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );

  const renderSignin = () => (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in</h2>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            setUser({ name: starterUser.name, email: signupForm.email || starterUser.email });
            setCurrentView('dashboard');
          }}
        >
          <label>
            Email
            <input
              type="email"
              defaultValue={starterUser.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
            />
          </label>

          <label>
            Password
            <input type="password" defaultValue="password" />
          </label>

          <button className="primary-button full-width" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">StudyHelper</div>
        <div className="profile-card">
          <div className="avatar">{(user?.name ?? starterUser.name).charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user?.name ?? starterUser.name}</strong>
            <span>{user?.email ?? starterUser.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-button active" onClick={() => setCurrentView('dashboard')}>Dashboard</button>
          <button className="nav-button" onClick={() => beginStudy(activeDeckId)}>Study now</button>
          <button className="nav-button" onClick={handleSignOut}>Sign out</button>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="panel-header">
          <div>
            <span className="eyebrow">Overview</span>
            <h2>Study dashboard</h2>
          </div>
          <button className="primary-button" onClick={() => beginStudy(activeDeckId)}>
            Start session
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Decks</span>
            <strong>{totalDecks}</strong>
          </div>
          <div className="stat-card">
            <span>Flashcards</span>
            <strong>{totalCards}</strong>
          </div>
          <div className="stat-card">
            <span>Focus time</span>
            <strong>25 min</strong>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel-card">
            <div className="card-header-row">
              <h3>Your decks</h3>
              <select value={activeDeckId} onChange={(e) => setActiveDeckId(e.target.value)}>
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>{deck.title}</option>
                ))}
              </select>
            </div>

            {activeDeck && (
              <div className="deck-summary">
                <div>
                  <span className="tag">{activeDeck.subject}</span>
                  <h4>{activeDeck.title}</h4>
                </div>
                <p>{activeDeck.cards.length} flashcards ready to review</p>
                <button className="secondary-button" onClick={() => beginStudy(activeDeck.id)}>
                  Study this deck
                </button>
              </div>
            )}
          </div>

          <div className="panel-card">
            <h3>Add a new deck</h3>
            <form className="stack-form" onSubmit={handleCreateDeck}>
              <label>
                Deck title
                <input
                  value={newDeck.title}
                  onChange={(e) => setNewDeck({ ...newDeck, title: e.target.value })}
                  placeholder="Example: Organic Chemistry"
                />
              </label>

              <label>
                Subject
                <input
                  value={newDeck.subject}
                  onChange={(e) => setNewDeck({ ...newDeck, subject: e.target.value })}
                  placeholder="Example: Chemistry"
                />
              </label>

              <button className="primary-button" type="submit">
                Create deck
              </button>
            </form>
          </div>
        </section>

        <section className="panel-card">
          <h3>Add cards to {activeDeck?.title ?? 'your deck'}</h3>
          <form className="card-form" onSubmit={handleAddCard}>
            <textarea
              rows="3"
              value={newCard.front}
              onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
              placeholder="Front of card: What is the capital of France?"
            />
            <textarea
              rows="3"
              value={newCard.back}
              onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
              placeholder="Back of card: Paris is the capital of France."
            />
            <button className="secondary-button" type="submit">
              Add flashcard
            </button>
          </form>
        </section>
      </main>
    </div>
  );

  const renderStudy = () => {
    if (!studyDeck || !currentCard) {
      return <div className="empty-state">No cards in this deck yet.</div>;
    }

    return (
      <div className="study-shell">
        <div className="study-card">
          <div className="study-topbar">
            <span className="eyebrow">{studyDeck.subject}</span>
            <button className="secondary-button" onClick={() => setCurrentView('dashboard')}>
              Exit
            </button>
          </div>

          <h2>{studyDeck.title}</h2>
          <p className="counter">
            Card {studyIndex + 1} of {studyDeck.cards.length}
          </p>

          <div className="flashcard">
            <div className="flashcard-face">
              <span>Front</span>
              <h3>{currentCard.front}</h3>
            </div>

            {showAnswer && (
              <div className="flashcard-face answer">
                <span>Answer</span>
                <p>{currentCard.back}</p>
              </div>
            )}
          </div>

          <div className="study-actions">
            {!showAnswer ? (
              <button className="primary-button" onClick={() => setShowAnswer(true)}>
                Reveal answer
              </button>
            ) : (
              <>
                <button className="success-button" onClick={() => markCard('known')}>
                  I knew it
                </button>
                <button className="warning-button" onClick={() => markCard('review')}>
                  Review again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    if (currentView === 'landing') return renderLanding();
    if (currentView === 'signup') return renderSignup();
    if (currentView === 'signin') return renderSignin();
    if (currentView === 'study') return renderStudy();
    return renderDashboard();
  };

  return <>{renderCurrentView()}</>;
}

export default App;
