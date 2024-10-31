import { serve } from "./deps.js";
import * as questionService from "./services/questionService.js";
import * as userService from "./services/userService.js";
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

const postToCourseOneQuestions = async (request) => {
    let question;
    try {
        question = await request.json();

        const response = await questionService.postCourseOneQuestions(
            question.content,
            question.user_id
        );
        console.log("New question posted successfully.");
        return Response.json(response);
    } catch (error) {
        console.error("Failed to post courseone question, due to: ", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};

const getCourseOneQuestions = async (request) => {
    return Response.json(await questionService.getCourseOneQuestions());
};

const getCourseOneQuestion = async (request, urlPatternResult) => {
    const id = urlPatternResult.pathname.groups.id;
    console.log("id is: ", id);

    try {
        const courseOneQuestion = await questionService.getCourseOneQuestion(
            id
        );

        return new Response(JSON.stringify(courseOneQuestion), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error retrieving question:", error); // Logs error details
        return new Response("Internal Server Error", { status: 500 });
    }
};

const putLikesToCourseOneQuestion = async (request, urlPatternResult) => {
    const id = urlPatternResult.pathname.groups.id;
    const reqbody = await request.json();
    try {
        const updatedCourseOneQuestion =
            await questionService.putCourseOneQuestionlikes(
                reqbody.user_id,
                reqbody.question_id
            );

        return Response.json(updatedCourseOneQuestion);
    } catch (error) {
        console.error("Error liking question:", error);
    }
};

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
        pattern: new URLPattern({ pathname: "/courseonequestions/:id" }), // Example for PostgreSQL logic
        fn: getCourseOneQuestion,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/users" }), // Example for PostgreSQL logic
        fn: postUser,
    },

    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/courseonequestions" }), // Example for PostgreSQL logic
        fn: getCourseOneQuestions,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/courseonequestions" }), // Example for PostgreSQL logic
        fn: postToCourseOneQuestions,
    },
    {
        method: "PUT",
        pattern: new URLPattern({ pathname: "/courseonequestions/:id" }), // Example for PostgreSQL logic
        fn: putLikesToCourseOneQuestion,
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
