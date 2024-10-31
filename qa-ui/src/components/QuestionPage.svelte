<script>
    export let question_id;
    // Import Svelte's onMount lifecycle function
    import { onMount } from "svelte";

    let question = ""; // Placeholder until data is loaded
    let answers = [];

    onMount(async () => {
        // Fetch question details based on `id`
        const fetchQuestion = await fetch(
            `/api/coursequestions/${question_id}`
        );
        // Await the resolved JSON data
        question = await fetchQuestion.json();
        const fetchAnswers = await fetch(`/api/answers/${question_id}`, {
            method: "GET",
        });
        answers = await fetchAnswers.json();

        console.log("answer: ", answers);
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
            answers = answers.map((a) =>
                a.id === answer_id ? updatedAnswer : a
            );

            // Sort by most recent activity (creation or upvote time)
            answers.sort(
                (a, b) =>
                    Math.max(
                        new Date(b.created_at),
                        new Date(b.last_upvoted_at)
                    ) -
                    Math.max(
                        new Date(a.created_at),
                        new Date(a.last_upvoted_at)
                    )
            );
        } catch (error) {
            console.error("Error liking answer:", error);
        }
    };
</script>

<h1>Question Details</h1>
<p>{question.content}</p>
<!-- Assuming 'content' is the key in the JSON -->
<p>Upvotes: {question.upvotes}</p>
<ul>
    {#each answers as answer}
        <li>
            <p>{answer.content}</p>
            <p>Upvotes: {answer.upvotes}</p>
            <button on:click={() => upvoteAnswer(answer.user_id, answer.id)}
                >Upvote!</button
            >
        </li>
    {/each}
</ul>
