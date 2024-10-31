import { postgres } from "../deps.js";
const sql = postgres({});

const getAnswers = async (question_id) => {
    try {
        const answers = await sql`
        SELECT * FROM answers WHERE question_id=${question_id}  ORDER BY GREATEST(created_at, last_upvoted_at) DESC
            LIMIT 20;`;
        return answers; // Return the result
    } catch (error) {
        console.error("Error fetching course questions:", error);
        throw error;
    }
};

const postAnswer = async (course, content, user_id, question_id) => {
    const upvotes = 0;
    const insertedAnswer = await sql`
    INSERT INTO answers (course, content, user_id, question_id, upvotes)
    VALUES (${course}, ${content}, ${user_id}, ${question_id}, ${upvotes})
    RETURNING *;`;
    return insertedAnswer[0];
};

const putAnswerlikes = async (user_id, answer_id) => {
    try {
        console.log("id: ", user_id);
        console.log("answer_id: ", answer_id);
        const likeExists = await sql`
        SELECT * FROM  answer_checker WHERE user_id = ${user_id} AND answer_id = ${answer_id}`;

        if (likeExists.length === 0) {
            await sql`
            INSERT INTO answer_checker (user_id,answer_id) VALUES (${user_id},${answer_id})`;
            const updatedAnswer = await sql`
            UPDATE answers
            SET 
               upvotes = upvotes + 1,
               last_upvoted_at = NOW()
            WHERE 
                id = ${answer_id} 
            RETURNING *;
        `;
            return updatedAnswer[0];
        }
    } catch (error) {
        console.error("Error updating submission: ", error);
    }
};

export { getAnswers, postAnswer, putAnswerlikes };
