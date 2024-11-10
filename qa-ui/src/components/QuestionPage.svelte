<script>
    export let question_id;
    import NewAnswerForm from "./NewAnswerForm.svelte";
    import { onMount } from "svelte";
    import { questionAnswers } from "../stores/stores.js";

    let question = ""; // Placeholder until data is loaded
    let socket; // WebSocket connection

    onMount(async () => {
        // Fetch question details based on `id`
        const fetchQuestion = await fetch(
            `/api/coursequestions/course/${question_id}`
        );
        question = await fetchQuestion.json();

        // Fetch existing answers to the question
        const fetchAnswers = await fetch(`/api/answers/${question_id}`);
        const answers = await fetchAnswers.json();
        questionAnswers.set(answers);

        // Step 1: Open a WebSocket connection to receive AI answers in real-time
        socket = new WebSocket(`ws://localhost:7800/ws`);

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            if (event.data === "ping") {
                console.log("Received ping!");
                return;
            }

            const data = JSON.parse(event.data);

            // Check if the message is about new AI answers
            if (
                data.type === "AI_ANSWER_READY" &&
                data.questionId === question_id
            ) {
                console.log("AI Answer received:", data.answers);

                // Step 2: Update the store with the new answers
                questionAnswers.update((answers) => {
                    // Add new answers to the existing ones and ensure sorting
                    const updatedAnswers = [...answers, ...data.answers];

                    return updatedAnswers.sort(
                        (a, b) =>
                            Math.max(
                                new Date(b.created_at),
                                new Date(b.last_upvoted_at)
                            ) -
                            Math.max(
                                new Date(a.created_at),
                                new Date(b.last_upvoted_at)
                            )
                    );
                });
            }
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
            // Optional: Reconnect if the WebSocket closes unexpectedly
            setTimeout(() => {
                socket = new WebSocket(`ws://localhost:7800/ws`);
            }, 5000); // Try to reconnect after 5 seconds
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    });

    const upvoteAnswer = async (user_id, answer_id) => {
        try {
            const response = await fetch(`/api/answers`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user_id,
                    answer_id: answer_id,
                }),
            });

            if (!response.ok) throw new Error("Failed to like answer.");

            const updatedAnswer = await response.json();

            // Update only the upvoted answer in the local list
            questionAnswers.update((answers) => {
                const updatedAnswerList = answers.map((a) =>
                    a.id === answer_id ? updatedAnswer : a
                );

                return updatedAnswerList.sort(
                    (a, b) =>
                        Math.max(
                            new Date(b.created_at),
                            new Date(b.last_upvoted_at)
                        ) -
                        Math.max(
                            new Date(a.created_at),
                            new Date(b.last_upvoted_at)
                        )
                );
            });
        } catch (error) {
            console.error("Error liking answer:", error);
        }
    };
</script>

<h1>Question Details</h1>
<p>{question.content}</p>
<NewAnswerForm {question_id} course={question.course} />

<p>Upvotes: {question.upvotes}</p>

<!-- Displaying existing answers -->
<ul>
    {#each $questionAnswers as answer}
        <li>
            <p>{answer.content}</p>
            <p>Upvotes: {answer.upvotes}</p>
            <button on:click={() => upvoteAnswer(answer.user_id, answer.id)}>
                Upvote!
            </button>
        </li>
    {/each}
</ul>
