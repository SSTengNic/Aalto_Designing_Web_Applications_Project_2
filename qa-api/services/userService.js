import { postgres } from "../deps.js";
const sql = postgres({});

const postUser = async (user_id) => {
    const insertedUser = await sql`
    INSERT INTO users (user_id)
    VALUES (${user_id})
    RETURNING *;
`;
    return insertedUser[0];
};

export { postUser };
