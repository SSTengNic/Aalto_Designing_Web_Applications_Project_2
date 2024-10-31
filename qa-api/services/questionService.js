import { postgres } from "../deps.js";
const sql = postgres({});

const getCourseOneQuestions = async () => {
    return await sql` SELECT * FROM courseone_questions
ORDER BY GREATEST(created_at, last_upvoted_at) DESC
LIMIT 20;`;
};

const postCourseOneQuestions = async (content, user_id) => {
    console.log("content: ", content);
    const upvotes = 0;
    const insertedQuestion = await sql`
    INSERT INTO courseone_questions (content, upvotes, user_id)
    VALUES (${content}, ${upvotes}, ${user_id})
    RETURNING *;
`;
    return insertedQuestion[0];
};

const getCourseOneQuestion = async (id) => {
    const question =
        await sql`SELECT * FROM courseone_questions WHERE id = ${id}`;
    return question[0];
};

const putCourseOneQuestionlikes = async (user_id, question_id) => {
    try {
        console.log("id: ", user_id);
        console.log("question_id: ", question_id);
        const likeExists = await sql`
        SELECT * FROM  question_likes_checker WHERE user_id = ${user_id} AND question_id = ${question_id}`;

        if (likeExists.length === 0) {
            await sql`
            INSERT INTO question_likes_checker (user_id,question_id) VALUES (${user_id},${question_id})`;
            const updatedCourseOneQuestion = await sql`
            UPDATE courseone_questions
            SET 
               upvotes = upvotes + 1,
               last_upvoted_at = NOW()
            WHERE 
                id = ${question_id} 
            RETURNING *;
        `;
            return updatedCourseOneQuestion[0];
        }
    } catch (error) {
        console.error("Error updating submission: ", error);
    }
};

export {
    getCourseOneQuestions,
    postCourseOneQuestions,
    getCourseOneQuestion,
    putCourseOneQuestionlikes,
};
