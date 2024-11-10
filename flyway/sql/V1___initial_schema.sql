CREATE TABLE course_questions (
    id SERIAL PRIMARY KEY,
    course TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_upvoted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO course_questions (content, course, user_id, upvotes, created_at, last_upvoted_at) VALUES
('What is Svelte?', 'Svelte', '1', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('How does reactivity work in Svelte?', 'Svelte', '2', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('What are stores in Svelte?', 'Svelte', '3', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('What is Astro?', 'Astro', '4', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE question_likes_checker (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id),
    question_id INT REFERENCES course_questions(id),
    UNIQUE (user_id, question_id)
);

CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    course TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    user_id TEXT NOT NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE NOT NULL,
    question_id INT REFERENCES course_questions(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_upvoted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE answer_checker (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id),
    answer_id INT REFERENCES answers(id),
    UNIQUE (user_id, answer_id)
);
