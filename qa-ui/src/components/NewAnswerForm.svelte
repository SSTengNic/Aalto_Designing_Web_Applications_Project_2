<script>
    export let question_id, course;
    import { userUuid, questionAnswers } from "../stores/stores.js";
    let answerText = "";
    let isLoading = false;

    const submitAnswer = async (event) => {
        event.preventDefault();

        if (answerText === "") {
            return alert("Please input something into the question form.");
        }
        isLoading = true; // Set loading state

        try {
            const response = await fetch("/api/answers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: answerText,
                    user_id: $userUuid, // Correctly access the store value
                    question_id: question_id,
                    course: course,
                }),
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            answerText = "";
            const newAnswer = await response.json();
            questionAnswers.update((answers) => [newAnswer, ...answers]);
        } catch (error) {
            console.error("Error submitting question:", error);
            alert("There was a problem submitting your question.");
        } finally {
            isLoading = false; // Reset loading state
        }
    };
</script>

<form on:submit={submitAnswer}>
    <input
        type="text"
        bind:value={answerText}
        placeholder="Please enter your answer."
    />
    <button
        type="submit"
        disabled={isLoading}
        style="border: 1px solid #000; padding: 8px;"
    >
        {isLoading ? "Submitting..." : "Add Question"}
    </button>
</form>
