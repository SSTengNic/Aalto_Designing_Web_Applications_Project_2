<script>
    import { userUuid } from "../stores/stores.js";
    let questionText = "";
    let isLoading = false;

    const submitQuestion = async (event) => {
        event.preventDefault(); // Prevent the default form submission

        if (questionText === "") {
            return alert("Please input something into the question form.");
        }

        isLoading = true; // Set loading state

        try {
            const response = await fetch("/api/courseonequestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: questionText,
                    user_id: $userUuid, // Correctly access the store value
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            // Optionally, you might want to reset the question text after submission
            questionText = "";
            alert("Question submitted successfully!");
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
    <button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Add Question"}
    </button>
</form>
