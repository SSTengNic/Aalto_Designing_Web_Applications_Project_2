<script>
    export let id;
    let question = ""; // Placeholder until data is loaded

    // Import Svelte's onMount lifecycle function
    import { onMount } from "svelte";

    onMount(async () => {
        // Fetch question details based on `id`
        const response = await fetch(`/api/courseonequestions/${id}`);
        // Await the resolved JSON data
        question = await response.json();
    });
</script>

<h1>Question Details</h1>
<p>{question.content}</p>
<!-- Assuming 'content' is the key in the JSON -->
<p>Upvotes: {question.upvotes}</p>
