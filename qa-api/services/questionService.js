import { postgres } from "../deps.js";
const sql = postgres({});

const getCourseOne_Questions = async () => {
    return await sql` SELECT * from courseone_questions`;
};

const postCourseOne_Questions = async (content, user_id) => {
    console.log("content: ", content);
    const upvotes = 0;
    await sql`INSERT INTO courseone_questions (content, upvotes, user_id) VALUES (${content},${upvotes},${user_id})`;
};

export { getCourseOne_Questions, postCourseOne_Questions };
