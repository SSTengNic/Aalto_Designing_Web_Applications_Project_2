<script>
    import { userUuid } from "../stores/stores";

    import { onMount } from "svelte";
    import { courseOneQuestions } from "../stores/stores";

    // Fetch all questions on component load
    const getAllCourseOneQuestions = async () => {
        try {
            const response = await fetch("/api/courseonequestions");
            const questions = await response.json();
            courseOneQuestions.set(questions);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    onMount(() => {
        getAllCourseOneQuestions();
    });

    const upvoteQuestion = async (id) => {
        try {
            const response = await fetch(`/api/courseonequestions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userUuid }),
            });
            if (!response.ok) throw new Error("Failed to like question.");

            const updatedQuestion = await response.json();
            // Update only the upvoted question in the local list
            courseOneQuestions.update((questions) => {
                const updatedList = questions.map((q) =>
                    q.id === id ? updatedQuestion : q
                );

                // Sort by most recent activity (creation or upvote time)
                updatedList.sort(
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

                return updatedList;
            });
        } catch (error) {
            console.error("Error liking question:", error);
        }
    };

    const selectQuestion = (id) => {
        window.location.href = `/questions/${id}`; // Redirect to question page
    };
</script>

<ul>
    {#if $courseOneQuestions.length > 0}
        {#each $courseOneQuestions as question (question.id)}
            <li>
                <p>{question.content}</p>
                <p>Upvotes: {question.upvotes}</p>
                <button
                    on:click={() => upvoteQuestion(question.id)}
                    style="border: 1px solid #000; padding: 8px;"
                >
                    Upvote
                </button>
                <button
                    on:click={() => selectQuestion(question.id)}
                    style="border: 1px solid #000; padding: 8px;"
                >
                    Go to Question
                </button>
            </li>
        {/each}
    {/if}
</ul>
