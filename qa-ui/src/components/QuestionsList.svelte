<script>
    export let course;

    import { userUuid } from "../stores/stores";

    import { onMount } from "svelte";

    let courseQuestions = [];

    // Fetch all questions on component load
    const getAllCourseQuestions = async () => {
        try {
            const response = await fetch(`/api/coursequestions/${course}`);
            const questions = await response.json();
            courseQuestions.set(questions);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    onMount(() => {
        getAllCourseQuestions();
    });

    const upvoteQuestion = async (id) => {
        try {
            const response = await fetch(`/api/coursequestions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: $userUuid, question_id: id }),
            });
            if (!response.ok) throw new Error("Failed to like question.");

            const updatedQuestion = await response.json();
            // Update only the upvoted question in the local list
            courseQuestions = courseQuestions.map((q) => {
                q.id = id ? updatedQuestion : q;
            });

            // Sort by most recent activity (creation or upvote time)
            courseQuestions.sort(
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
            console.error("Error liking question:", error);
        }
    };

    const selectQuestion = (id) => {
        window.location.href = `/questions/${id}`; // Redirect to question page
    };
</script>

<ul>
    {#if $courseQuestions.length > 0}
        {#each $courseQuestions as question (question.id)}
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
