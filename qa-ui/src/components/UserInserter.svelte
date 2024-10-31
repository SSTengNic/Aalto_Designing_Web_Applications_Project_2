<script>
    import { userUuid } from "../stores/stores";
    import { onMount } from "svelte";

    const postUser = async () => {
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: $userUuid }),
            });
            if (!response.ok) throw new Error("Failed to post user.");
        } catch (error) {
            console.error("Error posting user:", error);
        }
    };

    onMount(() => {
        postUser();
    });
</script>

<div>Inserting User...</div>
