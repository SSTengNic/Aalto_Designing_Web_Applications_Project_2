<script>
    export let course;

    import { userUuid, courseQuestions } from "../stores/stores.js";
    let questionText = "";
    let isLoading = false;

    const submitQuestion = async (event) => {
        event.preventDefault(); // Prevent the default form submission

        if (questionText === "") {
            return alert("Please input something into the question form.");
        }

        isLoading = true; // Set loading state

        try {
            const response = await fetch("/api/coursequestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: questionText,
                    user_id: $userUuid, // Correctly access the store value
                    course: course,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            questionText = "";
            const newQuestion = await response.json();
            courseQuestions.update((questions) => [newQuestion, ...questions]);
        } catch (error) {
            console.error("Error submitting question:", error);
            alert("There was a problem submitting your question.");
        } finally {
            isLoading = false; // Reset loading state
        }
    };
</script>

<form on:submit={submitQuestion}>
    <input
        type="text"
        bind:value={questionText}
        placeholder="Please enter your question."
    />
    <button
        type="submit"
        disabled={isLoading}
        style="border: 1px solid #000; padding: 8px;"
    >
        {isLoading ? "Submitting..." : "Add Question"}
    </button>
</form>
