CREATE TABLE courseone_questions (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_upvoted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO courseone_questions (content, upvotes, user_id, created_at, last_upvoted_at) VALUES
('What is Svelte?', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('How does reactivity work in Svelte?', 3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('What are stores in Svelte?', 7, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);