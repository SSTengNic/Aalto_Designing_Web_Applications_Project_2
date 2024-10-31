import { postgres } from "../deps.js";
const sql = postgres({});

const getCourseQuestions = async (course) => {
    try {
        const questions = await sql`
            SELECT * FROM course_questions 
            WHERE course = ${course}
            ORDER BY GREATEST(created_at, last_upvoted_at) DESC
            LIMIT 20;
        `;
        return questions; // Return the result
    } catch (error) {
        console.error("Error fetching course questions:", error);
        throw error; // Optionally re-throw the error for further handling
    }
};

//Maybe make it search for both the id and the course
const getCourseQuestion = async (id) => {
    const question =
        await sql`SELECT * FROM course_questions WHERE id = ${id};`;
    return question[0];
};

const postCourseQuestions = async (content, user_id, course) => {
    const upvotes = 0;
    const insertedQuestion = await sql`
    INSERT INTO course_questions (content, upvotes, user_id, course)
    VALUES (${content}, ${upvotes}, ${user_id}, ${course})
    RETURNING *;
`;
    return insertedQuestion[0];
};

const putCourseQuestionlikes = async (user_id, question_id) => {
    try {
        const likeExists = await sql`
        SELECT * FROM  question_likes_checker WHERE user_id = ${user_id} AND question_id = ${question_id};`;

        if (likeExists.length === 0) {
            await sql`
            INSERT INTO question_likes_checker (user_id,question_id) VALUES (${user_id},${question_id});`;
            const updatedCourseQuestion = await sql`
            UPDATE course_questions
            SET 
               upvotes = upvotes + 1,
               last_upvoted_at = NOW()
            WHERE 
                id = ${question_id} 
            RETURNING *;
        `;
            return updatedCourseQuestion[0];
        }
    } catch (error) {
        console.error("Error updating submission: ", error);
    }
};

export {
    getCourseQuestions,
    postCourseQuestions,
    getCourseQuestion,
    putCourseQuestionlikes,
};
