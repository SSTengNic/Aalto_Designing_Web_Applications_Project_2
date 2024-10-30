<script>
    export let id;
    let question = { text: "Loading...", upvotes: 0 }; // Placeholder until data is loaded

    // Fetch question data based on the ID
    import { onMount } from "svelte";
    onMount(async () => {
        // Fetch question details based on `id` (replace with real API call)
        question = { id, text: "What is Astro?", upvotes: 5 };
    });
</script>

<h1>Question Details</h1>
<p>{question.text}</p>
<p>Upvotes: {question.upvotes}</p>
