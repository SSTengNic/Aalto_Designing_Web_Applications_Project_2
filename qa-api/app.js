import { serve } from "./deps.js";
import * as questionService from "./services/questionService.js";
import * as userService from "./services/userService.js";
import * as answerService from "./services/answerService.js";
// Function to POST data to the LLM API
const PostToAi = async (data) => {
    const response = await fetch("http://llm-api:7000/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch from LLM API");
    }

    return await response.json(); // Return the JSON response from the API
};

const postToCourseQuestions = async (request) => {
    let reqBody;
    try {
        reqBody = await request.json();
        console.log("reqBody: ", reqBody);

        const response = await questionService.postCourseQuestions(
            reqBody.content,
            reqBody.user_id,
            reqBody.course
        );
        console.log("New question posted successfully.");
        return Response.json(response);
    } catch (error) {
        console.error("Failed to post Course question, due to: ", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};

const getCourseQuestions = async (request, urlPatternResult) => {
    const course = urlPatternResult.pathname.groups.course;

    return Response.json(await questionService.getCourseQuestions(course));
};

const getCourseQuestion = async (request, urlPatternResult) => {
    const id = urlPatternResult.pathname.groups.id;
    console.log("id is: ", id);

    try {
        const CourseQuestion = await questionService.getCourseQuestion(id);

        return new Response(JSON.stringify(CourseQuestion), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error retrieving question:", error); // Logs error details
        return new Response("Internal Server Error", { status: 500 });
    }
};

const putLikesToCourseQuestion = async (request, urlPatternResult) => {
    const id = urlPatternResult.pathname.groups.id;
    const reqbody = await request.json();
    try {
        const updatedCourseQuestion =
            await questionService.putCourseQuestionlikes(
                reqbody.user_id,
                reqbody.question_id
            );

        return Response.json(updatedCourseQuestion);
    } catch (error) {
        console.error("Error liking question:", error);
    }
};

//--------------------------------------------------------------------------

const postUser = async (request) => {
    let receivedUser;
    try {
        receivedUser = await request.json();
        console.log("app, putLikes: ", receivedUser);

        const response = await userService.postUser(receivedUser.user_id);
        console.log("user posted successfully.");
        return Response.json(response);
    } catch (error) {
        if (error.code === "23505") {
            // PostgreSQL error code for unique violation
            console.error("User already exists.");
            return new Response(
                JSON.stringify({ error: "User already exists" }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        } else {
            console.error("Failed to post user, due to: ", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
};
//--------------------------------------------------------------------------
const getAnswers = async (request, urlPatternResult) => {
    const id = urlPatternResult.pathname.groups.id;
    //If i want this, i need the question_id right
    return Response.json(await answerService.getAnswers(id));
};

const postAnswer = async (request) => {
    try {
        const reqBody = await request.json();
        console.log("reqBody: ", reqBody);
        const response = await answerService.postAnswer(
            reqBody.course,
            reqBody.content,
            reqBody.user_id,
            reqBody.question_id
        );
        return Response.json(response);
    } catch (error) {
        console.error("Failed to post user, due to: ", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

const putLikesAnswer = async (request) => {
    const reqBody = await request.json();
    console.log("putLikesAnswer, reqBody: ", reqBody);
    try {
        const updatedAnswer = await answerService.putLikesAnswer(
            reqBody.user_id,
            reqBody.answer_id
        );

        return Response.json(updatedAnswer);
    } catch (error) {
        console.error("Error liking answer: ", error);
    }
};

// Define URL mapping
const urlMapping = [
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/ai" }), // Endpoint for LLM API
        fn: async (request) => {
            const data = await request.json(); // Parse incoming request data
            const aiResponse = await PostToAi(data); // Call the AI function
            return new Response(JSON.stringify(aiResponse), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }); // Return AI response
        },
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/coursequestions/:id" }), // Example for PostgreSQL logic
        fn: getCourseQuestion,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/users" }), // Example for PostgreSQL logic
        fn: postUser,
    },

    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/coursequestions/:course" }), // Example for PostgreSQL logic
        fn: getCourseQuestions,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/coursequestions" }), // Example for PostgreSQL logic
        fn: postToCourseQuestions,
    },
    {
        method: "PUT",
        pattern: new URLPattern({ pathname: "/coursequestions/:id" }), // Example for PostgreSQL logic
        fn: putLikesToCourseQuestion,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/answers/:id" }), // Example for PostgreSQL logic
        fn: getAnswers,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/answers" }), // Example for PostgreSQL logic
        fn: postAnswer,
    },
    {
        method: "PUT",
        pattern: new URLPattern({ pathname: "/answers" }), // Example for PostgreSQL logic
        fn: putLikesAnswer,
    },

    // Add more mappings as needed
];

// Main request handler
const handleRequest = async (request) => {
    const mapping = urlMapping.find(
        (um) => um.method === request.method && um.pattern.test(request.url)
    );

    if (!mapping) {
        return new Response("Request not found", { status: 404 });
    }

    const mappingResult = mapping.pattern.exec(request.url);
    return await mapping.fn(request, mappingResult);
};

// Server configuration
const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
