<script>
    export let id;
    let question = ""; // Placeholder until data is loaded
    let answers = "";

    // Import Svelte's onMount lifecycle function
    import { onMount } from "svelte";

    onMount(async () => {
        // Fetch question details based on `id`
        const fetchQuestion = await fetch(`/api/coursequestions/${id}`);
        // Await the resolved JSON data
        question = await fetchQuestion.json();
        const fetchAnswers = await fetch("/api/answers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                question_id: id,
            }),
        });
        answers = await fetchAnswers.json();
    });

    const upvoteAnswer = async (id) => {};
</script>

<h1>Question Details</h1>
<p>{question.content}</p>
<!-- Assuming 'content' is the key in the JSON -->
<p>Upvotes: {question.upvotes}</p>
<ul>
    {#each answers as answer}
        <li>
            <p>{answer}</p>
            <button on:click={() => upvoteAnswer()}>Upvote!</button>
        </li>
    {/each}
</ul>
