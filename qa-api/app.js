import { serve } from "./deps.js";
import * as questionService from "./services/questionService.js";

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

const PostToCourseOneQuestions = async (request) => {
    let question;
    try {
        question = await request.json();

        await questionService.postCourseOne_Questions(
            question.content,
            question.user_id
        );
        return new Response(
            JSON.stringify({ message: "Question posted successfully!" }),
            {
                status: 201,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
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
    return Response.json(await questionService.getCourseOne_Questions());
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
        pattern: new URLPattern({ pathname: "/courseonequestions" }), // Example for PostgreSQL logic
        fn: getCourseOneQuestions,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/courseonequestions" }), // Example for PostgreSQL logic
        fn: PostToCourseOneQuestions,
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

    return await mapping.fn(request); // Call the appropriate function
};

// Server configuration
const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
